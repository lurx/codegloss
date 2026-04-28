import { resolveTheme } from '../themes';
import { buildThemeCss } from '../themes/theme-css.helpers';
import {
	CALLOUT_TRANSITION_MS,
	COPY_FEEDBACK_MS,
	CUSTOM_ELEMENT_NAME,
	GUTTER_WIDTH,
	RESIZE_DEBOUNCE_MS,
} from './code-gloss.constants';
import { CHECK_ICON, COPY_ICON } from './code-gloss.strings';
import { escapeHtml } from './escape-html.util';
import { getLabels } from './labels.helpers';
import { injectAnnotationsIntoHtml } from './inject-annotations.helpers';
import { measureTextRight } from './measure-line-end.helpers';
import { readConfigFromHost } from './read-config.helpers';
import { drawArcs } from './render/arcs.helpers';
import type { AnnotationPosition } from './render/arcs.types';
import { buildLineHtmlFallback, findAnnotationHits } from './tokenize.helpers';
import { splitHighlightedLines } from './split-lines.helpers';
import { codeGlossStyles } from './code-gloss-styles.generated';
import type {
	Annotation,
	CodeGlossConfig,
	Connection,
	ConnectionTooltipState,
	Highlighter,
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

	/**
	 * Optional custom syntax highlighter — set as a property, not an attribute.
	 * Declared (not initialized) so `setDefaultHighlighter()` can install the
	 * highlighter on the prototype without instance fields shadowing it.
	 */
	declare highlight: Highlighter | undefined;

	private config: CodeGlossConfig | undefined;
	private activeAnnotationId: string | undefined;
	private connectionTooltip: ConnectionTooltipState | undefined;
	private highlightedLines: string[] | undefined;
	private themeStylesheet: CSSStyleSheet | undefined;

	private readonly shadow: ShadowRoot;
	private root!: HTMLDivElement;
	private codeArea!: HTMLDivElement;
	private svgEl!: SVGSVGElement;
	private rightSvgEl!: SVGSVGElement;
	private preEl!: HTMLPreElement;
	private copyBtn!: HTMLButtonElement;
	private popoverEl!: HTMLDivElement;
	private annotationPopoverEl!: HTMLDivElement;
	private annotationPopoverState:
		| { annId: string; top: number; left: number }
		| undefined;
	private readonly lineRefs = new Map<number, HTMLDivElement>();

	private resizeTimer: ReturnType<typeof setTimeout> | undefined;
	private copyTimer: ReturnType<typeof setTimeout> | undefined;
	private animationFrameId: number | undefined;
	private resizeObserver: ResizeObserver | undefined;
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
			this.shadow.innerHTML = `<div style="color:#c00;font-family:monospace;font-size:12px">${escapeHtml(getLabels().invalidConfig)}</div>`;
			return;
		}

		// Apply theme from attribute or JSON config
		const themeName = this.getAttribute('theme') ?? this.config.theme;
		if (themeName) {
			this.applyTheme(themeName);
		}

		// Prefer pre-highlighted HTML from the config (baked at build time by
		// the remark plugin or a wrapper's highlight prop); fall back to the
		// runtime `highlight` property. Either source may also expose chrome
		// colors that we apply as host CSS variables — codegloss itself
		// ships no opinion on token or background colors.
		let highlighted: string | undefined = this.config.highlightedHtml;
		let chromeBackground: string | undefined = this.config.highlightBackground;
		let chromeColor: string | undefined = this.config.highlightColor;

		if (highlighted === undefined && this.highlight) {
			const result = this.highlight(this.config.code, this.config.lang);
			if (typeof result === 'string') {
				highlighted = result;
			} else {
				highlighted = result.html;
				chromeBackground = result.background ?? chromeBackground;
				chromeColor = result.color ?? chromeColor;
			}
		}

		this.highlightedLines =
			highlighted === undefined
				? undefined
				: splitHighlightedLines(highlighted);

		this.primeInlineDefaultOpen();
		this.buildDom();
		// Apply chrome colors AFTER buildDom so they land on the shadow-internal
		// root instead of the host's inline style attribute — writing them on
		// the host would diverge from server-rendered HTML and trip React's
		// hydration check.
		if (this.root) {
			if (chromeBackground)
				this.root.style.setProperty('--cg-bg', chromeBackground);
			if (chromeColor) this.root.style.setProperty('--cg-text', chromeColor);
		}
		this.attachListeners();
		this.applyFloatingDefaultOpens();
	}

	/**
	 * If an annotation is marked `defaultOpen: true` and is in the inline
	 * callout mode, set it as active *before* the initial renderLines so
	 * the callout is included in the first paint. Runs pre-DOM-build so
	 * we don't do a wasted second render.
	 *
	 * Last-wins: if multiple annotations are marked, the last one in the
	 * array takes effect (CSS-cascade style).
	 */
	private primeInlineDefaultOpen(): void {
		const ann = this.findLastDefaultOpenAnnotation();
		if (!ann) return;
		if (this.shouldUsePopoverFor(ann)) return;
		this.activeAnnotationId = ann.id;
	}

	/**
	 * Opens the winning popover annotation and winning connection
	 * pre-open after the DOM is laid out and arcs are drawn. Annotation
	 * and connection popovers are independent surfaces, so one of each
	 * can land open.
	 */
	private applyFloatingDefaultOpens(): void {
		requestAnimationFrame(() => {
			this.openDefaultAnnotationPopoverIfAny();
			this.openDefaultConnectionIfAny();
		});
	}

	attributeChangedCallback(
		name: string,
		_oldValue: string | undefined,
		newValue: string | undefined,
	): void {
		// Guard only matters if observedAttributes grows beyond ['theme'].
		/* c8 ignore next */
		if (name === 'theme') {
			this.applyTheme(newValue);
		}
	}

	disconnectedCallback(): void {
		window.removeEventListener('resize', this.resizeHandler);
		document.removeEventListener('keydown', this.keyHandler);
		this.resizeObserver?.disconnect();
		this.resizeObserver = undefined;
		if (this.resizeTimer) clearTimeout(this.resizeTimer);
		if (this.copyTimer) clearTimeout(this.copyTimer);
		if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
	}

	/**
	 * Tear the block down and re-run the full init flow. Call this after
	 * swapping `.highlight` on already-mounted instances — for example when
	 * an async highlighter like Shiki finishes loading.
	 */
	refresh(): void {
		this.disconnectedCallback();
		this.shadow.innerHTML = '';
		this.connectedCallback();
	}

	private applyTheme(themeName: string | undefined): void {
		// Remove existing theme stylesheet if any
		if (this.themeStylesheet) {
			this.shadow.adoptedStyleSheets = this.shadow.adoptedStyleSheets.filter(
				s => s !== this.themeStylesheet,
			);
			this.themeStylesheet = undefined;
		}

		// Mirror the theme attribute onto the host so the CSS selector
		// `:host(:not([theme]))` correctly disables base dark-mode. The
		// no-theme case is already handled by the removal that triggered
		// this callback — attributeChangedCallback fires after the mutation.
		if (themeName && this.getAttribute('theme') !== themeName) {
			this.setAttribute('theme', themeName);
		}

		if (!themeName) return;

		const theme = resolveTheme(themeName);
		if (!theme) return;

		const css = buildThemeCss(theme.light, theme.dark);
		// Every bundled theme has at least one variant; the empty case is
		// unreachable via resolveTheme but kept as a guard against future
		// registries that could return sparse themes.
		/* c8 ignore next */
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

		this.rightSvgEl = document.createElementNS(
			'http://www.w3.org/2000/svg',
			'svg',
		);
		this.rightSvgEl.setAttribute('class', 'rightSvg');
		this.rightSvgEl.setAttribute('aria-hidden', 'true');
		this.codeArea.append(this.rightSvgEl);

		this.preEl = document.createElement('pre');
		this.preEl.className = 'pre';
		this.codeArea.append(this.preEl);

		sandbox.append(this.codeArea);

		this.root.append(sandbox);

		this.popoverEl = document.createElement('div');
		this.popoverEl.className = 'connectionTooltip';
		this.popoverEl.setAttribute('popover', 'auto');
		this.root.append(this.popoverEl);

		this.annotationPopoverEl = document.createElement('div');
		this.annotationPopoverEl.className = 'annotationPopover';
		this.annotationPopoverEl.setAttribute('popover', 'auto');
		this.root.append(this.annotationPopoverEl);

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

		const labels = getLabels();
		this.copyBtn = document.createElement('button');
		this.copyBtn.type = 'button';
		this.copyBtn.className = 'copyButton';
		this.copyBtn.setAttribute('aria-label', labels.copy);
		this.copyBtn.title = labels.copy;
		this.copyBtn.innerHTML = COPY_ICON;
		right.append(this.copyBtn);

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
		closeBtn.setAttribute('aria-label', getLabels().closeAnnotation);
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

			if (annId) this.handleAnnotationClick(annId, event);
		});

		this.copyBtn.addEventListener('click', () => this.handleCopy());

		this.popoverEl.addEventListener('toggle', event => {
			if (event.newState === 'closed') {
				this.connectionTooltip = undefined;
			}
		});

		this.annotationPopoverEl.addEventListener('toggle', event => {
			if (event.newState === 'closed') {
				this.annotationPopoverState = undefined;
			}
		});

		window.addEventListener('resize', this.resizeHandler);
		document.addEventListener('keydown', this.keyHandler);

		// Also redraw when the host's own size changes — e.g. when the component
		// mounts inside a hidden <dialog> and only gains layout once the dialog
		// is opened. Window resize alone never fires for that transition.
		this.resizeObserver = new ResizeObserver(this.resizeHandler);
		this.resizeObserver.observe(this);
	}

	private handleAnnotationClick(annId: string, event: MouseEvent): void {
		const annotation = this.config?.annotations?.find(a => a.id === annId);
		if (!annotation) return;

		if (this.shouldUsePopoverFor(annotation)) {
			this.toggleAnnotationPopover(annotation, event);
			return;
		}

		// Inline callout mode — inline and annotation-popover are mutually
		// exclusive for the same session, so close any open popover first.
		this.closeAnnotationPopover();
		this.activeAnnotationId =
			this.activeAnnotationId === annId ? undefined : annId;
		this.renderLines();
		this.animateArcsThroughTransition();
	}

	private shouldUsePopoverFor(annotation: Annotation): boolean {
		return annotation.popover ?? this.config?.callouts?.popover ?? false;
	}

	private toggleAnnotationPopover(
		annotation: Annotation,
		event: MouseEvent,
	): void {
		// Close the inline callout if one is showing — inline + popover are
		// mutually exclusive for annotations.
		if (this.activeAnnotationId !== undefined) {
			this.activeAnnotationId = undefined;
			this.renderLines();
		}

		if (this.annotationPopoverState?.annId === annotation.id) {
			this.closeAnnotationPopover();
			return;
		}

		this.annotationPopoverState = {
			annId: annotation.id,
			top: event.clientY,
			left: event.clientX,
		};
		this.renderAnnotationPopover();
		this.annotationPopoverEl.showPopover();
	}

	private renderAnnotationPopover(): void {
		// Defensive: callers (toggleAnnotationPopover) already verified both;
		// kept as a guard in case a future caller forgets.
		/* c8 ignore next */
		if (!this.annotationPopoverState || !this.config?.annotations) return;

		const annotation = this.config.annotations.find(
			a => a.id === this.annotationPopoverState!.annId,
		);
		/* c8 ignore next */
		if (!annotation) return;

		const { top, left } = this.annotationPopoverState;
		this.annotationPopoverEl.style.top = `${top}px`;
		this.annotationPopoverEl.style.left = `${left}px`;

		let inner = `<div class="annotationPopoverTitle">${escapeHtml(annotation.title)}</div>`;
		if (annotation.text) {
			inner += `<div class="annotationPopoverBody">${escapeHtml(annotation.text)}</div>`;
		}

		this.annotationPopoverEl.innerHTML = inner;
	}

	private closeAnnotationPopover(): void {
		if (!this.annotationPopoverState) return;
		this.annotationPopoverEl.hidePopover();
		this.annotationPopoverState = undefined;
	}

	private findLastDefaultOpenAnnotation(): Annotation | undefined {
		const anns = this.config?.annotations;
		if (!anns) return undefined;
		for (let i = anns.length - 1; i >= 0; i--) {
			if (anns[i].defaultOpen) return anns[i];
		}
		return undefined;
	}

	private findLastDefaultOpenConnection(): Connection | undefined {
		const conns = this.config?.connections;
		if (!conns) return undefined;
		for (let i = conns.length - 1; i >= 0; i--) {
			if (conns[i].defaultOpen) return conns[i];
		}
		return undefined;
	}

	private openDefaultAnnotationPopoverIfAny(): void {
		const ann = this.findLastDefaultOpenAnnotation();
		if (!ann || !this.shouldUsePopoverFor(ann)) return;

		const mark = this.preEl.querySelector<HTMLElement>(
			`mark[data-ann-id="${ann.id}"]`,
		);
		if (!mark) return;

		const rect = mark.getBoundingClientRect();
		this.annotationPopoverState = {
			annId: ann.id,
			top: rect.top + rect.height / 2,
			left: rect.right,
		};
		this.renderAnnotationPopover();
		this.annotationPopoverEl.showPopover();
	}

	private openDefaultConnectionIfAny(): void {
		const conn = this.findLastDefaultOpenConnection();
		if (!conn?.text) return;

		const { top, left } = this.computeConnectionAnchor(conn);
		this.connectionTooltip = { connection: conn, top, left };
		this.renderConnectionPopover();
		this.popoverEl.showPopover();
	}

	/**
	 * Picks a reasonable viewport anchor for a pre-opened arc popover:
	 * the midpoint between the two annotation lines, offset into the
	 * gutter so it doesn't overlap the code.
	 */
	private computeConnectionAnchor(conn: Connection): {
		top: number;
		left: number;
	} {
		// This only runs from openDefaultConnectionIfAny, which already
		// proved the config + connection exist. A block with connections
		// but no annotations is nonsensical but guarded against anyway.
		/* c8 ignore next */
		const annotations = this.config?.annotations ?? [];
		const fromLine = this.lineRefs.get(
			annotations.find(a => a.id === conn.from)?.line ?? -1,
		);
		const toLine = this.lineRefs.get(
			annotations.find(a => a.id === conn.to)?.line ?? -1,
		);
		const fromRect = fromLine?.getBoundingClientRect();
		const toRect = toLine?.getBoundingClientRect();
		const codeAreaRect = this.codeArea.getBoundingClientRect();

		const midY =
			fromRect && toRect
				? (fromRect.top +
						fromRect.height / 2 +
						toRect.top +
						toRect.height / 2) /
					2
				: codeAreaRect.top + codeAreaRect.height / 2;

		const left = conn.side === 'right' ? codeAreaRect.right : codeAreaRect.left;

		return { top: midY, left };
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
		const labels = getLabels();
		this.copyBtn.innerHTML = CHECK_ICON;
		this.copyBtn.setAttribute('aria-label', labels.copied);
		this.copyBtn.title = labels.copiedTitle;
		if (this.copyTimer) clearTimeout(this.copyTimer);
		this.copyTimer = setTimeout(() => {
			this.copyBtn.innerHTML = COPY_ICON;
			this.copyBtn.setAttribute('aria-label', labels.copy);
			this.copyBtn.title = labels.copy;
		}, COPY_FEEDBACK_MS);
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

		const annotationPositions = new Map<string, AnnotationPosition>();
		const annotations = this.config.annotations ?? [];
		const codeAreaRect = this.codeArea.getBoundingClientRect();

		for (const ann of annotations) {
			const lineElement = this.lineRefs.get(ann.line);
			if (!lineElement) continue;

			const midY = lineElement.offsetTop + lineElement.offsetHeight / 2;
			const lineContent =
				lineElement.querySelector<HTMLElement>('.lineContent');
			// .lineContent is a flex:1 box that stretches to fill the row, so
			// its own bounding rect doesn't mark where text actually ends.
			// A Range over its children gives us the true text extent.
			/* c8 ignore next */
			const textRight = lineContent ? measureTextRight(lineContent) : 0;
			const lineEndX = textRight - codeAreaRect.left + this.codeArea.scrollLeft;

			annotationPositions.set(ann.id, { y: midY, lineEndX });
		}

		drawArcs({
			leftSvg: this.svgEl,
			rightSvg: this.rightSvgEl,
			// Measure the `.pre` directly rather than `codeArea.scroll*` —
			// the SVGs are absolute children of `codeArea`, so reading
			// scrollHeight / scrollWidth would fold their own dimensions
			// back in and create a feedback loop that leaves stale height
			// when an inline callout is opened and then dismissed.
			height: this.preEl.offsetHeight,
			rightSvgWidth: this.preEl.scrollWidth,
			annotations,
			connections: this.config.connections,
			annotationPositions,
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
