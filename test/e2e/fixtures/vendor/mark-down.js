/**
 * mark-down.js
 * Vanilla JS library that renders <mark-down> elements as HTML.
 * Usage: <mark-down>## Hello\n\nSome **bold** text.</mark-down>
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Parser: Markdown -> HTML (no dependencies)
  // ---------------------------------------------------------------------------

  function parseMarkdown(md) {
    // Normalize line endings
    let src = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Preserve code blocks before any other processing
    const codeBlocks = [];
    src = src.replace(/```([\w]*)\n?([\s\S]*?)```/g, function (_, lang, code) {
      const idx = codeBlocks.length;
      codeBlocks.push(
        '<pre><code' + (lang ? ' class="language-' + escapeHtml(lang) + '"' : '') + '>' +
        escapeHtml(code.replace(/^\n/, '').replace(/\n$/, '')) +
        '</code></pre>'
      );
      return '\x00CODE' + idx + '\x00';
    });

    // Inline code (must come before other inline processing)
    const inlineCodes = [];
    src = src.replace(/`([^`]+)`/g, function (_, code) {
      const idx = inlineCodes.length;
      inlineCodes.push('<code>' + escapeHtml(code) + '</code>');
      return '\x00INLINE' + idx + '\x00';
    });

    const lines = src.split('\n');
    const output = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Blank line
      if (line.trim() === '') {
        i++;
        continue;
      }

      // Fenced code block placeholder
      if (/^\x00CODE\d+\x00$/.test(line.trim())) {
        output.push(line.trim());
        i++;
        continue;
      }

      // Headings
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        output.push('<h' + level + '>' + inlineFormat(headingMatch[2], inlineCodes) + '</h' + level + '>');
        i++;
        continue;
      }

      // Horizontal rule
      if (/^(\*{3,}|-{3,}|_{3,})$/.test(line.trim())) {
        output.push('<hr>');
        i++;
        continue;
      }

      // Blockquote / Callout
      if (/^>\s?/.test(line)) {
        const quoteLines = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) {
          quoteLines.push(lines[i].replace(/^>\s?/, ''));
          i++;
        }

        // GitHub-style callout: first line is [!TYPE]
        const calloutMatch = quoteLines[0] && quoteLines[0].match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]$/i);
        if (calloutMatch) {
          const type = calloutMatch[1].toLowerCase();
          const labels = { note: 'Note', tip: 'Tip', important: 'Important', warning: 'Warning', caution: 'Caution' };
          const icons = {
            note:      '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/></svg>',
            tip:       '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"/></svg>',
            important: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/></svg>',
            warning:   '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/></svg>',
            caution:   '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/></svg>'
          };
          output.push(
            '<div class="callout callout-' + type + '" role="note">' +
            '<p class="callout-title">' + icons[type] + ' ' + labels[type] + '</p>' +
            parseMarkdown(quoteLines.slice(1).join('\n')) +
            '</div>'
          );
        } else {
          output.push('<blockquote>' + parseMarkdown(quoteLines.join('\n')) + '</blockquote>');
        }
        continue;
      }

      // Unordered or ordered list (including nested)
      if (/^[-*+]\s/.test(line) || /^\d+\.\s/.test(line)) {
        const listLines = [line];
        i++;
        while (i < lines.length) {
          const l = lines[i];
          if (l.trim() === '') break;
          if (/^\s+/.test(l) || /^[-*+]\s/.test(l) || /^\d+\.\s/.test(l)) {
            listLines.push(l);
            i++;
          } else {
            break;
          }
        }
        output.push(parseListLines(listLines, inlineCodes));
        continue;
      }

      // Table (header row | --- row | data rows)
      if (i + 1 < lines.length && /^\|?[\s\-|:]+\|?$/.test(lines[i + 1]) && lines[i].includes('|')) {
        const headerCells = parseTableRow(lines[i]);
        i += 2; // skip separator
        const rows = [];
        while (i < lines.length && lines[i].includes('|')) {
          rows.push(parseTableRow(lines[i]));
          i++;
        }
        let table = '<table><thead><tr>';
        headerCells.forEach(function (cell) {
          table += '<th>' + inlineFormat(cell, inlineCodes) + '</th>';
        });
        table += '</tr></thead>';
        if (rows.length) {
          table += '<tbody>';
          rows.forEach(function (row) {
            table += '<tr>';
            row.forEach(function (cell) {
              table += '<td>' + inlineFormat(cell, inlineCodes) + '</td>';
            });
            table += '</tr>';
          });
          table += '</tbody>';
        }
        table += '</table>';
        output.push(table);
        continue;
      }

      // Paragraph (collect consecutive non-special lines)
      const paraLines = [];
      while (
        i < lines.length &&
        lines[i].trim() !== '' &&
        !/^#{1,6}\s/.test(lines[i]) &&
        !/^[-*+]\s/.test(lines[i]) &&
        !/^\d+\.\s/.test(lines[i]) &&
        !/^>\s?/.test(lines[i]) &&
        !/^(\*{3,}|-{3,}|_{3,})$/.test(lines[i].trim()) &&
        !/^\x00CODE\d+\x00$/.test(lines[i].trim())
      ) {
        paraLines.push(lines[i]);
        i++;
      }
      if (paraLines.length) {
        // Hard line breaks: two trailing spaces become <br>
        const paraHtml = paraLines
          .map(function (l) { return inlineFormat(l, inlineCodes); })
          .join('\n')
          .replace(/  \n/g, '<br>\n');
        output.push('<p>' + paraHtml + '</p>');
      }
    }

    // Restore code blocks
    let html = output.join('\n');
    codeBlocks.forEach(function (block, idx) {
      html = html.replace('\x00CODE' + idx + '\x00', block);
    });

    return html;
  }

  function parseListLines(lines, inlineCodes) {
    const firstLine = lines[0] || '';
    const isOrdered = /^\s*\d+\.\s/.test(firstLine);
    const tag = isOrdered ? 'ol' : 'ul';
    const baseIndent = (firstLine.match(/^(\s*)/) || ['', ''])[1].length;
    const items = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === '') { i++; continue; }

      const lineIndent = (line.match(/^(\s*)/) || ['', ''])[1].length;
      const isItem = /^\s*([-*+]|\d+\.)\s/.test(line);

      if (isItem && lineIndent === baseIndent) {
        const content = line.replace(/^\s*([-*+]|\d+\.)\s/, '');
        i++;

        // Collect indented sub-lines (nested list content)
        const subLines = [];
        while (i < lines.length) {
          const next = lines[i];
          if (next.trim() === '') { i++; continue; }
          const nextIndent = (next.match(/^(\s*)/) || ['', ''])[1].length;
          if (nextIndent > baseIndent) {
            subLines.push(next);
            i++;
          } else {
            break;
          }
        }

        // Task list item: - [ ] or - [x]
        const taskMatch = content.match(/^\[( |x|X)\]\s+(.*)$/);
        let itemHtml;
        let isTask = false;
        if (taskMatch) {
          isTask = true;
          const checked = taskMatch[1].toLowerCase() === 'x';
          itemHtml = '<input type="checkbox"' + (checked ? ' checked' : '') + '> ' +
                     inlineFormat(taskMatch[2], inlineCodes);
        } else {
          itemHtml = inlineFormat(content, inlineCodes);
        }

        if (subLines.length > 0) {
          itemHtml += parseListLines(subLines, inlineCodes);
        }

        items.push(
          (isTask ? '<li class="task-list-item">' : '<li>') + itemHtml + '</li>'
        );
      } else {
        i++;
      }
    }

    return '<' + tag + '>' + items.join('') + '</' + tag + '>';
  }

  function parseTableRow(line) {
    return line
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map(function (cell) { return cell.trim(); });
  }

  function inlineFormat(text, inlineCodes) {
    // Restore inline code placeholders first (so we don't format inside them)
    let out = text;

    // Images before links
    out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function (_, alt, src) {
      return '<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(alt) + '">';
    });

    // Links
    out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, label, href) {
      return '<a href="' + escapeHtml(href) + '">' + escapeHtml(label) + '</a>';
    });

    // Bold + italic (***text***)
    out = out.replace(/\*{3}(.+?)\*{3}/g, '<strong><em>$1</em></strong>');

    // Bold (**text** or __text__)
    out = out.replace(/\*{2}(.+?)\*{2}/g, '<strong>$1</strong>');
    out = out.replace(/_{2}(.+?)_{2}/g, '<strong>$1</strong>');

    // Italic (*text* or _text_)
    out = out.replace(/\*(.+?)\*/g, '<em>$1</em>');
    out = out.replace(/_(.+?)_/g, '<em>$1</em>');

    // Strikethrough
    out = out.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // Restore inline code
    if (inlineCodes) {
      out = out.replace(/\x00INLINE(\d+)\x00/g, function (_, idx) {
        return inlineCodes[parseInt(idx, 10)];
      });
    }

    return out;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ---------------------------------------------------------------------------
  // Custom Element: <mark-down>
  // ---------------------------------------------------------------------------

  class MarkDownElement extends HTMLElement {
    connectedCallback() {
      this._render();
    }

    _render() {
      // Read raw text content (not innerHTML, to avoid double-parsing)
      const raw = this.textContent;

      // Dedent: remove common leading whitespace so indented usage looks clean
      const dedented = dedent(raw);

      const shadow = this.attachShadow({ mode: 'open' });

      // Inject the stylesheet link if a base URL is known, else inline minimal styles
      const linkEl = document.createElement('link');
      linkEl.rel = 'stylesheet';
      linkEl.href = resolveStylesheetHref();
      shadow.appendChild(linkEl);

      const container = document.createElement('div');
      container.className = 'markdown-body';
      container.innerHTML = parseMarkdown(dedented);
      shadow.appendChild(container);
    }
  }

  function dedent(str) {
    const lines = str.replace(/^\n/, '').replace(/\n\s*$/, '').split('\n');
    const indent = lines
      .filter(function (l) { return l.trim().length > 0; })
      .reduce(function (min, l) {
        const match = l.match(/^(\s*)/);
        return Math.min(min, match ? match[1].length : 0);
      }, Infinity);
    const safeIndent = isFinite(indent) ? indent : 0;
    return lines.map(function (l) { return l.slice(safeIndent); }).join('\n');
  }

  function resolveStylesheetHref() {
    // Find the <script> tag that loaded this file and derive the CSS path
    const scripts = document.querySelectorAll('script[src]');
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].getAttribute('src');
      if (src && src.indexOf('mark-down') !== -1) {
        return src.replace(/mark-down\.js$/, 'mark-down.css');
      }
    }
    // Fallback: src directory
    return 'src/mark-down.css';
  }

  customElements.define('mark-down', MarkDownElement);
})();
