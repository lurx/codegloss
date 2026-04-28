import type { ReactNode } from 'react';

import { CodeglossLoader } from './codegloss-loader';

export const metadata = {
	title: 'codegloss · Next.js MDX example',
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body>
				{children}
				<CodeglossLoader />
			</body>
		</html>
	);
}
