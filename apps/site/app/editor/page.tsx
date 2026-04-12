import type { Metadata } from 'next';
import { EditorPage } from './editor-page.component';

export const metadata: Metadata = {
	title: 'Editor — codegloss',
	description:
		'Visually compose codegloss annotations and arcs with a live preview.',
};

export default function Page() {
	return <EditorPage />;
}
