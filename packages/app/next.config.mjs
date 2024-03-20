/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  assetPrefix:
    process.env.NODE_ENV === 'production'
      ? 'https://shaman123.github.io/erase2d/'
      : undefined,
  basePath: '/erase2d',
};

export default nextConfig;
