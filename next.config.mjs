/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true, // Critical for Chrome extension - ensures /dashboard/ instead of /dashboard
  // Disable server-side features for static export
  reactStrictMode: true,
  // Ensure asset paths are relative for Chrome extension
  assetPrefix: '',
  // Disable source maps in production for smaller bundle
  productionBrowserSourceMaps: false,
  // Ensure proper routing for static export
  skipTrailingSlashRedirect: true,
};

export default nextConfig;

