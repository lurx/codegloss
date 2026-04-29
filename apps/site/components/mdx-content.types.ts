import type { ComponentType } from 'react';
import type * as runtime from 'react/jsx-runtime';

export type MdxContentProps = {
	code: string;
};

export type CodeGlossTab = 'sandbox' | 'source';

export type MdxRuntime = typeof runtime;

export type MdxComponentProps = {
	components: Record<string, ComponentType<never>>;
};

export type CompiledMdxModule = {
	default: ComponentType<MdxComponentProps>;
};

export type CompiledMdxFactory = (runtime: MdxRuntime) => CompiledMdxModule;
