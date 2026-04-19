'use client'

import { Check, ChevronRight } from 'lucide-react'

interface Step {
  title: string
}

interface StepsSidebarProps {
  steps: Step[]
  currentStep: number
  completedSteps: Set<number>
  onStepClick: (index: number) => void
}

export function StepsSidebar({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: StepsSidebarProps) {
  const totalCompleted = completedSteps.size
  const progressPercent = Math.round((totalCompleted / steps.length) * 100)

  return (
    <div className="flex flex-col h-full w-[280px] shrink-0 bg-[#C26E5A] px-4 py-5">

      {/* ── Lista de pasos ─────────────────────── */}
      <div className="flex flex-col gap-0.5 flex-1">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = completedSteps.has(index)
          const isClickable = index < currentStep || isCompleted

          return (
            <div
              key={index}
              onClick={() => isClickable ? onStepClick(index) : undefined}
              className={[
                'flex items-center justify-between px-3 py-2.5 rounded-lg',
                'transition-all duration-150 select-none',
                isActive
                  ? 'bg-[#1F3A4D]'
                  : isClickable
                    ? 'hover:bg-white/10 cursor-pointer'
                    : 'cursor-default opacity-50',
              ].join(' ')}
            >
              {/* Número + título del paso */}
              <span
                className={[
                  'text-[13px]',
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-white/85 font-normal',
                ].join(' ')}
              >
                {index + 1}. {step.title}
              </span>

              {/* Icono derecho */}
              <span className="flex items-center justify-end min-w-[18px]">
                {isCompleted ? (
                  // ✓ círculo cuando el paso fue completado
                  <span className="w-[18px] h-[18px] rounded-full bg-white/25 flex items-center justify-center">
                    <Check size={10} color="#ffffff" strokeWidth={3} />
                  </span>
                ) : isActive ? (
                  // › flecha cuando el paso está activo
                  <ChevronRight size={14} className="text-white/70" />
                ) : null}
              </span>
            </div>
          )
        })}
      </div>

      {/* Barra de progreso */}
      <div className="pt-4 mt-auto">
        <p className="text-[11px] text-white/70 mb-2 text-center">
          Completa el proceso para publicar tu propiedad
        </p>
        <div className="h-5 w-full rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#1F3A4D] transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[11px] text-white/70 mt-1.5 text-center">
          {totalCompleted}/{steps.length} pasos completados
        </p>
      </div>

    </div>
  )
}