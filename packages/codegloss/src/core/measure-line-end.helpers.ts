/**
 * Returns the pixel X of the rightmost edge of the given line-content
 * element's actual rendered text, in viewport coordinates.
 *
 * `.lineContent` is a `flex: 1` box that stretches to fill the remaining
 * row space, so its own `getBoundingClientRect().right` sits at the row's
 * right edge — not where the text ends. Wrapping a Range around the child
 * nodes gives the tight bounding box of the text + inline annotations,
 * which is what we want for right-side arc anchors.
 */
export function measureTextRight(lineContent: HTMLElement): number {
	if (!lineContent.firstChild) {
		return lineContent.getBoundingClientRect().left;
	}

	const range = document.createRange();
	range.selectNodeContents(lineContent);
	const rect = range.getBoundingClientRect();
	range.detach();
	return rect.right;
}
