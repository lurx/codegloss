import type { Annotation, Connection } from 'codegloss/react';
import type { ConnectionIssue } from '../../helpers/validate-config.helpers';

export type ConnectionsPanelProps = {
	connections: Connection[];
	annotations: Annotation[];
	issues: Record<number, ConnectionIssue[]>;
	onAddAction: (value: Connection) => void;
	onUpdateAction: (index: number, value: Connection) => void;
	onRemoveAction: (index: number) => void;
};

export type ConnectionRowProps = {
	index: number;
	value: Connection;
	annotations: Annotation[];
	issues: ConnectionIssue[];
	onUpdateAction: (index: number, value: Connection) => void;
	onRemoveAction: (index: number) => void;
};
