/**
 * Returns a shallow copy of `source` with any keys whose values are
 * `undefined` removed. Use at serialization boundaries where `undefined`
 * should disappear rather than encode as `null`.
 */
export function stripUndefined<T extends object>(
	source: T,
): Partial<T> {
	return Object.fromEntries(
		Object.entries(source).filter(([, value]) => value !== undefined),
	) as Partial<T>;
}
