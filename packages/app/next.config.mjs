/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  assetPrefix: './',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
