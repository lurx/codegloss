import { exportJson } from '../../helpers/export-json.helpers';
import { exportMdx } from '../../helpers/export-mdx.helpers';
import { exportJsx } from '../../helpers/export-jsx.helpers';
import type { EditorConfig } from '../../hooks/use-editor-state';

export type ExportFormat = 'json' | 'mdx' | 'jsx';

export const EXPORT_FORMATS = [
	{ id: 'json', label: 'JSON', lang: 'json', render: exportJson },
	{ id: 'mdx', label: 'MDX', lang: 'mdx', render: exportMdx },
	{ id: 'jsx', label: 'JSX', lang: 'tsx', render: exportJsx },
] satisfies ReadonlyArray<{
	id: ExportFormat;
	label: string;
	lang: string;
	render: (config: EditorConfig) => string;
}>;
