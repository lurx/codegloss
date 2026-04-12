import { resolveTheme } from '../themes';
import { buildThemeCss } from '../themes/theme-css.helpers';
import {
	CALLOUT_TRANSITION_MS,
	COPY_FEEDBACK_MS,
	CUSTOM_ELEMENT_NAME,
	GUTTER_WIDTH,
	RESIZE_DEBOUNCE_MS,
} from './code-gloss.constants';
import {
	CHECK_ICON,
	COPIED_LABEL,
	COPIED_TITLE,
	COPY_ICON,
	COPY_LABEL,
	FALLBACK_ERROR_HTML,
	OUTPUT_LABEL,
	RUN_AGAIN_LABEL,
	RUN_LABEL,
} from './code-gloss.strings';
import { escapeHtml } from './escape-html.util';
import { injectAnnotationsIntoHtml } from './inject-annotations.helpers';
import { readConfigFromHost } from './read-config.helpers';
import { drawArcs } from './render/arcs.helpers';
import { run } from './runners.helpers';
import { buildLineHtmlFallback, findAnnotationHits } from './tokenize.helpers';
import { codeGlossStyles } from './code-gloss-styles.generated';
import type {
	Annotation,
	CodeGlossConfig,
	Connection,
	ConnectionTooltipState,
	Highlighter,
	RunResult,
} from './code-gloss.types';

// SSR-safe HTMLElement stub. The real class is only ever instantiated in
// the browser (via customElements.define inside defineCodeGloss).
const SafeHTMLElement: typeof HTMLElement =
	typeof HTMLElement === 'undefined'
		? (class {
				// SSR stub
			} as unknown as typeof HTMLElement)
		: HTMLElement;

// Lazy-init a single constructable stylesheet shared across all instances.
// Lazy because `new CSSStyleSheet()` doesn't exist during SSR.
let sharedStylesheet: CSSStyleSheet | undefined;

function getSharedStylesheet(): CSSStyleSheet {
	if (!sharedStylesheet) {
		sharedStylesheet = new CSSStyleSheet();
		sharedStylesheet.replaceSync(codeGlossStyles);
	}

	return sharedStylesheet;
}

export class CodeGlossElement extends SafeHTMLElement {
	static get observedAttributes(): string[] {
		return ['theme'];
	}

	/** Optional custom syntax highlighter — set as a property, not an attribute. */
	highlight: Highlighter | undefined;

	private config: CodeGlossConfig | undefined;
	private activeAnnotationId: string | undefined;
	private connectionTooltip: ConnectionTooltipState | undefined;
	private highlightedLines: string[] | undefined;
	private themeStylesheet: CSSStyleSheet | undefined;

	private readonly shadow: ShadowRoot;
	private root!: HTMLDivElement;
	private codeArea!: HTMLDivElement;
	private svgEl!: SVGSVGElement;
	private preEl!: HTMLPreElement;
	private outputEl!: HTMLDivElement;
	private copyBtn!: HTMLButtonElement;
	private popoverEl!: HTMLDivElement;
	private readonly lineRefs = new Map<number, HTMLDivElement>();

	private resizeTimer: ReturnType<typeof setTimeout> | undefined;
	private copyTimer: ReturnType<typeof setTimeout> | undefined;
	private animationFrameId: number | undefined;
	private readonly resizeHandler = () => {
		if (this.resizeTimer) clearTimeout(this.resizeTimer);
		this.resizeTimer = setTimeout(() => this.redrawArcs(), RESIZE_DEBOUNCE_MS);
	};

	private readonly keyHandler = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			this.dismissCallout();
		}
	};

	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: 'open' });
		this.shadow.adoptedStyleSheets = [getSharedStylesheet()];
	}

	connectedCallback(): void {
		this.config = readConfigFromHost(this);

		if (!this.config) {
			this.shadow.innerHTML = FALLBACK_ERROR_HTML;
			return;
		}

		// Apply theme from attribute or JSON config
		const themeName = this.getAttribute('theme') ?? this.config.theme;
		if (themeName) {
			this.applyTheme(themeName);
		}

		this.highlightedLines =
			this.highlight?.(this.config.code, this.config.lang) ?? undefined;
		this.buildDom();
		this.attachListeners();
	}

	attributeChangedCallback(
		name: string,
		_oldValue: string | undefined,
		newValue: string | undefined,
	): void {
		if (name === 'theme') {
			this.applyTheme(newValue);
		}
	}

	disconnectedCallback(): void {
		window.removeEventListener('resize', this.resizeHandler);
		document.removeEventListener('keydown', this.keyHandler);
		if (this.resizeTimer) clearTimeout(this.resizeTimer);
		if (this.copyTimer) clearTimeout(this.copyTimer);
		if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
	}


	private applyTheme(themeName: string | undefined): void {
		// Remove existing theme stylesheet if any
		if (this.themeStylesheet) {
			this.shadow.adoptedStyleSheets = this.shadow.adoptedStyleSheets.filter(
				s => s !== this.themeStylesheet,
			);
			this.themeStylesheet = undefined;
		}

		// Ensure the theme attribute is on the host element so the CSS
		// selector :host(:not([theme])) correctly disables base dark-mode.
		if (themeName && this.getAttribute('theme') !== themeName) {
			this.setAttribute('theme', themeName);
		} else if (!themeName && this.hasAttribute('theme')) {
			this.removeAttribute('theme');
		}

		if (!themeName) return;

		const theme = resolveTheme(themeName);
		if (!theme) return;

		const css = buildThemeCss(theme.light, theme.dark);
		if (!css) return;

		this.themeStylesheet = new CSSStyleSheet();
		this.themeStylesheet.replaceSync(css);
		this.shadow.adoptedStyleSheets = [
			...this.shadow.adoptedStyleSheets,
			this.themeStylesheet,
		];
	}

	private buildDom(): void {
		if (!this.config) return;

		this.root = document.createElement('div');
		this.root.className = 'codegloss';

		const sandbox = document.createElement('div');
		sandbox.className = 'sandboxFrame';
		sandbox.append(this.buildToolbar());

		this.codeArea = document.createElement('div');
		this.codeArea.className = 'codeArea';

		this.svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.svgEl.setAttribute('class', 'gutterSvg');
		this.svgEl.setAttribute('width', String(GUTTER_WIDTH));
		this.svgEl.setAttribute('aria-hidden', 'true');
		this.codeArea.append(this.svgEl);

		this.preEl = document.createElement('pre');
		this.preEl.className = 'pre';
		this.codeArea.append(this.preEl);

		sandbox.append(this.codeArea);

		this.outputEl = document.createElement('div');
		this.outputEl.className = 'outputStrip';
		this.outputEl.style.display = 'none';
		sandbox.append(this.outputEl);

		this.root.append(sandbox);

		this.popoverEl = document.createElement('div');
		this.popoverEl.className = 'connectionTooltip';
		this.popoverEl.setAttribute('popover', 'auto');
		this.root.append(this.popoverEl);

		this.shadow.append(this.root);

		this.renderLines();
		requestAnimationFrame(() => this.redrawArcs());
	}

	private buildToolbar(): HTMLDivElement {
		if (!this.config) throw new Error('config required');

		const toolbar = document.createElement('div');
		toolbar.className = 'toolbar';

		const left = document.createElement('div');
		left.className = 'toolbarLeft';
		for (const color of ['red', 'yellow', 'green'] as const) {
			const dot = document.createElement('span');
			dot.className = 'dot';
			dot.dataset.color = color;
			left.append(dot);
		}

		if (this.config.filename) {
			const filename = document.createElement('span');
			filename.className = 'filename';
			filename.textContent = this.config.filename;
			left.append(filename);
		}

		toolbar.append(left);

		const right = document.createElement('div');
		right.className = 'toolbarRight';

		const langBadge = document.createElement('span');
		langBadge.className = 'langBadge';
		langBadge.textContent = this.config.lang;
		right.append(langBadge);

		this.copyBtn = document.createElement('button');
		this.copyBtn.type = 'button';
		this.copyBtn.className = 'copyButton';
		this.copyBtn.setAttribute('aria-label', COPY_LABEL);
		this.copyBtn.title = COPY_LABEL;
		this.copyBtn.innerHTML = COPY_ICON;
		right.append(this.copyBtn);

		const isRunnable = this.config.runnable ?? this.config.lang === 'js';
		if (isRunnable) {
			const runBtn = document.createElement('button');
			runBtn.type = 'button';
			runBtn.className = 'runButton';
			runBtn.textContent = RUN_LABEL;
			runBtn.addEventListener('click', () => this.handleRun(runBtn));
			right.append(runBtn);
		}

		toolbar.append(right);
		return toolbar;
	}

	private renderLines(): void {
		if (!this.config) return;

		const lines = this.config.code.split('\n');
		const annotations = this.config.annotations ?? [];

		this.preEl.innerHTML = '';
		this.lineRefs.clear();

		for (const [lineIdx, rawLine] of lines.entries()) {
			const wrapper = document.createElement('div');

			const lineElement = document.createElement('div');
			lineElement.className = 'line';

			const lineNumber = document.createElement('span');
			lineNumber.className = 'lineNumber';
			lineNumber.textContent = String(lineIdx + 1);
			lineElement.append(lineNumber);

			const lineContent = document.createElement('span');
			lineContent.className = 'lineContent';

			const preHighlighted = this.highlightedLines?.[lineIdx];
			const contentHtml = preHighlighted
				? injectAnnotationsIntoHtml(
						preHighlighted,
						findAnnotationHits(rawLine, lineIdx, annotations),
					)
				: buildLineHtmlFallback(rawLine, lineIdx, annotations);

			lineContent.innerHTML = contentHtml;
			lineElement.append(lineContent);

			wrapper.append(lineElement);
			this.preEl.append(wrapper);
			this.lineRefs.set(lineIdx, lineElement);

			// Append callout slot after the line if this line has the active annotation
			const activeAnn = this.findAnnotationOnLine(lineIdx);
			if (activeAnn) {
				wrapper.append(this.buildCallout(activeAnn));
			}
		}
	}

	private findAnnotationOnLine(lineIdx: number): Annotation | undefined {
		if (!this.config?.annotations || !this.activeAnnotationId) return undefined;
		const ann = this.config.annotations.find(
			a => a.id === this.activeAnnotationId && a.line === lineIdx,
		);
		return ann ?? undefined;
	}

	private buildCallout(ann: Annotation): HTMLDivElement {
		const wrapper = document.createElement('div');
		wrapper.className = 'calloutWrapper';

		const callout = document.createElement('div');
		callout.className = 'callout';

		const content = document.createElement('div');
		content.className = 'calloutContent';

		const chip = document.createElement('span');
		chip.className = 'calloutChip';
		chip.textContent = ann.token;
		content.append(chip);

		const title = document.createElement('div');
		title.className = 'calloutTitle';
		title.textContent = ann.title;
		content.append(title);

		const body = document.createElement('div');
		body.className = 'calloutBody';
		body.textContent = ann.text;
		content.append(body);

		callout.append(content);

		const closeBtn = document.createElement('button');
		closeBtn.type = 'button';
		closeBtn.className = 'calloutClose';
		closeBtn.setAttribute('aria-label', 'Close annotation');
		closeBtn.textContent = '×';
		closeBtn.addEventListener('click', () => this.dismissCallout());
		callout.append(closeBtn);

		wrapper.append(callout);

		// Trigger the open animation on the next frame
		requestAnimationFrame(() => wrapper.classList.add('calloutOpen'));

		return wrapper;
	}

	private attachListeners(): void {
		// Annotation clicks via event delegation on the pre element
		this.preEl.addEventListener('click', event => {
			const target = event.target as HTMLElement;
			const mark = target.closest<HTMLElement>('[data-ann-id]');

			if (!mark) return;

			const { annId } = mark.dataset;

			if (annId) this.handleAnnotationClick(annId);
		});

		this.copyBtn.addEventListener('click', () => this.handleCopy());

		this.popoverEl.addEventListener('toggle', event => {
			if (event.newState === 'closed') {
				this.connectionTooltip = undefined;
			}
		});

		window.addEventListener('resize', this.resizeHandler);
		document.addEventListener('keydown', this.keyHandler);
	}

	private handleAnnotationClick(annId: string): void {
		this.activeAnnotationId =
			this.activeAnnotationId === annId ? undefined : annId;
		this.renderLines();
		this.animateArcsThroughTransition();
	}

	private dismissCallout(): void {
		if (this.activeAnnotationId === undefined) return;
		this.activeAnnotationId = undefined;
		this.renderLines();
		this.animateArcsThroughTransition();
	}

	private readonly handleConnectionClick = (
		conn: Connection,
		event: MouseEvent,
	): void => {
		this.connectionTooltip = {
			connection: conn,
			top: event.clientY,
			left: event.clientX,
		};
		this.renderConnectionPopover();
		this.popoverEl.showPopover();
	};

	private handleCopy(): void {
		if (!this.config) return;
		void navigator.clipboard.writeText(this.config.code);
		this.copyBtn.innerHTML = CHECK_ICON;
		this.copyBtn.setAttribute('aria-label', COPIED_LABEL);
		this.copyBtn.title = COPIED_TITLE;
		if (this.copyTimer) clearTimeout(this.copyTimer);
		this.copyTimer = setTimeout(() => {
			this.copyBtn.innerHTML = COPY_ICON;
			this.copyBtn.setAttribute('aria-label', COPY_LABEL);
			this.copyBtn.title = COPY_LABEL;
		}, COPY_FEEDBACK_MS);
	}

	private handleRun(runBtn: HTMLButtonElement): void {
		if (!this.config) return;
		const result = run(this.config.lang, this.config.code);
		this.renderOutput(result);
		runBtn.textContent = RUN_AGAIN_LABEL;
	}

	private renderOutput(result: RunResult): void {
		this.outputEl.innerHTML = '';
		this.outputEl.style.display = 'block';

		const label = document.createElement('span');
		label.className = 'outputLabel';
		label.textContent = OUTPUT_LABEL;
		this.outputEl.append(label);

		for (const line of result.lines) {
			const lineElement = document.createElement('div');
			lineElement.className = 'outputLine';
			lineElement.textContent = `> ${line}`;
			this.outputEl.append(lineElement);
		}
	}

	private renderConnectionPopover(): void {
		if (!this.connectionTooltip) return;

		const { connection, top, left } = this.connectionTooltip;

		this.popoverEl.style.top = `${top}px`;
		this.popoverEl.style.left = `${left}px`;
		this.popoverEl.style.setProperty('--cg-conn-color', connection.color);

		let inner = '';
		if (connection.title) {
			inner += `<div class="connectionTooltipTitle">${escapeHtml(connection.title)}</div>`;
		}

		if (connection.text) {
			inner += `<div class="connectionTooltipBody">${escapeHtml(connection.text)}</div>`;
		}

		this.popoverEl.innerHTML = inner;
	}

	private redrawArcs(): void {
		if (!this.config?.connections || this.config.connections.length === 0)
			return;

		const annotationYMap = new Map<string, number>();
		const annotations = this.config.annotations ?? [];

		for (const ann of annotations) {
			const lineElement = this.lineRefs.get(ann.line);
			if (lineElement) {
				const midY = lineElement.offsetTop + lineElement.offsetHeight / 2;
				annotationYMap.set(ann.id, midY);
			}
		}

		drawArcs({
			svg: this.svgEl,
			height: this.codeArea.scrollHeight,
			annotations,
			connections: this.config.connections,
			annotationYMap,
			onConnectionClickAction: this.handleConnectionClick,
			arcStyle: this.config.arcs,
		});
	}

	private animateArcsThroughTransition(): void {
		if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

		const start = performance.now();

		const tick = () => {
			this.redrawArcs();

			if (performance.now() - start < CALLOUT_TRANSITION_MS) {
				this.animationFrameId = requestAnimationFrame(tick);
			}
		};

		this.animationFrameId = requestAnimationFrame(tick);
	}
}

export function defineCodeGloss(): void {
	if (typeof customElements === 'undefined') return;
	if (!customElements.get(CUSTOM_ELEMENT_NAME)) {
		customElements.define(CUSTOM_ELEMENT_NAME, CodeGlossElement);
	}
}
