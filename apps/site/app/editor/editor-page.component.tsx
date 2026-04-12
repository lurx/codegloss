'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Redo2, Settings, Undo2, Upload } from 'lucide-react';
import type { Annotation, Connection } from 'codegloss/react';
import { useEditorState } from './hooks/use-editor-state';
import { useCodeglossTheme } from './hooks/use-codegloss-theme';
import { CodePane } from './components/code-pane';
import { CodePicker } from './components/code-picker';
import type { TokenPick } from './components/code-picker';
import { PreviewPane } from './components/preview-pane';
import { AnnotationsPanel } from './components/annotations-panel';
import { ConnectionsPanel } from './components/connections-panel';
import { ExportPanel } from './components/export-panel';
import { ImportDialog } from './components/import-dialog';
import { SettingsDialog } from './components/settings-dialog';
import { validateConfig } from './helpers/validate-config.helpers';
import { nextAutoId } from './components/annotations-panel/annotations-panel.helpers';
import styles from './editor-page.module.scss';

export function EditorPage() {
	const {
		config,
		canUndo,
		canRedo,
		undoAction,
		redoAction,
		replaceConfigAction,
		patchConfigAction,
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
	const [importOpen, setImportOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);

	const validation = useMemo(() => validateConfig(config), [config]);

	const handleOpenImport = useCallback(() => setImportOpen(true), []);
	const handleCloseImport = useCallback(() => setImportOpen(false), []);
	const handleOpenSettings = useCallback(() => setSettingsOpen(true), []);
	const handleCloseSettings = useCallback(() => setSettingsOpen(false), []);

	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			const mod = event.metaKey || event.ctrlKey;
			if (!mod || event.key.toLowerCase() !== 'z') return;
			const target = event.target as HTMLElement | null;
			if (
				target &&
				(target.tagName === 'INPUT' ||
					target.tagName === 'TEXTAREA' ||
					target.isContentEditable)
			) {
				return;
			}
			event.preventDefault();
			if (event.shiftKey) redoAction();
			else undoAction();
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [undoAction, redoAction]);

	const handleConnect = useCallback(
		(fromId: string, toId: string) => {
			const connection: Connection = {
				from: fromId,
				to: toId,
				color: '#6c5ce7',
			};
			addConnectionAction(connection);
		},
		[addConnectionAction],
	);

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
				<div className={styles.headerRow}>
					<h1 className={styles.title}>Editor</h1>
					<div className={styles.historyButtons}>
						<button
							type="button"
							className={styles.historyButton}
							onClick={undoAction}
							disabled={!canUndo}
							title="Undo (Cmd/Ctrl+Z)"
						>
							<Undo2 size={16} aria-hidden="true" /> Undo
						</button>
						<button
							type="button"
							className={styles.historyButton}
							onClick={redoAction}
							disabled={!canRedo}
							title="Redo (Cmd/Ctrl+Shift+Z)"
						>
							<Redo2 size={16} aria-hidden="true" /> Redo
						</button>
						<button
							type="button"
							className={styles.historyButton}
							onClick={handleOpenImport}
						>
							<Upload size={16} aria-hidden="true" /> Import
						</button>
						<button
							type="button"
							className={styles.historyButton}
							onClick={handleOpenSettings}
							aria-label="Settings"
						>
							<Settings size={16} aria-hidden="true" /> Settings
						</button>
					</div>
				</div>
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
						onConnectAction={handleConnect}
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
				<div className={styles.stickyPreview}>
					<PreviewPane config={config} />
				</div>
			</div>

			<div className={styles.export}>
				<ExportPanel config={config} />
			</div>

			<ImportDialog
				open={importOpen}
				onCloseAction={handleCloseImport}
				onImportAction={replaceConfigAction}
			/>
			<SettingsDialog
				open={settingsOpen}
				config={config}
				onCloseAction={handleCloseSettings}
				onPatchAction={patchConfigAction}
			/>
		</main>
	);
}
