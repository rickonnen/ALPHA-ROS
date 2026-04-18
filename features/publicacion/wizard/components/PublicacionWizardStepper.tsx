'use client'

import Link from 'next/link'

interface StepperProps {
  currentStep: 1 | 2 | 3
}

type StepItem = {
  id: 1 | 2 | 3
  label: string
  href: string
}

const STEPS: StepItem[] = [
  { id: 1, label: 'Informacion comercial', href: '/publicacion/informacion-comercial' },
  { id: 2, label: 'Caracteristicas', href: '/publicacion/Caracteristicas' },
  { id: 3, label: 'Sumario', href: '/publicacion/sumario' },
]

export function PublicacionWizardStepper({ currentStep }: StepperProps) {
  return (
    <>
      <div className="lg:hidden mb-4 w-full">
        <div className="bg-white rounded-xl shadow-sm border border-[#E3DDD1] px-3 py-3">
          <ol className="grid grid-cols-3 gap-2">
            {STEPS.map((step) => {
              const bolActual = step.id === currentStep
              const bolCompletado = step.id < currentStep
              const bolHabilitado = step.id <= currentStep

              return (
                <li key={step.id}>
                  <Link
                    href={bolHabilitado ? step.href : '#'}
                    aria-disabled={!bolHabilitado}
                    className={[
                      'block w-full rounded-lg px-2 py-2 text-center text-[0.7rem] font-semibold transition-colors',
                      bolActual
                        ? 'bg-[#C26E5A] text-white'
                        : bolCompletado
                          ? 'bg-[#ECE7DD] text-[#1F3A4D]'
                          : 'bg-[#F8F5EF] text-[#8A8480] pointer-events-none opacity-80',
                    ].join(' ')}
                  >
                    Paso {step.id}
                  </Link>
                </li>
              )
            })}
          </ol>
        </div>
      </div>

      <aside className="hidden lg:block w-72 shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-[#E3DDD1] p-5 sticky top-24">
          <h3 className="text-sm font-bold text-[#1F3A4D] uppercase tracking-wide mb-4">Publicacion</h3>
          <ol className="space-y-3">
            {STEPS.map((step) => {
              const bolActual = step.id === currentStep
              const bolCompletado = step.id < currentStep
              const bolHabilitado = step.id <= currentStep
              const strEstado = bolActual ? 'Actual' : bolCompletado ? 'Completado' : 'Pendiente'

              return (
                <li key={step.id}>
                  <Link
                    href={bolHabilitado ? step.href : '#'}
                    aria-disabled={!bolHabilitado}
                    className={[
                      'block w-full text-left rounded-lg border px-3 py-3 transition-colors',
                      bolActual
                        ? 'border-[#C26E5A] bg-[#FFF6F3]'
                        : bolCompletado
                          ? 'border-[#D8D1C5] bg-[#F7F3EC] hover:border-[#C26E5A]/60'
                          : 'border-[#ECE7DD] bg-[#FAF8F3] pointer-events-none opacity-80',
                    ].join(' ')}
                  >
                    <p className={['text-xs font-bold mb-1', bolActual ? 'text-[#C26E5A]' : 'text-[#1F3A4D]'].join(' ')}>
                      Paso {step.id}
                    </p>
                    <p className="text-sm font-semibold text-[#2E2E2E]">{step.label}</p>
                    <p className="text-[0.7rem] text-[#8A8480] mt-1">{strEstado}</p>
                  </Link>
                </li>
              )
            })}
          </ol>
        </div>
      </aside>
    </>
  )
}
