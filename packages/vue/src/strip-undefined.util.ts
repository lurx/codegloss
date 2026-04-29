export function stripUndefined<T extends Record<string, unknown>>(
	source: T,
): Partial<T> {
	return Object.fromEntries(
		Object.entries(source).filter(([, value]) => value !== undefined),
	) as Partial<T>;
}
