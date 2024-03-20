const basePath = process.env.BASE_PATH || undefined;

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  assetPrefix: basePath,
  basePath: basePath,
};

export default nextConfig;
