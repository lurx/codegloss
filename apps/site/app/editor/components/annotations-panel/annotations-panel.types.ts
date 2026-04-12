import type { Annotation } from 'codegloss/react';

export type AnnotationsPanelProps = {
	annotations: Annotation[];
	onAddAction: (value: Annotation) => void;
	onUpdateAction: (index: number, value: Annotation) => void;
	onRemoveAction: (index: number) => void;
};

export type AnnotationRowProps = {
	index: number;
	value: Annotation;
	onUpdateAction: (index: number, value: Annotation) => void;
	onRemoveAction: (index: number) => void;
};
