'use client';

import { useCallback, useMemo } from 'react';
import type { Annotation } from 'codegloss/react';
import { useEditorState } from './hooks/use-editor-state';
import { useCodeglossTheme } from './hooks/use-codegloss-theme';
import { CodePane } from './components/code-pane';
import { CodePicker } from './components/code-picker';
import type { TokenPick } from './components/code-picker';
import { PreviewPane } from './components/preview-pane';
import { AnnotationsPanel } from './components/annotations-panel';
import { ConnectionsPanel } from './components/connections-panel';
import { ExportPanel } from './components/export-panel';
import { ImportPanel } from './components/import-panel';
import { validateConfig } from './helpers/validate-config.helpers';
import { nextAutoId } from './components/annotations-panel/annotations-panel.helpers';
import styles from './editor-page.module.scss';

export function EditorPage() {
	const {
		config,
		replaceConfigAction,
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

	const theme = useCodeglossTheme();

	const validation = useMemo(() => validateConfig(config), [config]);

	const handleTokenPick = useCallback(
		(pick: TokenPick) => {
			const annotation: Annotation = {
				id: nextAutoId(config.annotations),
				token: pick.token,
				line: pick.line,
				occurrence: pick.occurrence,
				title: '',
				text: '',
			};
			addAnnotationAction(annotation);
		},
		[config.annotations, addAnnotationAction],
	);

	return (
		<main className={styles.root}>
			<div className={styles.header}>
				<h1 className={styles.title}>Editor</h1>
				<p className={styles.subtitle}>
					Compose a codegloss block — edit the code, click tokens to annotate,
					then draw connections. Preview updates live on the right.
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
				<CodePicker
					code={config.code}
					lang={config.lang}
					theme={theme}
					onTokenPickAction={handleTokenPick}
				/>
				<div className={styles.panels}>
					<AnnotationsPanel
						annotations={config.annotations}
						issues={validation.annotationIssues}
						onAddAction={addAnnotationAction}
						onUpdateAction={updateAnnotationAction}
						onRemoveAction={removeAnnotationAction}
					/>
					<ConnectionsPanel
						connections={config.connections}
						annotations={config.annotations}
						issues={validation.connectionIssues}
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
				<ImportPanel onImportAction={replaceConfigAction} />
			</div>
		</main>
	);
}
