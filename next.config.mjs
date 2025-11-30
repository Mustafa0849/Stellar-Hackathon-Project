/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Commented out for dev server - uncomment for production build
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Disable source maps in production for smaller bundle
  productionBrowserSourceMaps: false,
};

export default nextConfig;

