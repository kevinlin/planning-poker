/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Optimize for Vercel deployment
  experimental: {
    serverComponentsExternalPackages: ['fs'],
  },
  // Ensure API routes work correctly
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}

export default nextConfig
