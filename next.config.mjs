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
  // Explicitly disable Turbopack
  experimental: {
    turbo: false,
  },
  // Optimize for development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Disable webpack cache in development to avoid issues
      config.cache = false
    }
    return config
  },
}

export default nextConfig
