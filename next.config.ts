import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // mismo límite que el máximo de imagen (10MB por archivo)
    },
  },
  typescript: {
    // !! ADVERTENCIA !!
    // Esto permite que el deploy termine aunque existan errores de tipo.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Esto ignora los avisos de "estilo de código" durante el build.
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
