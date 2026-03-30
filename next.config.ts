import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // mismo límite que el máximo de imagen (10MB por archivo)
    },
  },
}

export default nextConfig