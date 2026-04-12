import { notFound } from 'next/navigation';
import { docs } from '#velite';

import { MdxContent } from '@/components/mdx-content.component';
import { DocsLayout } from '@/components/docs-layout.component';
import type { DocPageProps } from './page.types';

export function generateStaticParams() {
  return docs.map((doc) => ({ slug: doc.slug.split('/') }));
}

export async function generateMetadata({ params }: DocPageProps) {
  const { slug } = await params;
  const joined = slug.join('/');
  const doc = docs.find((d) => d.slug === joined);

  return doc ? { title: `${doc.title} — codegloss` } : {};
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const joined = slug.join('/');
  const doc = docs.find((d) => d.slug === joined);

  if (!doc) notFound();

  return (
    <DocsLayout>
      <MdxContent code={doc.body} />
    </DocsLayout>
  );
}
