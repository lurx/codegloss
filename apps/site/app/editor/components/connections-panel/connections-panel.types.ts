import type { Annotation, Connection } from 'codegloss/react';

export type ConnectionsPanelProps = {
	connections: Connection[];
	annotations: Annotation[];
	onAddAction: (value: Connection) => void;
	onUpdateAction: (index: number, value: Connection) => void;
	onRemoveAction: (index: number) => void;
};

export type ConnectionRowProps = {
	index: number;
	value: Connection;
	annotations: Annotation[];
	onUpdateAction: (index: number, value: Connection) => void;
	onRemoveAction: (index: number) => void;
};
