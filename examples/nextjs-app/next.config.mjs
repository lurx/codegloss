import createMDX from '@next/mdx';
import remarkCodegloss from 'remark-codegloss';

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkCodegloss],
  },
});

export default withMDX(nextConfig);
