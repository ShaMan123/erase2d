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
  publicPath: '/erase2d',
  // webpack(config) {
  //   // Ensures that web workers work after deployed by github
  //   config.output.publicPath = '/erase2d/_next/';
  //   return config;
  // },
};

export default nextConfig;
