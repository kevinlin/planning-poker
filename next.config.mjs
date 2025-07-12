/** @type {import('next').NextConfig} */
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';

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
  ...(isStaticExport && {
    output: 'export',
    trailingSlash: true,
    basePath: '/planning-poker',
    assetPrefix: '/planning-poker',
  }),
}

export default nextConfig
