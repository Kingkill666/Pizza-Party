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
