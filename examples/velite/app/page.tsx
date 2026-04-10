import { posts } from '#site/content';

import { MdxContent } from '../components/mdx-content.component';

export default function Page() {
  const post = posts[0];

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: '0 20px' }}>
      <h1>{post.title}</h1>
      <MdxContent code={post.body} />
    </main>
  );
}
