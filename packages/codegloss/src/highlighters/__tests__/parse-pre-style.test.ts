import { describe, it, expect } from 'vitest';
import { parsePreChrome } from '../parse-pre-style.helpers';

describe('parsePreChrome', () => {
	it('returns an empty object when no <pre> tag is present', () => {
		expect(parsePreChrome('<code><span>x</span></code>')).toEqual({});
	});

	it('returns an empty object when the <pre> has no inline style', () => {
		expect(parsePreChrome('<pre class="shiki"><code>x</code></pre>')).toEqual(
			{},
		);
	});

	it('extracts background-color and color declarations', () => {
		expect(
			parsePreChrome(
				'<pre class="shiki" style="background-color:#0d1117;color:#e6edf3"><code>x</code></pre>',
			),
		).toEqual({ background: '#0d1117', color: '#e6edf3' });
	});

	it('accepts background as a shorthand for background-color', () => {
		expect(
			parsePreChrome('<pre style="background:#111; color:#fff"><code/></pre>'),
		).toEqual({ background: '#111', color: '#fff' });
	});

	it('ignores unrelated declarations', () => {
		expect(
			parsePreChrome(
				'<pre style="font-family:monospace; padding:8px"><code/></pre>',
			),
		).toEqual({});
	});

	it('skips malformed declarations that have no colon', () => {
		expect(
			parsePreChrome('<pre style="background:#123; invalid"><code/></pre>'),
		).toEqual({ background: '#123' });
	});
});
