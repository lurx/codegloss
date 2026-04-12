import type { RunResult } from './code-gloss.types';
import type { Runner } from './runners.types';

const runners: Record<string, Runner> = {
	js(code) {
		const lines: string[] = [];
		const originalLog = console.log;

		console.log = (...args: unknown[]) => {
			lines.push(args.map(String).join(' '));
		};

		try {
			new Function(code)();
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			lines.push(`Error: ${message}`);
		} finally {
			console.log = originalLog;
		}

		return { lines };
	},
};

export function run(lang: string, code: string): RunResult {
	const runner = runners[lang];

	if (!runner) {
		return { lines: [], error: `No runner for "${lang}"` };
	}

	return runner(code);
}
