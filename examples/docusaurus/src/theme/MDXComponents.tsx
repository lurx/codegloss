// "Swizzled" MDX components map. Docusaurus exposes its default mappings via
// `@theme-original/MDXComponents`; we extend that with the CodeGloss wrapper so
// the JSX names emitted by remark-codegloss resolve at render time.
import MDXComponents from '@theme-original/MDXComponents';

import { CodeGloss } from 'codegloss/react';

export default {
  ...MDXComponents,
  CodeGloss,
};
