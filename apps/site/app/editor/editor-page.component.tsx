'use client';

import { useEditorState } from './hooks/use-editor-state';
import { CodePane } from './components/code-pane';
import { PreviewPane } from './components/preview-pane';
import { AnnotationsPanel } from './components/annotations-panel';
import { ConnectionsPanel } from './components/connections-panel';
import { ExportPanel } from './components/export-panel';
import styles from './editor-page.module.scss';

export function EditorPage() {
	const {
		config,
		setCodeAction,
		setLangAction,
		setFilenameAction,
		setRunnableAction,
		addAnnotationAction,
		updateAnnotationAction,
		removeAnnotationAction,
		addConnectionAction,
		updateConnectionAction,
		removeConnectionAction,
	} = useEditorState();

	return (
		<main className={styles.root}>
			<div className={styles.header}>
				<h1 className={styles.title}>Editor</h1>
				<p className={styles.subtitle}>
					Compose a codegloss block — edit the code, annotations, and
					connections on the left; preview live on the right.
				</p>
			</div>

			<div className={styles.left}>
				<CodePane
					code={config.code}
					lang={config.lang}
					filename={config.filename ?? ''}
					runnable={config.runnable ?? false}
					onCodeChangeAction={setCodeAction}
					onLangChangeAction={setLangAction}
					onFilenameChangeAction={setFilenameAction}
					onRunnableChangeAction={setRunnableAction}
				/>
				<div className={styles.panels}>
					<AnnotationsPanel
						annotations={config.annotations}
						onAddAction={addAnnotationAction}
						onUpdateAction={updateAnnotationAction}
						onRemoveAction={removeAnnotationAction}
					/>
					<ConnectionsPanel
						connections={config.connections}
						annotations={config.annotations}
						onAddAction={addConnectionAction}
						onUpdateAction={updateConnectionAction}
						onRemoveAction={removeConnectionAction}
					/>
				</div>
			</div>

			<div className={styles.right}>
				<PreviewPane config={config} />
			</div>

			<div className={styles.export}>
				<ExportPanel config={config} />
			</div>
		</main>
	);
}
