import { describe, expect, it } from 'vitest';
import type { Root } from 'mdast';
import { injectImportIfNeeded } from '../inject-import.helpers';

const tree = (children: Root['children'] = []): Root => ({
	type: 'root',
	children,
});

describe('injectImportIfNeeded', () => {
	it('prepends a CodeGloss import to an empty tree', () => {
		const root = tree();
		injectImportIfNeeded(root);

		expect(root.children).toHaveLength(1);
		const node = root.children[0] as { type: string; value: string };
		expect(node.type).toBe('mdxjsEsm');
		expect(node.value).toBe("import { CodeGloss } from '@codegloss/react'");
	});

	it('inserts the import at the very top of the tree', () => {
		const paragraph = {
			type: 'paragraph',
			children: [{ type: 'text', value: 'hello' }],
		} as unknown as Root['children'][number];
		const root = tree([paragraph]);

		injectImportIfNeeded(root);

		expect(root.children).toHaveLength(2);
		expect((root.children[0] as { type: string }).type).toBe('mdxjsEsm');
		expect(root.children[1]).toBe(paragraph);
	});

	it('is a no-op when an mdxjsEsm node already imports CodeGloss', () => {
		const existing = {
			type: 'mdxjsEsm',
			value: "import { CodeGloss } from 'somewhere-else'",
		} as unknown as Root['children'][number];
		const root = tree([existing]);

		injectImportIfNeeded(root);

		expect(root.children).toHaveLength(1);
		expect(root.children[0]).toBe(existing);
	});

	it('adds the import when an unrelated mdxjsEsm node is present', () => {
		const unrelated = {
			type: 'mdxjsEsm',
			value: "import foo from 'bar'",
		} as unknown as Root['children'][number];
		const root = tree([unrelated]);

		injectImportIfNeeded(root);

		expect(root.children).toHaveLength(2);
		expect((root.children[0] as { value: string }).value).toContain(
			'CodeGloss',
		);
	});

	it('attaches an estree program with the import declaration', () => {
		const root = tree();
		injectImportIfNeeded(root);

		const node = root.children[0] as {
			data?: { estree?: { type: string; body: unknown[] } };
		};
		expect(node.data?.estree?.type).toBe('Program');
		expect(node.data?.estree?.body).toHaveLength(1);
	});
});
