import Link from 'next/link';
import type { DocLinkProps } from './doc-link.types';

const EXTERNAL_SCHEME_PATTERN = /^([a-z][a-z\d+\-.]*:|\/\/)/i;

export function DocLink({ href, children, ...rest }: DocLinkProps) {
	if (!href) {
		return <a {...rest}>{children}</a>;
	}

	if (EXTERNAL_SCHEME_PATTERN.test(href)) {
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				{...rest}
			>
				{children}
			</a>
		);
	}

	return (
		<Link
			href={href}
			{...rest}
		>
			{children}
		</Link>
	);
}
