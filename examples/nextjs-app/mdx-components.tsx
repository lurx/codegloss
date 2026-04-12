// Required by @next/mdx in app router. Maps the JSX names that
// remark-codegloss emits (`CodeGloss`) to the React wrapper.
import { CodeGloss } from 'codegloss/react';

import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    CodeGloss,
  };
}
