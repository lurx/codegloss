import type { Annotation, Connection } from '@codegloss/react';
import type { EditorConfig } from '../hooks/use-editor-state';
import type { ImportFormat, ImportResult } from './import-config.types';

type RawPayload = {
	code?: unknown;
	lang?: unknown;
	filename?: unknown;
	theme?: unknown;
	arcs?: unknown;
	callouts?: unknown;
	annotations?: unknown;
	connections?: unknown;
};

const MDX_CODEGLOSS_PATTERN =
	/```(\w+)\s+codegloss(?:\s+([^\n`]+))?\n([\s\S]*?)\n```/;
const MDX_ANNOTATIONS_PATTERN =
	/```json\s+annotations\n([\s\S]*?)\n```/;

function coerceConfig(raw: RawPayload): EditorConfig {
	if (typeof raw.code !== 'string') {
		throw new TypeError('Missing or invalid `code` string');
	}
	if (typeof raw.lang !== 'string') {
		throw new TypeError('Missing or invalid `lang` string');
	}
	const annotations = Array.isArray(raw.annotations)
		? (raw.annotations as Annotation[])
		: [];
	const connections = Array.isArray(raw.connections)
		? (raw.connections as Connection[])
		: [];
	return {
		code: raw.code,
		lang: raw.lang,
		filename: typeof raw.filename === 'string' ? raw.filename : undefined,
		theme: typeof raw.theme === 'string' ? raw.theme : undefined,
		arcs:
			raw.arcs && typeof raw.arcs === 'object'
				? (raw.arcs as EditorConfig['arcs'])
				: undefined,
		callouts:
			raw.callouts && typeof raw.callouts === 'object'
				? (raw.callouts as EditorConfig['callouts'])
				: undefined,
		annotations,
		connections,
	};
}

function parseJson(input: string): EditorConfig {
	const parsed = JSON.parse(input) as RawPayload;
	return coerceConfig(parsed);
}

function parseMdx(input: string): EditorConfig {
	const fenceMatch = MDX_CODEGLOSS_PATTERN.exec(input);
	if (!fenceMatch) {
		throw new Error('Could not find a ```<lang> codegloss block');
	}
	const [, lang, filename, code] = fenceMatch;
	const annotationsMatch = MDX_ANNOTATIONS_PATTERN.exec(input);
	const annotationsPayload = annotationsMatch
		? (JSON.parse(annotationsMatch[1]) as RawPayload)
		: {};

	return coerceConfig({
		code,
		lang,
		filename: filename?.trim() || undefined,
		annotations: annotationsPayload.annotations,
		connections: annotationsPayload.connections,
		arcs: annotationsPayload.arcs,
		callouts: annotationsPayload.callouts,
	});
}

function extractStringAttr(source: string, name: string): string | undefined {
	const pattern = new RegExp(String.raw`\s${name}="([^"]*)"`);
	const match = pattern.exec(source);
	return match ? match[1] : undefined;
}

function findExpressionStart(source: string, name: string): number {
	const pattern = new RegExp(String.raw`\s${name}=\{`);
	const index = source.search(pattern);
	if (index === -1) return -1;
	return source.indexOf('{', index);
}

function skipStringLiteral(
	source: string,
	start: number,
	quote: '"' | "'",
): number {
	let escape = false;
	for (let i = start; i < source.length; i += 1) {
		const ch = source[i];
		if (escape) {
			escape = false;
			continue;
		}
		if (ch === '\\') {
			escape = true;
			continue;
		}
		if (ch === quote) return i;
	}
	return source.length;
}

function extractBracedBody(source: string, openIndex: number): string {
	let depth = 0;
	let cursor = openIndex;
	while (cursor < source.length) {
		const ch = source[cursor];
		if (ch === '"' || ch === "'") {
			cursor = skipStringLiteral(source, cursor + 1, ch) + 1;
			continue;
		}
		if (ch === '{') depth += 1;
		else if (ch === '}') {
			depth -= 1;
			if (depth === 0) return source.slice(openIndex + 1, cursor);
		}
		cursor += 1;
	}
	throw new Error('Unterminated JSX expression attribute');
}

function extractExpressionAttr(
	source: string,
	name: string,
): string | undefined {
	const openIndex = findExpressionStart(source, name);
	if (openIndex === -1) return undefined;
	return extractBracedBody(source, openIndex);
}

function parseJsx(input: string): EditorConfig {
	if (!/<CodeGloss[\s>]/.test(input)) {
		throw new Error('Could not find a <CodeGloss> element');
	}
	const selfClose = input.indexOf('/>');
	const tagClose = input.indexOf('>');
	const endIndex = selfClose === -1 ? tagClose : selfClose;
	if (endIndex === -1) throw new Error('Unterminated <CodeGloss> element');
	const attrs = input.slice(0, endIndex);

	const pickString = (name: string): string | undefined => {
		const literal = extractStringAttr(attrs, name);
		if (literal !== undefined) return literal;
		const expr = extractExpressionAttr(attrs, name);
		if (expr === undefined) return undefined;
		return JSON.parse(expr) as string;
	};
	const pickJson = (name: string): unknown => {
		const expr = extractExpressionAttr(attrs, name);
		if (expr === undefined) return undefined;
		return JSON.parse(expr);
	};

	return coerceConfig({
		code: pickString('code'),
		lang: pickString('lang'),
		filename: pickString('filename'),
		theme: pickString('theme'),
		arcs: pickJson('arcs'),
		callouts: pickJson('callouts'),
		annotations: pickJson('annotations'),
		connections: pickJson('connections'),
	});
}

function detectFormat(input: string): ImportFormat {
	const trimmed = input.trimStart();
	if (trimmed.startsWith('{')) return 'json';
	if (trimmed.startsWith('<')) return 'jsx';
	return 'mdx';
}

function parseFor(format: ImportFormat, input: string): EditorConfig {
	if (format === 'json') return parseJson(input);
	if (format === 'mdx') return parseMdx(input);
	return parseJsx(input);
}

export function importConfig(input: string): ImportResult {
	const trimmed = input.trim();
	if (trimmed === '') return { ok: false, error: 'Input is empty' };
	const format = detectFormat(trimmed);
	try {
		return { ok: true, format, config: parseFor(format, trimmed) };
	} catch (err) {
		/* v8 ignore next -- parsers only throw Error instances */
		const message = err instanceof Error ? err.message : String(err);
		return { ok: false, error: `${format.toUpperCase()}: ${message}` };
	}
}
