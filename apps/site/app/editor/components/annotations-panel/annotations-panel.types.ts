import type { Annotation } from 'codegloss/react';
import type { AnnotationIssue } from '../../helpers/validate-config.helpers';

export type AnnotationsPanelProps = {
	annotations: Annotation[];
	issues: Record<number, AnnotationIssue[]>;
	onAddAction: (value: Annotation) => void;
	onUpdateAction: (index: number, value: Annotation) => void;
	onRemoveAction: (index: number) => void;
	onConnectAction: (fromId: string, toId: string) => void;
};

export type AnnotationRowProps = {
	index: number;
	value: Annotation;
	issues: AnnotationIssue[];
	dragFromId: string | null;
	onUpdateAction: (index: number, value: Annotation) => void;
	onRemoveAction: (index: number) => void;
	onDragStartAction: (id: string) => void;
};
