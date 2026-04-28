'use client';

import { useMemo } from 'react';
import * as runtime from 'react/jsx-runtime';

import { CodeGloss } from '@codegloss/react';

const MDX_COMPONENTS = { CodeGloss };

function useMDXComponent(code: string) {
	return useMemo(() => {
		const fn = new Function(code);
		return fn({ ...runtime }).default;
	}, [code]);
}

export function MdxContent({ code }: { code: string }) {
	const Component = useMDXComponent(code);
	return <Component components={MDX_COMPONENTS} />;
}
