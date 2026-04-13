import type {
	AnnotationIssue,
	ConnectionIssue,
} from '../../helpers/validate-config.helpers';

export type IssueListProps = {
	issues: Array<AnnotationIssue | ConnectionIssue>;
};
