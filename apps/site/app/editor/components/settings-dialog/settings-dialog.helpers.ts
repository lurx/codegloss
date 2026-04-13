import type { ArcsStyle, CalloutsStyle } from '../../hooks/use-editor-state';

export function patchArcs(
	current: ArcsStyle | undefined,
	partial: Partial<ArcsStyle>,
): ArcsStyle | undefined {
	const next: ArcsStyle = { ...current, ...partial };
	Object.keys(next).forEach((key) => {
		const typedKey = key as keyof ArcsStyle;
		if (next[typedKey] === undefined || next[typedKey] === '') {
			delete next[typedKey];
		}
	});
	return Object.keys(next).length === 0 ? undefined : next;
}

export function patchCallouts(
	current: CalloutsStyle | undefined,
	partial: Partial<CalloutsStyle>,
): CalloutsStyle | undefined {
	const next: CalloutsStyle = { ...current, ...partial };
	if (next.popover === undefined) delete next.popover;
	return Object.keys(next).length === 0 ? undefined : next;
}

export function parseOptionalNumber(value: string): number | undefined {
	if (value.trim() === '') return undefined;
	const n = Number.parseFloat(value);
	return Number.isFinite(n) ? n : undefined;
}
