import type { AnchorHTMLAttributes, ReactNode } from 'react';

export type DocLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: ReactNode;
};
