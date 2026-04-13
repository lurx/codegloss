import type { MdxJsxFlowElement, MdxJsxAttribute } from 'mdast-util-mdx-jsx';
import type { AnnotationsData, DetectedPair } from './remark.types';

function jsxAttribute(name: string, value: string): MdxJsxAttribute {
	return { type: 'mdxJsxAttribute', name, value };
}

function jsxExpressionAttribute(
	name: string,
	rawExpression: string,
): MdxJsxAttribute {
	return {
		type: 'mdxJsxAttribute',
		name,
		value: {
			type: 'mdxJsxAttributeValueExpression',
			value: rawExpression,
			data: {
				estree: {
					type: 'Program',
					sourceType: 'module',
					body: [
						{
							type: 'ExpressionStatement',
							expression: {
								type: 'Literal',
								value: rawExpression,
								raw: rawExpression,
							},
						},
					],
				},
			},
		},
	};
}

function parseAnnotationsData(json: string | undefined): AnnotationsData {
	if (!json) return {};
	try {
		return JSON.parse(json) as AnnotationsData;
	} catch {
		console.warn(
			'[remark-codegloss] Failed to parse annotations JSON, rendering without annotations',
		);
		return {};
	}
}

function mergeObject(
	base: Record<string, unknown> | undefined,
	override: unknown,
): Record<string, unknown> | undefined {
	if (override && typeof override === 'object') {
		return { ...base, ...(override as Record<string, unknown>) };
	}
	return base;
}

export function buildCodeGlossMdxNode(pair: DetectedPair): MdxJsxFlowElement {
	const attributes: MdxJsxAttribute[] = [
		jsxExpressionAttribute('code', JSON.stringify(pair.code)),
		jsxAttribute('lang', pair.lang),
	];

	if (pair.filename) attributes.push(jsxAttribute('filename', pair.filename));
	if (pair.theme) attributes.push(jsxAttribute('theme', pair.theme));

	const parsed = parseAnnotationsData(pair.annotationsJson);

	if (Array.isArray(parsed.annotations)) {
		attributes.push(
			jsxExpressionAttribute('annotations', JSON.stringify(parsed.annotations)),
		);
	}

	if (Array.isArray(parsed.connections)) {
		attributes.push(
			jsxExpressionAttribute('connections', JSON.stringify(parsed.connections)),
		);
	}

	const mergedArcs = mergeObject(pair.arcs, parsed.arcs);
	if (mergedArcs && Object.keys(mergedArcs).length > 0) {
		attributes.push(jsxExpressionAttribute('arcs', JSON.stringify(mergedArcs)));
	}

	const mergedCallouts = mergeObject(pair.callouts, parsed.callouts);
	if (mergedCallouts && Object.keys(mergedCallouts).length > 0) {
		attributes.push(
			jsxExpressionAttribute('callouts', JSON.stringify(mergedCallouts)),
		);
	}

	return {
		type: 'mdxJsxFlowElement',
		name: 'CodeGloss',
		attributes,
		children: [],
	};
}
