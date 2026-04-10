import { escapeHtml } from './escape-html.util';

import type { Annotation, AnnotationHit } from './code-gloss.types';

const SYNTAX_RULES = [
  { pattern: /(\/\/.*)/, className: 'comment' },
  { pattern: /\b(function|const|let|var|if|return|throw|new|while|for|else|class|import|export|from|default|typeof|instanceof|void|null|undefined|true|false)\b/, className: 'keyword' },
  { pattern: /('(?:[^'\\]|\\.)*')/, className: 'string' },
  { pattern: /("(?:[^"\\]|\\.)*")/, className: 'string' },
  { pattern: /(`(?:[^`\\]|\\.)*`)/, className: 'string' },
  { pattern: /\b(\d+(?:\.\d+)?)\b/, className: 'number' },
] as const;

export function highlightPlainText(text: string): string {
  if (text.length === 0) return '';

  for (const rule of SYNTAX_RULES) {
    const match = text.match(rule.pattern);

    if (match && match.index !== undefined) {
      const before = text.slice(0, match.index);
      const matched = match[1];
      const after = text.slice(match.index + match[0].length);

      return (
        highlightPlainText(before) +
        `<span class="cg-${rule.className}">${escapeHtml(matched)}</span>` +
        highlightPlainText(after)
      );
    }
  }

  return escapeHtml(text);
}

export function findAnnotationHits(
  rawLine: string,
  lineIdx: number,
  annotations: Annotation[],
): AnnotationHit[] {
  const lineAnnotations = annotations.filter(
    (ann) => ann.line === lineIdx,
  );
  const hits: AnnotationHit[] = [];

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
          annotation: ann,
        });
        break;
      }

      occurrenceCount++;
      searchFrom = idx + 1;
    }
  }

  hits.sort((a, b) => a.start - b.start);

  const filtered: AnnotationHit[] = [];
  let cursor = 0;

  for (const hit of hits) {
    if (hit.start >= cursor) {
      filtered.push(hit);
      cursor = hit.end;
    }
  }

  return filtered;
}

/**
 * Builds the full HTML for a line using the built-in regex highlighter
 * and annotation mark wrappers. Used when no custom highlighter is provided.
 */
export function buildLineHtmlFallback(
  rawLine: string,
  lineIdx: number,
  annotations: Annotation[],
): string {
  const hits = findAnnotationHits(rawLine, lineIdx, annotations);

  if (hits.length === 0) {
    return highlightPlainText(rawLine);
  }

  let html = '';
  let cursor = 0;

  for (const hit of hits) {
    if (hit.start > cursor) {
      html += highlightPlainText(rawLine.slice(cursor, hit.start));
    }

    html +=
      `<mark class="atk" data-ann-id="${hit.annotation.id}">` +
      escapeHtml(hit.annotation.token) +
      '</mark>';

    cursor = hit.end;
  }

  if (cursor < rawLine.length) {
    html += highlightPlainText(rawLine.slice(cursor));
  }

  return html;
}
