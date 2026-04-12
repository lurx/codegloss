"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  CodeGlossElement: () => CodeGlossElement,
  defineCodeGloss: () => defineCodeGloss
});
module.exports = __toCommonJS(src_exports);

// src/core/code-gloss.constants.ts
var GUTTER_WIDTH = 44;
var ARC_X_STEP = 6;
var ARC_BASE_X = 34;
var ARC_BEND = 12;
var RESIZE_DEBOUNCE_MS = 100;
var CALLOUT_TRANSITION_MS = 220;
var COPY_FEEDBACK_MS = 2e3;

// src/core/escape-html.util.ts
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// src/core/inject-annotations.helpers.ts
function injectAnnotationsIntoHtml(html, hits) {
  if (hits.length === 0) return html;
  const textToHtml = [];
  let inTag = false;
  let inEntity = false;
  for (let i = 0; i < html.length; i++) {
    if (inTag) {
      if (html[i] === ">") inTag = false;
      continue;
    }
    if (html[i] === "<") {
      inTag = true;
      continue;
    }
    if (inEntity) {
      if (html[i] === ";") inEntity = false;
      continue;
    }
    if (html[i] === "&") {
      inEntity = true;
      textToHtml.push(i);
      continue;
    }
    textToHtml.push(i);
  }
  const insertions = [];
  for (const hit of hits) {
    if (hit.start >= textToHtml.length) continue;
    const openAt = textToHtml[hit.start];
    const lastTextIdx = Math.min(hit.end - 1, textToHtml.length - 1);
    const lastHtmlIdx = textToHtml[lastTextIdx];
    const closeAt = findEndOfChar(html, lastHtmlIdx);
    const markOpen = `<mark class="atk" data-ann-id="${hit.annotation.id}">`;
    const markClose = "</mark>";
    insertions.push({ htmlIndex: closeAt, tag: markClose, priority: 1 });
    insertions.push({ htmlIndex: openAt, tag: markOpen, priority: 0 });
  }
  insertions.sort(
    (a, b) => b.htmlIndex - a.htmlIndex || b.priority - a.priority
  );
  let result = html;
  for (const ins of insertions) {
    result = result.slice(0, ins.htmlIndex) + ins.tag + result.slice(ins.htmlIndex);
  }
  return result;
}
function findEndOfChar(html, idx) {
  if (html[idx] === "&") {
    const semi = html.indexOf(";", idx);
    return semi === -1 ? idx + 1 : semi + 1;
  }
  return idx + 1;
}

// src/core/render/arcs.helpers.ts
var SVG_NS = "http://www.w3.org/2000/svg";
function drawArcs({
  svg,
  height,
  connections,
  annotationYMap,
  onConnectionClick
}) {
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", `0 0 ${GUTTER_WIDTH} ${height}`);
  while (svg.firstChild) {
    svg.firstChild.remove();
  }
  connections.forEach((conn, idx) => {
    const fromY = annotationYMap.get(conn.from);
    const toY = annotationYMap.get(conn.to);
    if (fromY === void 0 || toY === void 0) return;
    const xPos = ARC_BASE_X - idx * ARC_X_STEP;
    const interactive = Boolean(conn.text);
    const onClick = interactive ? (event) => onConnectionClick(conn, event) : null;
    const dot1 = createDot(xPos, fromY, conn.color);
    const dot2 = createDot(xPos, toY, conn.color);
    svg.appendChild(dot1);
    svg.appendChild(dot2);
    const path = createArcPath(xPos, fromY, toY, conn.color);
    svg.appendChild(path);
    if (interactive && onClick) {
      const hit = createHitTarget(xPos, fromY, toY);
      hit.addEventListener("click", onClick);
      svg.appendChild(hit);
      dot1.style.cursor = "pointer";
      dot1.style.pointerEvents = "auto";
      dot1.addEventListener("click", onClick);
      dot2.style.cursor = "pointer";
      dot2.style.pointerEvents = "auto";
      dot2.addEventListener("click", onClick);
    }
  });
}
function createDot(cx, cy, color) {
  const circle = document.createElementNS(SVG_NS, "circle");
  circle.setAttribute("cx", String(cx));
  circle.setAttribute("cy", String(cy));
  circle.setAttribute("r", "2.5");
  circle.setAttribute("fill", color);
  circle.setAttribute("opacity", "0.8");
  return circle;
}
function createArcPath(xPos, fromY, toY, color) {
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute(
    "d",
    `M${xPos} ${fromY} C ${ARC_BEND} ${fromY} ${ARC_BEND} ${toY} ${xPos} ${toY}`
  );
  path.setAttribute("stroke", color);
  path.setAttribute("stroke-width", "1.5");
  path.setAttribute("stroke-dasharray", "4 3");
  path.setAttribute("opacity", "0.55");
  path.setAttribute("fill", "none");
  return path;
}
function createHitTarget(xPos, fromY, toY) {
  const hit = document.createElementNS(SVG_NS, "path");
  hit.setAttribute(
    "d",
    `M${xPos} ${fromY} C ${ARC_BEND} ${fromY} ${ARC_BEND} ${toY} ${xPos} ${toY}`
  );
  hit.setAttribute("stroke", "transparent");
  hit.setAttribute("stroke-width", "12");
  hit.setAttribute("fill", "none");
  hit.style.cursor = "pointer";
  hit.style.pointerEvents = "stroke";
  return hit;
}

// src/core/runners.helpers.ts
var runners = {
  js: (code) => {
    const lines = [];
    const originalLog = console.log;
    console.log = (...args) => {
      lines.push(args.map(String).join(" "));
    };
    try {
      new Function(code)();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      lines.push(`Error: ${message}`);
    } finally {
      console.log = originalLog;
    }
    return { lines };
  }
};
function run(lang, code) {
  const runner = runners[lang];
  if (!runner) {
    return { lines: [], error: `No runner for "${lang}"` };
  }
  return runner(code);
}

// src/core/tokenize.helpers.ts
var SYNTAX_RULES = [
  { pattern: /(\/\/.*)/, className: "comment" },
  { pattern: /\b(function|const|let|var|if|return|throw|new|while|for|else|class|import|export|from|default|typeof|instanceof|void|null|undefined|true|false)\b/, className: "keyword" },
  { pattern: /('(?:[^'\\]|\\.)*')/, className: "string" },
  { pattern: /("(?:[^"\\]|\\.)*")/, className: "string" },
  { pattern: /(`(?:[^`\\]|\\.)*`)/, className: "string" },
  { pattern: /\b(\d+(?:\.\d+)?)\b/, className: "number" }
];
function highlightPlainText(text) {
  if (text.length === 0) return "";
  for (const rule of SYNTAX_RULES) {
    const match = text.match(rule.pattern);
    if (match && match.index !== void 0) {
      const before = text.slice(0, match.index);
      const matched = match[1];
      const after = text.slice(match.index + match[0].length);
      return highlightPlainText(before) + `<span class="cg-${rule.className}">${escapeHtml(matched)}</span>` + highlightPlainText(after);
    }
  }
  return escapeHtml(text);
}
function findAnnotationHits(rawLine, lineIdx, annotations) {
  const lineAnnotations = annotations.filter(
    (ann) => ann.line === lineIdx
  );
  const hits = [];
  for (const ann of lineAnnotations) {
    let searchFrom = 0;
    let occurrenceCount = 0;
    while (searchFrom < rawLine.length) {
      const idx = rawLine.indexOf(ann.token, searchFrom);
      if (idx === -1) break;
      if (occurrenceCount === ann.occurrence) {
        hits.push({
          start: idx,
          end: idx + ann.token.length,
          annotation: ann
        });
        break;
      }
      occurrenceCount++;
      searchFrom = idx + 1;
    }
  }
  hits.sort((a, b) => a.start - b.start);
  const filtered = [];
  let cursor = 0;
  for (const hit of hits) {
    if (hit.start >= cursor) {
      filtered.push(hit);
      cursor = hit.end;
    }
  }
  return filtered;
}
function buildLineHtmlFallback(rawLine, lineIdx, annotations) {
  const hits = findAnnotationHits(rawLine, lineIdx, annotations);
  if (hits.length === 0) {
    return highlightPlainText(rawLine);
  }
  let html = "";
  let cursor = 0;
  for (const hit of hits) {
    if (hit.start > cursor) {
      html += highlightPlainText(rawLine.slice(cursor, hit.start));
    }
    html += `<mark class="atk" data-ann-id="${hit.annotation.id}">` + escapeHtml(hit.annotation.token) + "</mark>";
    cursor = hit.end;
  }
  if (cursor < rawLine.length) {
    html += highlightPlainText(rawLine.slice(cursor));
  }
  return html;
}

// src/core/code-gloss-styles.generated.ts
var codeGlossStyles = ":host {\n  --cg-bg: #f8f8f6;\n  --cg-bg-dark: #1e1e1e;\n  --cg-border: #e8e8e6;\n  --cg-border-dark: #3a3a3a;\n  --cg-text: #1a1a1a;\n  --cg-text-dark: #e0e0e0;\n  --cg-muted: #666;\n  --cg-muted-dark: #999;\n  --cg-line-num: #bbb;\n  --cg-line-num-dark: #555;\n  --cg-toolbar-bg: #f8f8f6;\n  --cg-toolbar-bg-dark: #2a2a2a;\n  --cg-badge-bg: #efefed;\n  --cg-badge-bg-dark: #3a3a3a;\n  --cg-badge-text: #999;\n  --cg-ann-bg: rgba(83, 74, 183, 0.12);\n  --cg-ann-bg-dark: rgba(174, 169, 236, 0.12);\n  --cg-ann-border: #534ab7;\n  --cg-ann-border-dark: #afa9ec;\n  --cg-ann-hover: rgba(83, 74, 183, 0.22);\n  --cg-ann-hover-dark: rgba(174, 169, 236, 0.22);\n\n  display: block;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n  position: relative;\n  max-width: 680px;\n}\n\n.codegloss {\n  position: relative;\n}\n\n/* Sandbox frame */\n.sandboxFrame {\n  border: 0.5px solid var(--cg-border);\n  border-radius: 8px;\n  overflow: hidden;\n  background: var(--cg-bg);\n}\n\n/* Toolbar */\n.toolbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  height: 38px;\n  padding: 0 12px;\n  background: var(--cg-toolbar-bg);\n  border-bottom: 0.5px solid var(--cg-border);\n}\n\n.toolbarLeft {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n}\n\n.dot {\n  width: 10px;\n  height: 10px;\n  border-radius: 50%;\n}\n\n.dot[data-color='red'] {\n  background: #ff5f57;\n}\n\n.dot[data-color='yellow'] {\n  background: #febc2e;\n}\n\n.dot[data-color='green'] {\n  background: #28c840;\n}\n\n.filename {\n  margin-left: 10px;\n  font-family: 'SFMono-Regular', Menlo, monospace;\n  font-size: 12px;\n  color: var(--cg-muted);\n}\n\n.toolbarRight {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.langBadge {\n  font-size: 11px;\n  color: var(--cg-badge-text);\n  background: var(--cg-badge-bg);\n  padding: 2px 6px;\n  border-radius: 4px;\n  font-family: 'SFMono-Regular', Menlo, monospace;\n}\n\n.copyButton {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 24px;\n  height: 22px;\n  background: transparent;\n  border: 0.5px solid transparent;\n  border-radius: 4px;\n  color: var(--cg-muted);\n  cursor: pointer;\n  padding: 0;\n  transition: color 120ms ease, background 120ms ease, border-color 120ms ease;\n}\n\n.copyButton:hover {\n  color: var(--cg-text);\n  background: rgba(255, 255, 255, 0.04);\n  border-color: var(--cg-border);\n}\n\n.runButton {\n  font-size: 12px;\n  color: #333;\n  border: 0.5px solid #ccc;\n  border-radius: 6px;\n  background: transparent;\n  padding: 3px 10px;\n  cursor: pointer;\n  font-family: inherit;\n  line-height: 1;\n}\n\n.runButton:hover {\n  background: #f0f0ee;\n}\n\n/* Code area */\n.codeArea {\n  position: relative;\n  overflow-x: auto;\n}\n\n.gutterSvg {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 44px;\n  pointer-events: none;\n  z-index: 1;\n  overflow: visible;\n}\n\n.pre {\n  margin: 0;\n  padding: 14px 0;\n  font-family: 'SFMono-Regular', Menlo, monospace;\n  font-size: 13px;\n  line-height: 22px;\n  background: transparent;\n  overflow: visible;\n}\n\n.line {\n  display: flex;\n  padding: 0 14px 0 0;\n}\n\n.lineNumber {\n  flex-shrink: 0;\n  width: 44px;\n  padding-right: 14px;\n  text-align: right;\n  font-size: 11px;\n  color: var(--cg-line-num);\n  user-select: none;\n  line-height: 22px;\n}\n\n.lineContent {\n  flex: 1;\n  white-space: pre;\n  min-width: 0;\n}\n\n/* Annotated token */\n.atk {\n  background: var(--cg-ann-bg);\n  border-bottom: 1.5px solid var(--cg-ann-border);\n  border-radius: 2px;\n  padding: 0 1px;\n  cursor: pointer;\n  color: inherit;\n  font: inherit;\n}\n\n.atk:hover {\n  background: var(--cg-ann-hover);\n}\n\n/* Connection popover */\n.connectionTooltip {\n  position: fixed;\n  width: 240px;\n  margin: 0;\n  border-radius: 8px;\n  border: 0.5px solid var(--cg-border);\n  border-left: 3px solid var(--cg-conn-color, var(--cg-ann-border));\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);\n  padding: 10px 12px 10px 14px;\n  background: var(--cg-bg);\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n  transform: translate(8px, -8px);\n  inset: unset;\n}\n\n.connectionTooltipTitle {\n  font-size: 12px;\n  font-weight: 600;\n  color: var(--cg-text);\n  margin-bottom: 4px;\n  padding-right: 16px;\n}\n\n.connectionTooltipBody {\n  font-size: 12px;\n  color: var(--cg-muted);\n  line-height: 1.6;\n}\n\n/* Inline callout */\n.calloutWrapper {\n  display: grid;\n  grid-template-rows: 0fr;\n  transition: grid-template-rows 200ms ease;\n}\n\n.calloutWrapper.calloutOpen {\n  grid-template-rows: 1fr;\n}\n\n.callout {\n  display: flex;\n  align-items: flex-start;\n  gap: 8px;\n  padding: 0 14px 0 58px;\n  border-left: 3px solid var(--cg-ann-border);\n  background: var(--cg-ann-bg);\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n  overflow: hidden;\n  opacity: 0;\n  transition: opacity 200ms ease;\n}\n\n.calloutOpen .callout {\n  padding: 8px 14px 8px 58px;\n  opacity: 1;\n}\n\n.calloutContent {\n  flex: 1;\n  min-width: 0;\n}\n\n.calloutChip {\n  display: inline-block;\n  font-family: 'SFMono-Regular', Menlo, monospace;\n  font-size: 11px;\n  color: var(--cg-ann-border);\n  background: rgba(83, 74, 183, 0.08);\n  padding: 1px 5px;\n  border-radius: 4px;\n  margin-bottom: 4px;\n}\n\n.calloutTitle {\n  font-size: 12px;\n  font-weight: 600;\n  color: var(--cg-text);\n  margin-bottom: 2px;\n}\n\n.calloutBody {\n  font-size: 12px;\n  color: var(--cg-muted);\n  line-height: 1.6;\n}\n\n.calloutClose {\n  flex-shrink: 0;\n  background: none;\n  border: none;\n  font-size: 16px;\n  color: var(--cg-muted);\n  cursor: pointer;\n  padding: 0 4px;\n  line-height: 1;\n}\n\n.calloutClose:hover {\n  color: var(--cg-text);\n}\n\n/* Output strip */\n.outputStrip {\n  border-top: 0.5px solid var(--cg-border);\n  padding: 10px 14px 10px 58px;\n}\n\n.outputLabel {\n  display: block;\n  font-size: 10px;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  color: #aaa;\n  margin-bottom: 6px;\n}\n\n.outputLine {\n  font-family: 'SFMono-Regular', Menlo, monospace;\n  font-size: 12.5px;\n  color: var(--cg-text);\n  line-height: 1.6;\n}\n\n/* Syntax highlighting classes */\n.cg-keyword {\n  color: #534ab7;\n}\n\n.cg-string {\n  color: #0f6e56;\n}\n\n.cg-number {\n  color: #ba7517;\n}\n\n.cg-comment {\n  color: #bbb;\n  font-style: italic;\n}\n\n/* Dark mode */\n@media (prefers-color-scheme: dark) {\n  :host {\n    --cg-bg: var(--cg-bg-dark);\n    --cg-border: var(--cg-border-dark);\n    --cg-text: var(--cg-text-dark);\n    --cg-muted: var(--cg-muted-dark);\n    --cg-line-num: var(--cg-line-num-dark);\n    --cg-toolbar-bg: var(--cg-toolbar-bg-dark);\n    --cg-badge-bg: var(--cg-badge-bg-dark);\n    --cg-ann-bg: var(--cg-ann-bg-dark);\n    --cg-ann-border: var(--cg-ann-border-dark);\n    --cg-ann-hover: var(--cg-ann-hover-dark);\n  }\n\n  .runButton {\n    color: #ccc;\n    border-color: #555;\n  }\n\n  .runButton:hover {\n    background: #333;\n  }\n\n  .calloutChip {\n    color: #afa9ec;\n    background: rgba(174, 169, 236, 0.12);\n  }\n\n  .outputLabel {\n    color: #666;\n  }\n\n  .cg-keyword {\n    color: #afa9ec;\n  }\n\n  .cg-string {\n    color: #5dcaa5;\n  }\n\n  .cg-number {\n    color: #ef9f27;\n  }\n\n  .cg-comment {\n    color: #444;\n  }\n}\n";

// src/core/code-gloss.element.ts
var COPY_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
var CHECK_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
var SafeHTMLElement = typeof HTMLElement === "undefined" ? class {
} : HTMLElement;
var sharedStylesheet = null;
function getSharedStylesheet() {
  if (!sharedStylesheet) {
    sharedStylesheet = new CSSStyleSheet();
    sharedStylesheet.replaceSync(codeGlossStyles);
  }
  return sharedStylesheet;
}
var CodeGlossElement = class extends SafeHTMLElement {
  constructor() {
    super();
    /** Optional custom syntax highlighter — set as a property, not an attribute. */
    this.highlight = null;
    this.config = null;
    this.activeAnnotationId = null;
    this.connectionTooltip = null;
    this.hasRun = false;
    this.highlightedLines = null;
    this.lineRefs = /* @__PURE__ */ new Map();
    this.resizeTimer = null;
    this.copyTimer = null;
    this.animationFrameId = null;
    this.resizeHandler = () => {
      if (this.resizeTimer) clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => this.redrawArcs(), RESIZE_DEBOUNCE_MS);
    };
    this.keyHandler = (event) => {
      if (event.key === "Escape") {
        this.dismissCallout();
      }
    };
    this.handleConnectionClick = (conn, event) => {
      this.connectionTooltip = {
        connection: conn,
        top: event.clientY,
        left: event.clientX
      };
      this.renderConnectionPopover();
      this.popoverEl.showPopover();
    };
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.adoptedStyleSheets = [getSharedStylesheet()];
  }
  connectedCallback() {
    this.config = this.readConfig();
    if (!this.config) {
      this.shadow.innerHTML = '<div style="color:#c00;font-family:monospace;font-size:12px">[code-gloss] missing or invalid config</div>';
      return;
    }
    this.highlightedLines = this.highlight?.(this.config.code, this.config.lang) ?? null;
    this.buildDom();
    this.attachListeners();
  }
  disconnectedCallback() {
    window.removeEventListener("resize", this.resizeHandler);
    document.removeEventListener("keydown", this.keyHandler);
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    if (this.copyTimer) clearTimeout(this.copyTimer);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }
  readConfig() {
    const scriptEl = this.querySelector('script[type="application/json"]');
    if (!scriptEl?.textContent) return null;
    try {
      return JSON.parse(scriptEl.textContent);
    } catch {
      console.error("[code-gloss] failed to parse JSON config");
      return null;
    }
  }
  buildDom() {
    if (!this.config) return;
    this.root = document.createElement("div");
    this.root.className = "codegloss";
    const sandbox = document.createElement("div");
    sandbox.className = "sandboxFrame";
    sandbox.appendChild(this.buildToolbar());
    this.codeArea = document.createElement("div");
    this.codeArea.className = "codeArea";
    this.svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svgEl.setAttribute("class", "gutterSvg");
    this.svgEl.setAttribute("width", String(GUTTER_WIDTH));
    this.svgEl.setAttribute("aria-hidden", "true");
    this.codeArea.appendChild(this.svgEl);
    this.preEl = document.createElement("pre");
    this.preEl.className = "pre";
    this.codeArea.appendChild(this.preEl);
    sandbox.appendChild(this.codeArea);
    this.outputEl = document.createElement("div");
    this.outputEl.className = "outputStrip";
    this.outputEl.style.display = "none";
    sandbox.appendChild(this.outputEl);
    this.root.appendChild(sandbox);
    this.popoverEl = document.createElement("div");
    this.popoverEl.className = "connectionTooltip";
    this.popoverEl.setAttribute("popover", "auto");
    this.root.appendChild(this.popoverEl);
    this.shadow.appendChild(this.root);
    this.renderLines();
    requestAnimationFrame(() => this.redrawArcs());
  }
  buildToolbar() {
    if (!this.config) throw new Error("config required");
    const toolbar = document.createElement("div");
    toolbar.className = "toolbar";
    const left = document.createElement("div");
    left.className = "toolbarLeft";
    for (const color of ["red", "yellow", "green"]) {
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.dataset.color = color;
      left.appendChild(dot);
    }
    if (this.config.filename) {
      const filename = document.createElement("span");
      filename.className = "filename";
      filename.textContent = this.config.filename;
      left.appendChild(filename);
    }
    toolbar.appendChild(left);
    const right = document.createElement("div");
    right.className = "toolbarRight";
    const langBadge = document.createElement("span");
    langBadge.className = "langBadge";
    langBadge.textContent = this.config.lang;
    right.appendChild(langBadge);
    this.copyBtn = document.createElement("button");
    this.copyBtn.type = "button";
    this.copyBtn.className = "copyButton";
    this.copyBtn.setAttribute("aria-label", "Copy code");
    this.copyBtn.title = "Copy code";
    this.copyBtn.innerHTML = COPY_ICON;
    right.appendChild(this.copyBtn);
    const isRunnable = this.config.runnable ?? this.config.lang === "js";
    if (isRunnable) {
      const runBtn = document.createElement("button");
      runBtn.type = "button";
      runBtn.className = "runButton";
      runBtn.textContent = "\u25B6 Run";
      runBtn.addEventListener("click", () => this.handleRun(runBtn));
      right.appendChild(runBtn);
    }
    toolbar.appendChild(right);
    return toolbar;
  }
  renderLines() {
    if (!this.config) return;
    const lines = this.config.code.split("\n");
    const annotations = this.config.annotations ?? [];
    this.preEl.innerHTML = "";
    this.lineRefs.clear();
    lines.forEach((rawLine, lineIdx) => {
      const wrapper = document.createElement("div");
      const lineEl = document.createElement("div");
      lineEl.className = "line";
      const lineNum = document.createElement("span");
      lineNum.className = "lineNumber";
      lineNum.textContent = String(lineIdx + 1);
      lineEl.appendChild(lineNum);
      const lineContent = document.createElement("span");
      lineContent.className = "lineContent";
      const preHighlighted = this.highlightedLines?.[lineIdx];
      const contentHtml = preHighlighted ? injectAnnotationsIntoHtml(
        preHighlighted,
        findAnnotationHits(rawLine, lineIdx, annotations)
      ) : buildLineHtmlFallback(rawLine, lineIdx, annotations);
      lineContent.innerHTML = contentHtml;
      lineEl.appendChild(lineContent);
      wrapper.appendChild(lineEl);
      this.preEl.appendChild(wrapper);
      this.lineRefs.set(lineIdx, lineEl);
      const activeAnn = this.findAnnotationOnLine(lineIdx);
      if (activeAnn) {
        wrapper.appendChild(this.buildCallout(activeAnn));
      }
    });
  }
  findAnnotationOnLine(lineIdx) {
    if (!this.config?.annotations || !this.activeAnnotationId) return null;
    const ann = this.config.annotations.find(
      (a) => a.id === this.activeAnnotationId && a.line === lineIdx
    );
    return ann ?? null;
  }
  buildCallout(ann) {
    const wrapper = document.createElement("div");
    wrapper.className = "calloutWrapper";
    const callout = document.createElement("div");
    callout.className = "callout";
    const content = document.createElement("div");
    content.className = "calloutContent";
    const chip = document.createElement("span");
    chip.className = "calloutChip";
    chip.textContent = ann.token;
    content.appendChild(chip);
    const title = document.createElement("div");
    title.className = "calloutTitle";
    title.textContent = ann.title;
    content.appendChild(title);
    const body = document.createElement("div");
    body.className = "calloutBody";
    body.textContent = ann.text;
    content.appendChild(body);
    callout.appendChild(content);
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "calloutClose";
    closeBtn.setAttribute("aria-label", "Close annotation");
    closeBtn.textContent = "\xD7";
    closeBtn.addEventListener("click", () => this.dismissCallout());
    callout.appendChild(closeBtn);
    wrapper.appendChild(callout);
    requestAnimationFrame(() => wrapper.classList.add("calloutOpen"));
    return wrapper;
  }
  attachListeners() {
    this.preEl.addEventListener("click", (event) => {
      const target = event.target;
      const mark = target.closest("[data-ann-id]");
      if (!mark) return;
      const annId = mark.dataset.annId;
      if (annId) this.handleAnnotationClick(annId);
    });
    this.copyBtn.addEventListener("click", () => this.handleCopy());
    this.popoverEl.addEventListener("toggle", (event) => {
      const e = event;
      if (e.newState === "closed") {
        this.connectionTooltip = null;
      }
    });
    window.addEventListener("resize", this.resizeHandler);
    document.addEventListener("keydown", this.keyHandler);
  }
  handleAnnotationClick(annId) {
    this.activeAnnotationId = this.activeAnnotationId === annId ? null : annId;
    this.renderLines();
    this.animateArcsThroughTransition();
  }
  dismissCallout() {
    if (this.activeAnnotationId === null) return;
    this.activeAnnotationId = null;
    this.renderLines();
    this.animateArcsThroughTransition();
  }
  handleCopy() {
    if (!this.config) return;
    navigator.clipboard.writeText(this.config.code);
    this.copyBtn.innerHTML = CHECK_ICON;
    this.copyBtn.setAttribute("aria-label", "Copied");
    this.copyBtn.title = "Copied!";
    if (this.copyTimer) clearTimeout(this.copyTimer);
    this.copyTimer = setTimeout(() => {
      this.copyBtn.innerHTML = COPY_ICON;
      this.copyBtn.setAttribute("aria-label", "Copy code");
      this.copyBtn.title = "Copy code";
    }, COPY_FEEDBACK_MS);
  }
  handleRun(runBtn) {
    if (!this.config) return;
    const result = run(this.config.lang, this.config.code);
    this.renderOutput(result);
    this.hasRun = true;
    runBtn.textContent = "\u21BB Run again";
  }
  renderOutput(result) {
    this.outputEl.innerHTML = "";
    this.outputEl.style.display = "block";
    const label = document.createElement("span");
    label.className = "outputLabel";
    label.textContent = "Output";
    this.outputEl.appendChild(label);
    for (const line of result.lines) {
      const lineEl = document.createElement("div");
      lineEl.className = "outputLine";
      lineEl.textContent = `> ${line}`;
      this.outputEl.appendChild(lineEl);
    }
  }
  renderConnectionPopover() {
    if (!this.connectionTooltip) return;
    const { connection, top, left } = this.connectionTooltip;
    this.popoverEl.style.top = `${top}px`;
    this.popoverEl.style.left = `${left}px`;
    this.popoverEl.style.setProperty("--cg-conn-color", connection.color);
    let inner = "";
    if (connection.title) {
      inner += `<div class="connectionTooltipTitle">${escapeHtml(connection.title)}</div>`;
    }
    if (connection.text) {
      inner += `<div class="connectionTooltipBody">${escapeHtml(connection.text)}</div>`;
    }
    this.popoverEl.innerHTML = inner;
  }
  redrawArcs() {
    if (!this.config?.connections || this.config.connections.length === 0) return;
    const annotationYMap = /* @__PURE__ */ new Map();
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
      onConnectionClick: this.handleConnectionClick
    });
  }
  animateArcsThroughTransition() {
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
};
function defineCodeGloss() {
  if (typeof customElements === "undefined") return;
  if (!customElements.get("code-gloss")) {
    customElements.define("code-gloss", CodeGlossElement);
  }
}

// src/index.ts
defineCodeGloss();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CodeGlossElement,
  defineCodeGloss
});
