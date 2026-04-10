import createMDX from '@next/mdx';
import remarkCodegloss from 'remark-codegloss';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  pageExtensions: ['ts', 'tsx', 'mdx'],
  trailingSlash: true,
  images: { unoptimized: true },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkCodegloss],
  },
});

export default withMDX(nextConfig);
