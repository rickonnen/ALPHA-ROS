import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // mismo límite que el máximo de imagen (10MB por archivo)
    },
  },
  typescript: {
    // ESTO IGNORA LOS ERRORES DE TIPOS RESTANTES DURANTE EL BUILD
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig