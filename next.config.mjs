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
  // Security headers to fix CSP issues
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self' data: blob: https:",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https: data: blob:",
              "style-src 'self' 'unsafe-inline' https: data: blob:",
              "font-src 'self' https: data: blob:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https: wss: ws:",
              "frame-src 'self' https: data: blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
              "worker-src 'self' blob:",
              "child-src 'self' blob:"
            ].join('; ')
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
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
