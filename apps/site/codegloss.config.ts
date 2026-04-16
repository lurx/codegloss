import { defineConfig } from 'codegloss/config';

export default defineConfig({
	// codegloss is intentionally syntax-agnostic — colors come from whichever
	// highlighter you plug in via remark / wrapper / setDefaultHighlighter.
	// `theme` here only names the Shiki theme used for fenced + codegloss
	// blocks across the site.
	theme: 'laserwave',
	arcs: {
		strokeDasharray: 'none',
		opacity: 0.65,
	},
});
