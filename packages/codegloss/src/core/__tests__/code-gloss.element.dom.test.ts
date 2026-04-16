import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest';
import { drawArcs } from '../render/arcs.helpers';
import { type CodeGlossElement, defineCodeGloss } from '../code-gloss.element';
import type {
	Annotation,
	CodeGlossConfig,
	Connection,
} from '../code-gloss.types';

// Mock the arc renderer so we can (a) assert call counts deterministically and
// (b) capture the onConnectionClickAction callback the element passes in. The real
// drawArcs is exercised in arcs.helpers.dom.test.ts.
vi.mock('../render/arcs.helpers', () => ({
	drawArcs: vi.fn(),
}));

const drawArcsMock = drawArcs as unknown as ReturnType<typeof vi.fn>;

const ann = (overrides: Partial<Annotation> = {}): Annotation => ({
	id: 'a1',
	token: 'foo',
	line: 0,
	occurrence: 0,
	title: 'Foo',
	text: 'About foo',
	...overrides,
});

type MountOptions = {
	highlight?: (code: string, lang: string) => string[];
	withScript?: boolean;
	rawScriptText?: string;
};

function mount(
	config: Partial<CodeGlossConfig> = {},
	options: MountOptions = {},
): CodeGlossElement {
	const element = document.createElement('code-gloss') as CodeGlossElement;

	if (options.highlight) element.highlight = options.highlight;

	if (options.withScript !== false) {
		const script = document.createElement('script');
		script.setAttribute('type', 'application/json');
		script.textContent =
			options.rawScriptText ??
			JSON.stringify({ code: '', lang: 'js', ...config });
		element.append(script);
	}

	document.body.append(element);
	return element;
}

const shadow = (element: CodeGlossElement) => element.shadowRoot!;

const nextFrame = async () =>
	new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

beforeAll(() => {
	// Stub APIs that happy-dom doesn't ship.
	(HTMLElement.prototype as { showPopover?: () => void }).showPopover = vi.fn();
	(HTMLElement.prototype as { hidePopover?: () => void }).hidePopover = vi.fn();

	Object.defineProperty(navigator, 'clipboard', {
		configurable: true,
		value: { writeText: vi.fn() },
	});

	defineCodeGloss();
});

beforeEach(() => {
	drawArcsMock.mockClear();
	(HTMLElement.prototype.showPopover as ReturnType<typeof vi.fn>).mockClear();
	(navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockClear();
});

afterEach(() => {
	document.body.innerHTML = '';
	vi.useRealTimers();
});

describe('CodeGlossElement', () => {
	describe('connectedCallback / DOM construction', () => {
		it('builds the shadow DOM from a JSON script child', () => {
			const element = mount({
				code: 'let x = 1',
				lang: 'js',
				filename: 'app.js',
			});
			const root = shadow(element);

			expect(root.querySelector('.codegloss')).toBeTruthy();
			expect(root.querySelector('.toolbar')).toBeTruthy();
			expect(root.querySelector('.filename')?.textContent).toBe('app.js');
			expect(root.querySelector('.langBadge')?.textContent).toBe('js');
			expect(root.querySelector('.copyButton')).toBeTruthy();
			expect(root.querySelector('.pre')).toBeTruthy();
			expect(root.querySelectorAll('.line')).toHaveLength(1);
			expect(root.querySelector('.connectionTooltip')).toBeTruthy();
		});

		it('renders one line element per line of source code', () => {
			const element = mount({ code: 'one\ntwo\nthree', lang: 'js' });
			expect(shadow(element).querySelectorAll('.line')).toHaveLength(3);
		});

		it('renders an error message when the JSON script child is missing', () => {
			const element = mount({}, { withScript: false });
			expect(shadow(element).innerHTML).toContain('missing or invalid config');
		});

		it('renders an error message and logs when the JSON is malformed', () => {
			const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
				// Noop
			});
			const element = mount({}, { rawScriptText: '{not json' });

			expect(shadow(element).innerHTML).toContain('missing or invalid config');
			expect(errorSpy).toHaveBeenCalledOnce();
			errorSpy.mockRestore();
		});

		it('renders an error message when the JSON script is empty', () => {
			const element = mount({}, { rawScriptText: '' });
			expect(shadow(element).innerHTML).toContain('missing or invalid config');
		});

		it('omits the filename node when no filename is configured', () => {
			const element = mount({ lang: 'js', code: 'x' });
			expect(shadow(element).querySelector('.filename')).toBeNull();
		});

		it('uses a custom highlighter when one is set on the element', () => {
			const highlight = vi.fn(
				() => '<span class="hl">ONE</span>\n<span class="hl">TWO</span>',
			);
			const element = mount({ lang: 'js', code: 'one\ntwo' }, { highlight });

			expect(highlight).toHaveBeenCalledWith('one\ntwo', 'js');
			const contents = shadow(element).querySelectorAll('.lineContent');
			expect(contents[0].innerHTML).toContain('class="hl"');
			expect(contents[0].innerHTML).toContain('ONE');
		});

		it('injects annotation marks into pre-highlighted lines', () => {
			const highlight = () => '<span class="kw">foo</span> bar';
			const element = mount(
				{
					lang: 'js',
					code: 'foo bar',
					annotations: [ann({ token: 'foo' })],
				},
				{ highlight },
			);

			const html = shadow(element).querySelector('.lineContent')!.innerHTML;
			expect(html).toContain('data-ann-id="a1"');
			expect(html).toContain('class="kw"');
		});

		it('applies chrome colors from a structured highlighter return', () => {
			const highlight = () => ({
				html: '<span>x</span>',
				background: '#123456',
				color: '#abcdef',
			});
			const element = mount({ lang: 'js', code: 'x' }, { highlight });

			const root = shadow(element).querySelector('.codegloss') as HTMLElement;
			expect(root.style.getPropertyValue('--cg-bg')).toBe('#123456');
			expect(root.style.getPropertyValue('--cg-text')).toBe('#abcdef');
		});

		it('leaves chrome untouched when the structured return omits colors', () => {
			const highlight = () => ({ html: '<span>x</span>' });
			const element = mount({ lang: 'js', code: 'x' }, { highlight });

			const root = shadow(element).querySelector('.codegloss') as HTMLElement;
			expect(root.style.getPropertyValue('--cg-bg')).toBe('');
			expect(root.style.getPropertyValue('--cg-text')).toBe('');
		});

		it('applies chrome colors from config.highlightBackground / highlightColor', () => {
			const element = mount({
				lang: 'js',
				code: 'x',
				highlightedHtml: '<span>x</span>',
				highlightBackground: '#111111',
				highlightColor: '#eeeeee',
			});

			const root = shadow(element).querySelector('.codegloss') as HTMLElement;
			expect(root.style.getPropertyValue('--cg-bg')).toBe('#111111');
			expect(root.style.getPropertyValue('--cg-text')).toBe('#eeeeee');
		});

		it('does not write chrome onto the host style attribute (SSR-safe)', () => {
			const element = mount({
				lang: 'js',
				code: 'x',
				highlightedHtml: '<span>x</span>',
				highlightBackground: '#111111',
			});

			expect(element.getAttribute('style')).toBeNull();
		});
	});

	describe('annotation interactions', () => {
		const annotated: Partial<CodeGlossConfig> = {
			lang: 'js',
			code: 'foo bar\nbaz',
			annotations: [
				ann({
					id: 'a1',
					token: 'foo',
					line: 0,
					title: 'Foo',
					text: 'About foo',
				}),
				ann({
					id: 'a2',
					token: 'baz',
					line: 1,
					title: 'Baz',
					text: 'About baz',
				}),
			],
		};

		const queryMark = (element: CodeGlossElement, id: string) =>
			shadow(element).querySelector<HTMLElement>(`mark[data-ann-id="${id}"]`)!;

		it('opens a callout with the annotation content when a mark is clicked', () => {
			const element = mount(annotated);
			queryMark(element, 'a1').click();

			const callout = shadow(element).querySelector('.callout');
			expect(callout).toBeTruthy();
			expect(callout!.querySelector('.calloutChip')!.textContent).toBe('foo');
			expect(callout!.querySelector('.calloutTitle')!.textContent).toBe('Foo');
			expect(callout!.querySelector('.calloutBody')!.textContent).toBe(
				'About foo',
			);
		});

		it('dismisses the callout when the same annotation is clicked again', () => {
			const element = mount(annotated);
			queryMark(element, 'a1').click();
			queryMark(element, 'a1').click(); // Re-render produces a fresh mark element
			expect(shadow(element).querySelector('.callout')).toBeNull();
		});

		it('switches the active callout when a different annotation is clicked', () => {
			const element = mount(annotated);
			queryMark(element, 'a1').click();
			queryMark(element, 'a2').click();

			const callouts = shadow(element).querySelectorAll('.callout');
			expect(callouts).toHaveLength(1);
			expect(callouts[0].querySelector('.calloutTitle')!.textContent).toBe(
				'Baz',
			);
		});

		it('closes the callout when Escape is pressed', () => {
			const element = mount(annotated);
			queryMark(element, 'a1').click();
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
			expect(shadow(element).querySelector('.callout')).toBeNull();
		});

		it('does nothing when Escape is pressed with no active callout', () => {
			const element = mount(annotated);
			// No callout open
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
			// Re-rendering would fire drawArcs; verify it did NOT fire as a side effect.
			drawArcsMock.mockClear();
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
			expect(drawArcsMock).not.toHaveBeenCalled();
			expect(shadow(element).querySelector('.callout')).toBeNull();
		});

		it('ignores keys other than Escape', () => {
			const element = mount(annotated);
			queryMark(element, 'a1').click();
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
			expect(shadow(element).querySelector('.callout')).toBeTruthy();
		});

		it('closes the callout when its close button is clicked', () => {
			const element = mount(annotated);
			queryMark(element, 'a1').click();
			shadow(element)
				.querySelector<HTMLButtonElement>('.calloutClose')!
				.click();
			expect(shadow(element).querySelector('.callout')).toBeNull();
		});

		it('ignores clicks inside the pre that are not on a mark', () => {
			const element = mount(annotated);
			shadow(element).querySelector<HTMLElement>('.lineNumber')!.click();
			expect(shadow(element).querySelector('.callout')).toBeNull();
		});
	});

	describe('annotation popover', () => {
		const fooAnn = ann({
			id: 'a1',
			token: 'foo',
			line: 0,
			title: 'Foo',
			text: 'About foo',
			popover: true,
		});
		const barAnn = ann({
			id: 'a2',
			token: 'bar',
			line: 0,
			title: 'Bar',
			text: 'About bar',
			popover: true,
		});

		const clickMark = (element: CodeGlossElement, annId: string) => {
			const mark = shadow(element).querySelector<HTMLElement>(
				`mark[data-ann-id="${annId}"]`,
			)!;
			mark.dispatchEvent(
				new MouseEvent('click', {
					bubbles: true,
					clientX: 120,
					clientY: 240,
				}),
			);
		};

		beforeEach(() => {
			(HTMLElement.prototype.showPopover as ReturnType<typeof vi.fn>).mockClear();
			(HTMLElement.prototype.hidePopover as ReturnType<typeof vi.fn>).mockClear();
		});

		it('opens the floating popover with title + body when popover: true', () => {
			const element = mount({
				lang: 'js',
				code: 'foo bar',
				annotations: [fooAnn],
			});
			clickMark(element, 'a1');

			const popover = shadow(element).querySelector<HTMLElement>(
				'.annotationPopover',
			)!;
			expect(popover.style.top).toBe('240px');
			expect(popover.style.left).toBe('120px');
			expect(popover.innerHTML).toContain('Foo');
			expect(popover.innerHTML).toContain('About foo');
			expect(HTMLElement.prototype.showPopover).toHaveBeenCalledTimes(1);
		});

		it('closes the popover when the same annotation is clicked again', () => {
			const element = mount({
				lang: 'js',
				code: 'foo bar',
				annotations: [fooAnn],
			});
			clickMark(element, 'a1');
			clickMark(element, 'a1');

			expect(HTMLElement.prototype.hidePopover).toHaveBeenCalledTimes(1);
		});

		it('switches content when a different popover annotation is clicked', () => {
			const element = mount({
				lang: 'js',
				code: 'foo bar',
				annotations: [fooAnn, barAnn],
			});
			clickMark(element, 'a1');
			clickMark(element, 'a2');

			const popover = shadow(element).querySelector<HTMLElement>(
				'.annotationPopover',
			)!;
			expect(popover.innerHTML).toContain('Bar');
			expect(popover.innerHTML).not.toContain('Foo');
			// Never hides — just re-renders and re-shows
			expect(HTMLElement.prototype.hidePopover).not.toHaveBeenCalled();
		});

		it('renders only the title when the annotation has no body text', () => {
			const titleOnly = ann({
				id: 'a1',
				token: 'foo',
				line: 0,
				title: 'Just a title',
				text: '',
				popover: true,
			});
			const element = mount({
				lang: 'js',
				code: 'foo',
				annotations: [titleOnly],
			});
			clickMark(element, 'a1');

			const popover = shadow(element).querySelector('.annotationPopover')!;
			expect(popover.innerHTML).toContain('Just a title');
			expect(popover.querySelector('.annotationPopoverBody')).toBeNull();
		});

		it('respects the block-level callouts.popover default', () => {
			const element = mount({
				lang: 'js',
				code: 'foo',
				annotations: [ann({ id: 'a1', token: 'foo', line: 0 })],
				callouts: { popover: true },
			});
			clickMark(element, 'a1');

			expect(shadow(element).querySelector('.annotationPopover')?.innerHTML).toContain(
				'Foo',
			);
		});

		it('lets an individual annotation override the block-level default', () => {
			const inlineOverride = ann({
				id: 'a1',
				token: 'foo',
				line: 0,
				title: 'Foo',
				text: 'About foo',
				popover: false,
			});
			const element = mount({
				lang: 'js',
				code: 'foo',
				annotations: [inlineOverride],
				callouts: { popover: true },
			});
			clickMark(element, 'a1');

			expect(shadow(element).querySelector('.callout')).not.toBeNull();
			expect(HTMLElement.prototype.showPopover).not.toHaveBeenCalled();
		});

		it('closes any open inline callout before opening a popover annotation', () => {
			const inline = ann({
				id: 'a1',
				token: 'foo',
				line: 0,
				title: 'Foo',
				text: 'About foo',
			});
			const popoverAnn = ann({
				id: 'a2',
				token: 'bar',
				line: 0,
				title: 'Bar',
				text: 'About bar',
				popover: true,
			});
			const element = mount({
				lang: 'js',
				code: 'foo bar',
				annotations: [inline, popoverAnn],
			});

			clickMark(element, 'a1');
			expect(shadow(element).querySelector('.callout')).not.toBeNull();

			clickMark(element, 'a2');
			expect(shadow(element).querySelector('.callout')).toBeNull();
			expect(HTMLElement.prototype.showPopover).toHaveBeenCalledTimes(1);
		});

		it('closes an open popover when switching to an inline annotation', () => {
			const popoverAnn = ann({
				id: 'a1',
				token: 'foo',
				line: 0,
				title: 'Foo',
				text: 'About foo',
				popover: true,
			});
			const inline = ann({
				id: 'a2',
				token: 'bar',
				line: 0,
				title: 'Bar',
				text: 'About bar',
			});
			const element = mount({
				lang: 'js',
				code: 'foo bar',
				annotations: [popoverAnn, inline],
			});

			clickMark(element, 'a1');
			clickMark(element, 'a2');
			expect(shadow(element).querySelector('.callout')).not.toBeNull();
		});

		it('ignores toggle events whose newState is not "closed"', () => {
			const element = mount({
				lang: 'js',
				code: 'foo',
				annotations: [fooAnn],
			});
			clickMark(element, 'a1');

			const popover = shadow(element).querySelector<HTMLElement>(
				'.annotationPopover',
			)!;
			const toggle = new Event('toggle');
			Object.assign(toggle, { newState: 'open' });
			popover.dispatchEvent(toggle);

			// State should remain — re-clicking the same ann toggles-closes.
			clickMark(element, 'a1');
			expect(HTMLElement.prototype.hidePopover).toHaveBeenCalledTimes(1);
		});

		it('clears popover state when the toggle event reports closed', () => {
			const element = mount({
				lang: 'js',
				code: 'foo',
				annotations: [fooAnn],
			});
			clickMark(element, 'a1');

			const popover = shadow(element).querySelector<HTMLElement>(
				'.annotationPopover',
			)!;
			const toggle = new Event('toggle');
			Object.assign(toggle, { newState: 'closed' });
			popover.dispatchEvent(toggle);

			// Next click on the same ann should open (not toggle-close) since
			// state is cleared.
			clickMark(element, 'a1');
			expect(HTMLElement.prototype.showPopover).toHaveBeenCalledTimes(2);
		});

		it('does nothing when the clicked annotation id is missing from config', () => {
			const element = mount({
				lang: 'js',
				code: 'foo',
				annotations: [fooAnn],
			});
			const fake = document.createElement('mark');
			fake.dataset.annId = 'ghost';
			shadow(element).querySelector('.lineContent')!.append(fake);
			fake.dispatchEvent(new MouseEvent('click', { bubbles: true }));

			expect(HTMLElement.prototype.showPopover).not.toHaveBeenCalled();
		});
	});

	describe('connection popover', () => {
		const connection: Connection = {
			from: 'a1',
			to: 'a2',
			color: '#0af',
			title: 'Conn title',
			text: 'Conn body',
		};

		const config: Partial<CodeGlossConfig> = {
			lang: 'js',
			code: 'a\nb',
			annotations: [
				ann({ id: 'a1', token: 'a', line: 0 }),
				ann({ id: 'a2', token: 'b', line: 1 }),
			],
			connections: [connection],
		};

		const lastDrawArgs = () => drawArcsMock.mock.calls.at(-1)![0];

		it('invokes drawArcs after connectedCallback (via requestAnimationFrame)', async () => {
			mount(config);
			await nextFrame();
			expect(drawArcsMock).toHaveBeenCalled();
		});

		it('skips drawArcs when there are no connections', async () => {
			mount({ lang: 'js', code: 'a' });
			await nextFrame();
			expect(drawArcsMock).not.toHaveBeenCalled();
		});

		it('opens the popover with title + body when an interactive arc is clicked', async () => {
			const element = mount(config);
			await nextFrame();

			const event = new MouseEvent('click', { clientX: 120, clientY: 240 });
			lastDrawArgs().onConnectionClickAction(connection, event);

			const popover = shadow(element).querySelector('.connectionTooltip')!;
			expect(popover.style.top).toBe('240px');
			expect(popover.style.left).toBe('120px');
			expect(popover.innerHTML).toContain('Conn title');
			expect(popover.innerHTML).toContain('Conn body');
			expect(HTMLElement.prototype.showPopover).toHaveBeenCalledTimes(1);
		});

		it('renders only the title when the connection has no body text', async () => {
			const titleOnly: Connection = {
				from: 'a1',
				to: 'a2',
				color: '#0af',
				title: 'Just a title',
			};
			const element = mount({ ...config, connections: [titleOnly] });
			await nextFrame();

			lastDrawArgs().onConnectionClickAction(titleOnly, new MouseEvent('click'));
			const popover = shadow(element).querySelector('.connectionTooltip')!;
			expect(popover.innerHTML).toContain('Just a title');
			expect(popover.querySelector('.connectionTooltipBody')).toBeNull();
		});

		it('renders only the body when the connection has no title', async () => {
			const bodyOnly: Connection = {
				from: 'a1',
				to: 'a2',
				color: '#0af',
				text: 'Just a body',
			};
			const element = mount({ ...config, connections: [bodyOnly] });
			await nextFrame();

			lastDrawArgs().onConnectionClickAction(bodyOnly, new MouseEvent('click'));
			const popover = shadow(element).querySelector('.connectionTooltip')!;
			expect(popover.innerHTML).toContain('Just a body');
			expect(popover.querySelector('.connectionTooltipTitle')).toBeNull();
		});

		it('clears the connection tooltip state when the popover toggles closed', async () => {
			const element = mount(config);
			await nextFrame();

			lastDrawArgs().onConnectionClickAction(connection, new MouseEvent('click'));
			const popover = shadow(element).querySelector('.connectionTooltip')!;

			const toggle = new Event('toggle');
			Object.assign(toggle, { newState: 'closed' });
			popover.dispatchEvent(toggle);

			// Re-trigger render to make sure no stale state crashes the path
			lastDrawArgs().onConnectionClickAction(connection, new MouseEvent('click'));
			expect(HTMLElement.prototype.showPopover).toHaveBeenCalledTimes(2);
		});

		it('ignores popover toggle events whose newState is not "closed"', async () => {
			const element = mount(config);
			await nextFrame();
			lastDrawArgs().onConnectionClickAction(connection, new MouseEvent('click'));

			const popover = shadow(element).querySelector('.connectionTooltip')!;
			const toggle = new Event('toggle');
			Object.assign(toggle, { newState: 'open' });
			popover.dispatchEvent(toggle);
			// No crash; nothing to assert beyond reaching this line.
			expect(true).toBe(true);
		});
	});

	describe('copy button', () => {
		it('writes the raw code to the clipboard', () => {
			const element = mount({ lang: 'js', code: 'console.log(1)' });
			shadow(element).querySelector<HTMLButtonElement>('.copyButton')!.click();
			expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
				'console.log(1)',
			);
		});

		it('swaps the icon to a check mark and reverts after the feedback timeout', () => {
			vi.useFakeTimers();
			const element = mount({ lang: 'js', code: 'x' });
			const btn =
				shadow(element).querySelector<HTMLButtonElement>('.copyButton')!;

			btn.click();
			expect(btn.getAttribute('aria-label')).toBe('Copied');
			expect(btn.title).toBe('Copied!');

			vi.advanceTimersByTime(2000);
			expect(btn.getAttribute('aria-label')).toBe('Copy code');
			expect(btn.title).toBe('Copy code');
		});

		it('resets a pending feedback timer when the button is clicked again', () => {
			vi.useFakeTimers();
			const element = mount({ lang: 'js', code: 'x' });
			const btn =
				shadow(element).querySelector<HTMLButtonElement>('.copyButton')!;

			btn.click();
			vi.advanceTimersByTime(1500);
			btn.click();
			vi.advanceTimersByTime(1500);
			// The first click's timer would have fired by now (3000ms total) but the
			// second click reset it, so we should still be in the "Copied" state.
			expect(btn.getAttribute('aria-label')).toBe('Copied');

			vi.advanceTimersByTime(500);
			expect(btn.getAttribute('aria-label')).toBe('Copy code');
		});
	});

	describe('resize handler', () => {
		const config: Partial<CodeGlossConfig> = {
			lang: 'js',
			code: 'a\nb',
			annotations: [
				ann({ id: 'a1', token: 'a', line: 0 }),
				ann({ id: 'a2', token: 'b', line: 1 }),
			],
			connections: [{ from: 'a1', to: 'a2', color: '#0af' }],
		};

		it('debounces redraws on window resize', async () => {
			mount(config);
			await nextFrame(); // Initial draw
			drawArcsMock.mockClear();

			vi.useFakeTimers();
			globalThis.dispatchEvent(new Event('resize'));
			globalThis.dispatchEvent(new Event('resize'));
			globalThis.dispatchEvent(new Event('resize'));
			expect(drawArcsMock).not.toHaveBeenCalled();

			vi.advanceTimersByTime(100);
			expect(drawArcsMock).toHaveBeenCalledTimes(1);
		});
	});

	describe('defaultOpen pre-opens', () => {
		beforeEach(() => {
			(HTMLElement.prototype.showPopover as ReturnType<typeof vi.fn>).mockClear();
		});

		it('pre-opens the inline callout for an annotation with defaultOpen: true', () => {
			const element = mount({
				lang: 'js',
				code: 'foo bar',
				annotations: [
					ann({ id: 'a1', token: 'foo', line: 0, defaultOpen: true }),
				],
			});

			expect(shadow(element).querySelector('.callout')).not.toBeNull();
		});

		it('pre-opens the popover callout when the winning annotation is in popover mode', async () => {
			mount({
				lang: 'js',
				code: 'foo bar',
				annotations: [
					ann({
						id: 'a1',
						token: 'foo',
						line: 0,
						popover: true,
						defaultOpen: true,
					}),
				],
			});

			await nextFrame();
			expect(HTMLElement.prototype.showPopover).toHaveBeenCalledTimes(1);
		});

		it('last annotation with defaultOpen wins when multiple are flagged', () => {
			const element = mount({
				lang: 'js',
				code: 'foo bar baz',
				annotations: [
					ann({
						id: 'a1',
						token: 'foo',
						line: 0,
						title: 'Foo',
						text: 'About foo',
						defaultOpen: true,
					}),
					ann({
						id: 'a2',
						token: 'baz',
						line: 0,
						title: 'Baz',
						text: 'About baz',
						defaultOpen: true,
					}),
				],
			});

			const callout = shadow(element).querySelector('.calloutTitle');
			expect(callout?.textContent).toBe('Baz');
		});

		it('pre-opens the winning connection popover', async () => {
			const element = mount({
				lang: 'js',
				code: 'a\nb',
				annotations: [
					ann({ id: 'a1', token: 'a', line: 0 }),
					ann({ id: 'a2', token: 'b', line: 1 }),
				],
				connections: [
					{
						from: 'a1',
						to: 'a2',
						color: '#0af',
						title: 'Conn title',
						text: 'Conn body',
						defaultOpen: true,
					},
				],
			});
			await nextFrame();

			const popover = shadow(element).querySelector('.connectionTooltip')!;
			expect(popover.innerHTML).toContain('Conn title');
			expect(HTMLElement.prototype.showPopover).toHaveBeenCalledTimes(1);
		});

		it('last connection with defaultOpen wins when multiple are flagged', async () => {
			const element = mount({
				lang: 'js',
				code: 'a\nb',
				annotations: [
					ann({ id: 'a1', token: 'a', line: 0 }),
					ann({ id: 'a2', token: 'b', line: 1 }),
				],
				connections: [
					{
						from: 'a1',
						to: 'a2',
						color: '#0af',
						title: 'First',
						text: 'First body',
						defaultOpen: true,
					},
					{
						from: 'a2',
						to: 'a1',
						color: '#f00',
						title: 'Second',
						text: 'Second body',
						defaultOpen: true,
					},
				],
			});
			await nextFrame();

			const popover = shadow(element).querySelector('.connectionTooltip')!;
			expect(popover.innerHTML).toContain('Second');
			expect(popover.innerHTML).not.toContain('First body');
		});

		it('opens one annotation and one connection together (independent surfaces)', async () => {
			const element = mount({
				lang: 'js',
				code: 'a\nb',
				annotations: [
					ann({
						id: 'a1',
						token: 'a',
						line: 0,
						title: 'A',
						text: 'About a',
						defaultOpen: true,
					}),
					ann({ id: 'a2', token: 'b', line: 1 }),
				],
				connections: [
					{
						from: 'a1',
						to: 'a2',
						color: '#0af',
						title: 'Conn',
						text: 'Conn body',
						defaultOpen: true,
					},
				],
			});
			await nextFrame();

			expect(shadow(element).querySelector('.callout')).not.toBeNull();
			expect(HTMLElement.prototype.showPopover).toHaveBeenCalledTimes(1);
		});

		it('skips connection pre-open when the connection has no text (non-interactive)', async () => {
			mount({
				lang: 'js',
				code: 'a\nb',
				annotations: [
					ann({ id: 'a1', token: 'a', line: 0 }),
					ann({ id: 'a2', token: 'b', line: 1 }),
				],
				connections: [
					{
						from: 'a1',
						to: 'a2',
						color: '#0af',
						title: 'No body',
						defaultOpen: true,
					},
				],
			});
			await nextFrame();

			expect(HTMLElement.prototype.showPopover).not.toHaveBeenCalled();
		});

		it('anchors a right-side pre-opened connection differently from a left-side one', async () => {
			const element = mount({
				lang: 'js',
				code: 'a\nb',
				annotations: [
					ann({ id: 'a1', token: 'a', line: 0 }),
					ann({ id: 'a2', token: 'b', line: 1 }),
				],
				connections: [
					{
						from: 'a1',
						to: 'a2',
						color: '#0af',
						title: 'Right',
						text: 'On the right',
						side: 'right',
						defaultOpen: true,
					},
				],
			});
			await nextFrame();

			const popover = shadow(element).querySelector<HTMLElement>(
				'.connectionTooltip',
			)!;
			expect(popover.style.left).toBeTruthy();
		});

		it('falls back to the codeArea center when a connection references an unknown annotation', async () => {
			const element = mount({
				lang: 'js',
				code: 'a\nb',
				annotations: [ann({ id: 'a1', token: 'a', line: 0 })],
				connections: [
					{
						from: 'ghost',
						to: 'other-ghost',
						color: '#0af',
						title: 'Orphan',
						text: 'Both partners missing',
						defaultOpen: true,
					},
				],
			});
			await nextFrame();

			const popover = shadow(element).querySelector<HTMLElement>(
				'.connectionTooltip',
			)!;
			expect(popover.innerHTML).toContain('Orphan');
			expect(popover.style.top).toBeTruthy();
		});

		it('does nothing when no annotation or connection is marked defaultOpen', async () => {
			const element = mount({
				lang: 'js',
				code: 'foo',
				annotations: [ann({ id: 'a1', token: 'foo', line: 0 })],
			});
			await nextFrame();

			expect(shadow(element).querySelector('.callout')).toBeNull();
			expect(HTMLElement.prototype.showPopover).not.toHaveBeenCalled();
		});

		it('ignores defaultOpen pointing at a popover annotation whose token was not rendered', async () => {
			mount({
				lang: 'js',
				code: 'foo',
				annotations: [
					ann({
						id: 'ghost',
						token: 'not-there',
						line: 0,
						popover: true,
						defaultOpen: true,
					}),
				],
			});
			await nextFrame();

			expect(HTMLElement.prototype.showPopover).not.toHaveBeenCalled();
		});
	});

	describe('theme handling', () => {
		it('applies a theme from the JSON config on connect and sets the host attribute', () => {
			const element = mount({
				lang: 'js',
				code: 'x',
				theme: 'github-dark',
			});
			expect(element.getAttribute('theme')).toBe('github-dark');
			expect(shadow(element).adoptedStyleSheets.length).toBeGreaterThan(1);
		});

		it('reacts to theme attribute changes via attributeChangedCallback', () => {
			const element = mount({ lang: 'js', code: 'x' });
			const before = shadow(element).adoptedStyleSheets.length;

			element.setAttribute('theme', 'github-dark');

			expect(shadow(element).adoptedStyleSheets.length).toBeGreaterThan(before);
		});

		it('swaps an existing theme stylesheet when the theme attribute changes', () => {
			const element = mount({ lang: 'js', code: 'x', theme: 'github-dark' });
			const sheetAfterFirst = shadow(element).adoptedStyleSheets.at(-1);

			element.setAttribute('theme', 'dracula');

			const sheetAfterSwap = shadow(element).adoptedStyleSheets.at(-1);
			expect(sheetAfterSwap).not.toBe(sheetAfterFirst);
		});

		it('ignores attribute changes for unrelated attributes', () => {
			const element = mount({ lang: 'js', code: 'x', theme: 'github-dark' });
			const before = shadow(element).adoptedStyleSheets.length;

			element.setAttribute('class', 'decorative');

			expect(shadow(element).adoptedStyleSheets.length).toBe(before);
		});

		it('removes the theme attribute and detaches the theme stylesheet when the theme is cleared', () => {
			const element = mount({ lang: 'js', code: 'x', theme: 'github-dark' });
			const sheetsBefore = shadow(element).adoptedStyleSheets.length;

			element.removeAttribute('theme');

			expect(element.hasAttribute('theme')).toBe(false);
			expect(shadow(element).adoptedStyleSheets.length).toBe(sheetsBefore - 1);
		});

		it('is a no-op when an unknown theme name is applied', () => {
			const element = mount({ lang: 'js', code: 'x' });
			const before = shadow(element).adoptedStyleSheets.length;

			element.setAttribute('theme', 'does-not-exist');

			// Attribute is mirrored even for unknown themes, but no stylesheet is added.
			expect(element.getAttribute('theme')).toBe('does-not-exist');
			expect(shadow(element).adoptedStyleSheets.length).toBe(before);
		});
	});

	describe('disconnectedCallback', () => {
		it('cleans up listeners and pending timers without throwing', async () => {
			const element = mount({
				lang: 'js',
				code: 'x',
				annotations: [ann({ id: 'a1', token: 'x', line: 0 })],
				connections: [{ from: 'a1', to: 'a1', color: '#000' }],
			});
			await nextFrame();
			drawArcsMock.mockClear();

			// Schedule a copy timer + a resize debounce timer + an animation frame.
			vi.useFakeTimers();
			shadow(element).querySelector<HTMLButtonElement>('.copyButton')!.click();
			globalThis.dispatchEvent(new Event('resize'));

			element.remove();

			// Resize listener should be removed.
			globalThis.dispatchEvent(new Event('resize'));
			vi.advanceTimersByTime(500);
			expect(drawArcsMock).not.toHaveBeenCalled();

			// Escape listener should also be removed (no error from missing config).
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		});

		it('cancels animation frames started by annotation transitions', () => {
			const element = mount({
				lang: 'js',
				code: 'foo',
				annotations: [ann({ id: 'a1', token: 'foo', line: 0 })],
				connections: [{ from: 'a1', to: 'a1', color: '#000' }],
			});

			shadow(element)
				.querySelector<HTMLElement>('mark[data-ann-id="a1"]')!
				.click();
			// Click triggers animateArcsThroughTransition. Tearing down should cancel
			// the in-flight RAF chain without crashing.
			element.remove();
		});
	});

	describe('defineCodeGloss', () => {
		it('is idempotent — calling it twice does not throw', () => {
			defineCodeGloss();
			defineCodeGloss();
			expect(customElements.get('code-gloss')).toBeDefined();
		});
	});

	describe('edge-case branches', () => {
		it('ignores clicks on a mark element with an empty data-ann-id attribute', () => {
			const element = mount({ lang: 'js', code: 'foo' });
			const fakeMark = document.createElement('mark');
			fakeMark.dataset.annId = '';
			shadow(element).querySelector('.pre')!.append(fakeMark);

			// Synthesize a real bubble through the delegated handler.
			fakeMark.dispatchEvent(new MouseEvent('click', { bubbles: true }));
			expect(shadow(element).querySelector('.callout')).toBeNull();
		});

		it('runs the animateArcsThroughTransition RAF chain to completion', async () => {
			const element = mount({
				lang: 'js',
				code: 'foo',
				annotations: [ann({ id: 'a1', token: 'foo', line: 0 })],
				connections: [{ from: 'a1', to: 'a1', color: '#000' }],
			});
			await nextFrame(); // Initial draw
			drawArcsMock.mockClear();

			shadow(element)
				.querySelector<HTMLElement>('mark[data-ann-id="a1"]')!
				.click();

			// Wait long enough for `tick` to both schedule another frame and then
			// exit when performance.now() - start >= CALLOUT_TRANSITION_MS (220ms).
			await new Promise<void>(resolve => setTimeout(resolve, 280));
			expect(drawArcsMock.mock.calls.length).toBeGreaterThan(1);
		});

		it('redraws arcs when connections exist but annotations are undefined', async () => {
			mount({
				lang: 'js',
				code: 'a',
				connections: [{ from: 'x', to: 'y', color: '#000' }],
			});
			await nextFrame();

			expect(drawArcsMock).toHaveBeenCalled();
			const lastArgs = drawArcsMock.mock.calls.at(-1)![0];
			expect(lastArgs.annotations).toEqual([]);
			expect(lastArgs.annotationPositions.size).toBe(0);
		});

		it('skips annotations whose line index is not in the rendered lineRefs', async () => {
			mount({
				lang: 'js',
				code: 'only one line',
				annotations: [
					ann({ id: 'a1', token: 'one', line: 0 }),
					ann({ id: 'a2', token: 'ghost', line: 99 }),
				],
				connections: [{ from: 'a1', to: 'a2', color: '#000' }],
			});
			await nextFrame();

			const lastArgs = drawArcsMock.mock.calls.at(-1)![0];
			expect(lastArgs.annotationPositions.has('a1')).toBe(true);
			expect(lastArgs.annotationPositions.has('a2')).toBe(false);
		});

		it('exercises the defensive guards when config is unexpectedly null', () => {
			// These guards exist for TypeScript narrowing on `this.config`. They are
			// unreachable through the public lifecycle, so we drive them directly.
			const element = mount({ lang: 'js', code: 'x' });
			const internals = element as unknown as {
				config: CodeGlossConfig | undefined;
				buildDom: () => void;
				renderLines: () => void;
				handleCopy: () => void;
				renderConnectionPopover: () => void;
				buildToolbar: () => HTMLDivElement;
			};

			internals.config = null;

			expect(() => internals.buildDom()).not.toThrow();
			expect(() => internals.renderLines()).not.toThrow();
			expect(() => internals.handleCopy()).not.toThrow();
			expect(() => internals.renderConnectionPopover()).not.toThrow();
			expect(() => internals.buildToolbar()).toThrow('config required');
		});
	});
});
