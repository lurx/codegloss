export function stripUndefined<T extends object>(source: T): Partial<T> {
	return Object.fromEntries(
		Object.entries(source).filter(([, value]) => value !== undefined),
	) as Partial<T>;
}
