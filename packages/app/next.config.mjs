/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  assetPrefix: process.env.CI ? '/erase2d/' : undefined,
  basePath: process.env.CI ? '/erase2d' : undefined,
};

export default nextConfig;
