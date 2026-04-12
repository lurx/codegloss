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

export function buildCodeGlossMdxNode(pair: DetectedPair): MdxJsxFlowElement {
	const attributes: MdxJsxAttribute[] = [
		jsxExpressionAttribute('code', JSON.stringify(pair.code)),
		jsxAttribute('lang', pair.lang),
	];

	if (pair.filename) {
		attributes.push(jsxAttribute('filename', pair.filename));
	}

	if (pair.theme) {
		attributes.push(jsxAttribute('theme', pair.theme));
	}

	if (pair.annotationsJson) {
		try {
			const parsed = JSON.parse(pair.annotationsJson) as AnnotationsData;

			if (parsed.annotations && Array.isArray(parsed.annotations)) {
				attributes.push(
					jsxExpressionAttribute(
						'annotations',
						JSON.stringify(parsed.annotations),
					),
				);
			}

			if (parsed.connections && Array.isArray(parsed.connections)) {
				attributes.push(
					jsxExpressionAttribute(
						'connections',
						JSON.stringify(parsed.connections),
					),
				);
			}

			if (parsed.arcs && typeof parsed.arcs === 'object') {
				attributes.push(
					jsxExpressionAttribute('arcs', JSON.stringify(parsed.arcs)),
				);
			}
		} catch {
			console.warn(
				'[remark-codegloss] Failed to parse annotations JSON, rendering without annotations',
			);
		}
	}

	const node: MdxJsxFlowElement = {
		type: 'mdxJsxFlowElement',
		name: 'CodeGloss',
		attributes,
		children: [],
	};

	return node;
}
