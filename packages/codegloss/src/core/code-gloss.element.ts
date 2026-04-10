import {
  CALLOUT_TRANSITION_MS,
  COPY_FEEDBACK_MS,
  GUTTER_WIDTH,
  RESIZE_DEBOUNCE_MS,
} from './code-gloss.constants';
import { escapeHtml } from './escape-html.util';
import { injectAnnotationsIntoHtml } from './inject-annotations.helpers';
import { drawArcs } from './render/arcs.helpers';
import { run } from './runners.helpers';
import {
  buildLineHtmlFallback,
  findAnnotationHits,
} from './tokenize.helpers';
import { codeGlossStyles } from './code-gloss-styles.generated';

import type {
  Annotation,
  CodeGlossConfig,
  Connection,
  ConnectionTooltipState,
  Highlighter,
  RunResult,
} from './code-gloss.types';

const COPY_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
const CHECK_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

// SSR-safe HTMLElement stub. The real class is only ever instantiated in
// the browser (via customElements.define inside defineCodeGloss).
const SafeHTMLElement: typeof HTMLElement =
  typeof HTMLElement === 'undefined'
    ? (class {} as unknown as typeof HTMLElement)
    : HTMLElement;

// Lazy-init a single constructable stylesheet shared across all instances.
// Lazy because `new CSSStyleSheet()` doesn't exist during SSR.
let sharedStylesheet: CSSStyleSheet | null = null;

function getSharedStylesheet(): CSSStyleSheet {
  if (!sharedStylesheet) {
    sharedStylesheet = new CSSStyleSheet();
    sharedStylesheet.replaceSync(codeGlossStyles);
  }
  return sharedStylesheet;
}

export class CodeGlossElement extends SafeHTMLElement {
  /** Optional custom syntax highlighter — set as a property, not an attribute. */
  highlight: Highlighter | null = null;

  private config: CodeGlossConfig | null = null;
  private activeAnnotationId: string | null = null;
  private connectionTooltip: ConnectionTooltipState | null = null;
  private hasRun = false;
  private highlightedLines: string[] | null = null;

  private readonly shadow: ShadowRoot;
  private root!: HTMLDivElement;
  private codeArea!: HTMLDivElement;
  private svgEl!: SVGSVGElement;
  private preEl!: HTMLPreElement;
  private outputEl!: HTMLDivElement;
  private copyBtn!: HTMLButtonElement;
  private popoverEl!: HTMLDivElement;
  private readonly lineRefs = new Map<number, HTMLDivElement>();

  private resizeTimer: ReturnType<typeof setTimeout> | null = null;
  private copyTimer: ReturnType<typeof setTimeout> | null = null;
  private animationFrameId: number | null = null;
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
    this.config = this.readConfig();

    if (!this.config) {
      this.shadow.innerHTML = '<div style="color:#c00;font-family:monospace;font-size:12px">[code-gloss] missing or invalid config</div>';
      return;
    }

    this.highlightedLines = this.highlight?.(this.config.code, this.config.lang) ?? null;
    this.buildDom();
    this.attachListeners();
  }

  disconnectedCallback(): void {
    window.removeEventListener('resize', this.resizeHandler);
    document.removeEventListener('keydown', this.keyHandler);
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    if (this.copyTimer) clearTimeout(this.copyTimer);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

  private readConfig(): CodeGlossConfig | null {
    const scriptEl = this.querySelector('script[type="application/json"]');

    if (!scriptEl?.textContent) return null;

    try {
      return JSON.parse(scriptEl.textContent) as CodeGlossConfig;
    } catch {
      console.error('[code-gloss] failed to parse JSON config');
      return null;
    }
  }

  private buildDom(): void {
    if (!this.config) return;

    this.root = document.createElement('div');
    this.root.className = 'codegloss';

    const sandbox = document.createElement('div');
    sandbox.className = 'sandboxFrame';
    sandbox.appendChild(this.buildToolbar());

    this.codeArea = document.createElement('div');
    this.codeArea.className = 'codeArea';

    this.svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGSVGElement;
    this.svgEl.setAttribute('class', 'gutterSvg');
    this.svgEl.setAttribute('width', String(GUTTER_WIDTH));
    this.svgEl.setAttribute('aria-hidden', 'true');
    this.codeArea.appendChild(this.svgEl);

    this.preEl = document.createElement('pre');
    this.preEl.className = 'pre';
    this.codeArea.appendChild(this.preEl);

    sandbox.appendChild(this.codeArea);

    this.outputEl = document.createElement('div');
    this.outputEl.className = 'outputStrip';
    this.outputEl.style.display = 'none';
    sandbox.appendChild(this.outputEl);

    this.root.appendChild(sandbox);

    this.popoverEl = document.createElement('div');
    this.popoverEl.className = 'connectionTooltip';
    this.popoverEl.setAttribute('popover', 'auto');
    this.root.appendChild(this.popoverEl);

    this.shadow.appendChild(this.root);

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
      left.appendChild(dot);
    }
    if (this.config.filename) {
      const filename = document.createElement('span');
      filename.className = 'filename';
      filename.textContent = this.config.filename;
      left.appendChild(filename);
    }
    toolbar.appendChild(left);

    const right = document.createElement('div');
    right.className = 'toolbarRight';

    const langBadge = document.createElement('span');
    langBadge.className = 'langBadge';
    langBadge.textContent = this.config.lang;
    right.appendChild(langBadge);

    this.copyBtn = document.createElement('button');
    this.copyBtn.type = 'button';
    this.copyBtn.className = 'copyButton';
    this.copyBtn.setAttribute('aria-label', 'Copy code');
    this.copyBtn.title = 'Copy code';
    this.copyBtn.innerHTML = COPY_ICON;
    right.appendChild(this.copyBtn);

    const isRunnable = this.config.runnable ?? this.config.lang === 'js';
    if (isRunnable) {
      const runBtn = document.createElement('button');
      runBtn.type = 'button';
      runBtn.className = 'runButton';
      runBtn.textContent = '▶ Run';
      runBtn.addEventListener('click', () => this.handleRun(runBtn));
      right.appendChild(runBtn);
    }

    toolbar.appendChild(right);
    return toolbar;
  }

  private renderLines(): void {
    if (!this.config) return;

    const lines = this.config.code.split('\n');
    const annotations = this.config.annotations ?? [];

    this.preEl.innerHTML = '';
    this.lineRefs.clear();

    lines.forEach((rawLine, lineIdx) => {
      const wrapper = document.createElement('div');

      const lineEl = document.createElement('div');
      lineEl.className = 'line';

      const lineNum = document.createElement('span');
      lineNum.className = 'lineNumber';
      lineNum.textContent = String(lineIdx + 1);
      lineEl.appendChild(lineNum);

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
      lineEl.appendChild(lineContent);

      wrapper.appendChild(lineEl);
      this.preEl.appendChild(wrapper);
      this.lineRefs.set(lineIdx, lineEl);

      // Append callout slot after the line if this line has the active annotation
      const activeAnn = this.findAnnotationOnLine(lineIdx);
      if (activeAnn) {
        wrapper.appendChild(this.buildCallout(activeAnn));
      }
    });
  }

  private findAnnotationOnLine(lineIdx: number): Annotation | null {
    if (!this.config?.annotations || !this.activeAnnotationId) return null;
    const ann = this.config.annotations.find(
      (a) => a.id === this.activeAnnotationId && a.line === lineIdx,
    );
    return ann ?? null;
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
    content.appendChild(chip);

    const title = document.createElement('div');
    title.className = 'calloutTitle';
    title.textContent = ann.title;
    content.appendChild(title);

    const body = document.createElement('div');
    body.className = 'calloutBody';
    body.textContent = ann.text;
    content.appendChild(body);

    callout.appendChild(content);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'calloutClose';
    closeBtn.setAttribute('aria-label', 'Close annotation');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => this.dismissCallout());
    callout.appendChild(closeBtn);

    wrapper.appendChild(callout);

    // Trigger the open animation on the next frame
    requestAnimationFrame(() => wrapper.classList.add('calloutOpen'));

    return wrapper;
  }

  private attachListeners(): void {
    // Annotation clicks via event delegation on the pre element
    this.preEl.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const mark = target.closest<HTMLElement>('[data-ann-id]');

      if (!mark) return;

      const annId = mark.dataset.annId;

      if (annId) this.handleAnnotationClick(annId);
    });

    this.copyBtn.addEventListener('click', () => this.handleCopy());

    this.popoverEl.addEventListener('toggle', (event) => {
      const e = event;

      if (e.newState === 'closed') {
        this.connectionTooltip = null;
      }
    });

    window.addEventListener('resize', this.resizeHandler);
    document.addEventListener('keydown', this.keyHandler);
  }

  private handleAnnotationClick(annId: string): void {
    this.activeAnnotationId = this.activeAnnotationId === annId ? null : annId;
    this.renderLines();
    this.animateArcsThroughTransition();
  }

  private dismissCallout(): void {
    if (this.activeAnnotationId === null) return;
    this.activeAnnotationId = null;
    this.renderLines();
    this.animateArcsThroughTransition();
  }

  private readonly handleConnectionClick = (conn: Connection, event: MouseEvent): void => {
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
    navigator.clipboard.writeText(this.config.code);
    this.copyBtn.innerHTML = CHECK_ICON;
    this.copyBtn.setAttribute('aria-label', 'Copied');
    this.copyBtn.title = 'Copied!';
    if (this.copyTimer) clearTimeout(this.copyTimer);
    this.copyTimer = setTimeout(() => {
      this.copyBtn.innerHTML = COPY_ICON;
      this.copyBtn.setAttribute('aria-label', 'Copy code');
      this.copyBtn.title = 'Copy code';
    }, COPY_FEEDBACK_MS);
  }

  private handleRun(runBtn: HTMLButtonElement): void {
    if (!this.config) return;
    const result = run(this.config.lang, this.config.code);
    this.renderOutput(result);
    this.hasRun = true;
    runBtn.textContent = '↻ Run again';
  }

  private renderOutput(result: RunResult): void {
    this.outputEl.innerHTML = '';
    this.outputEl.style.display = 'block';

    const label = document.createElement('span');
    label.className = 'outputLabel';
    label.textContent = 'Output';
    this.outputEl.appendChild(label);

    for (const line of result.lines) {
      const lineEl = document.createElement('div');
      lineEl.className = 'outputLine';
      lineEl.textContent = `> ${line}`;
      this.outputEl.appendChild(lineEl);
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
    if (!this.config?.connections || this.config.connections.length === 0) return;

    const annotationYMap = new Map<string, number>();
    const annotations = this.config.annotations ?? [];

    for (const ann of annotations) {
      const lineEl = this.lineRefs.get(ann.line);
      if (lineEl) {
        const midY = lineEl.offsetTop + lineEl.offsetHeight / 2;
        annotationYMap.set(ann.id, midY);
      }
    }

    drawArcs({
      svg: this.svgEl,
      height: this.codeArea.scrollHeight,
      annotations,
      connections: this.config.connections,
      annotationYMap,
      onConnectionClick: this.handleConnectionClick,
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
  if (!customElements.get('code-gloss')) {
    customElements.define('code-gloss', CodeGlossElement);
  }
}
