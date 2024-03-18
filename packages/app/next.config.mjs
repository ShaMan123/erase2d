/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
