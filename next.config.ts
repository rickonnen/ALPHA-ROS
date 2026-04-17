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
  eslint: {
    // ESTO IGNORA LOS WARNINGS Y ERRORES DE ESLINT DURANTE EL BUILD
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ESTO IGNORA LOS ERRORES DE TIPOS RESTANTES DURANTE EL BUILD
    ignoreBuildErrors: true,
  },
}

export default nextConfig