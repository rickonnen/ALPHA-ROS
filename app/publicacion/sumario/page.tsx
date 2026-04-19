'use client'

import { useRouter } from 'next/navigation'

import { SumarioModal } from '@/features/publicacion/sumario/components/SumarioModal'

export default function SumarioPage() {
  const router = useRouter()

  return (
    <main
      className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 font-[family-name:var(--font-geist-sans)]"
      style={{ background: 'linear-gradient(to bottom, #F4EFE6 35%, #E7E1D7 35%)' }}
    >
      <SumarioModal
        onClose={() => router.push('/publicacion/Caracteristicas')}
      />
    </main>
  )
}
