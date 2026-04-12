'use client';

import { useEffect } from 'react';
import type { UseCopyHeadingAnchorsTarget } from './use-copy-heading-anchors.types';

const COPIED_FLAG_MS = 1400;
const IDLE_ARIA = 'Copy link to this section';
const COPIED_ARIA = 'Link copied';

const ICON_ATTRS =
	'class="heading-anchor-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
const LINK_ICON_HTML = `<svg ${ICON_ATTRS} stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
const CHECK_ICON_HTML = `<svg ${ICON_ATTRS} stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;

/**
 * Wires click-to-copy behavior onto rehype-autolink-headings anchors
 * (`a.heading-anchor`) inside `container`.
 *
 * On click we:
 * - update the URL hash so the browser stays in sync for sharing,
 * - write the full URL to the clipboard,
 * - swap the inline SVG from the Lucide `link` glyph to `check` for
 *   ~1.4 seconds, and update `aria-label` so screen readers hear the
 *   feedback too.
 *
 * The listener is delegated to the container, so it covers every
 * heading once the MDX renders without per-heading wiring.
 */
export function useCopyHeadingAnchors(
	container: UseCopyHeadingAnchorsTarget,
): void {
	useEffect(() => {
		const node = container.current;
		if (!node) return;

		const onClick = (event: MouseEvent) => {
			const target = event.target as HTMLElement | null;
			const anchor = target?.closest<HTMLAnchorElement>('a.heading-anchor');
			if (!anchor) return;

			event.preventDefault();

			const hash = anchor.getAttribute('href') ?? '';
			const url = `${window.location.origin}${window.location.pathname}${hash}`;

			history.replaceState(null, '', url);

			void navigator.clipboard.writeText(url).then(() => {
				anchor.innerHTML = CHECK_ICON_HTML;
				anchor.dataset.copied = 'true';
				anchor.setAttribute('aria-label', COPIED_ARIA);
				setTimeout(() => {
					anchor.innerHTML = LINK_ICON_HTML;
					delete anchor.dataset.copied;
					anchor.setAttribute('aria-label', IDLE_ARIA);
				}, COPIED_FLAG_MS);
			});
		};

		node.addEventListener('click', onClick);
		return () => node.removeEventListener('click', onClick);
	}, [container]);
}
