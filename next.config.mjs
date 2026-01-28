/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Removed: output: 'standalone' - this was causing static file serving issues
  // Removed: experimental.outputFileTracingRoot - not needed without standalone
  // Removed: assetPrefix and basePath - not needed without standalone
}

export default nextConfig
