import type { IssueListProps } from './issue-list.types';
import { describeIssue } from '../../helpers/validate-config.helpers';
import styles from './issue-list.module.scss';

export function IssueList({ issues }: Readonly<IssueListProps>) {
	if (issues.length === 0) return null;
	return (
		<div
			className={styles.root}
			role="alert"
		>
			{issues.map(issue => (
				<span
					key={issue}
					className={styles.badge}
				>
					{describeIssue(issue)}
				</span>
			))}
		</div>
	);
}
