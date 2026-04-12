import type { Annotation } from 'codegloss/react';
import type { AnnotationIssue } from '../../helpers/validate-config.helpers';

export type AnnotationsPanelProps = {
	annotations: Annotation[];
	issues: Record<number, AnnotationIssue[]>;
	onAddAction: (value: Annotation) => void;
	onUpdateAction: (index: number, value: Annotation) => void;
	onRemoveAction: (index: number) => void;
};

export type AnnotationRowProps = {
	index: number;
	value: Annotation;
	issues: AnnotationIssue[];
	onUpdateAction: (index: number, value: Annotation) => void;
	onRemoveAction: (index: number) => void;
};
