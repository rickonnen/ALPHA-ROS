'use client'

import { Check, ChevronRight } from 'lucide-react'

interface Step {
  title:    string
  opcional: boolean
}

interface StepsSidebarProps {
  steps:          Step[]
  currentStep:    number
  completedSteps: Set<number>
  onStepClick:    (index: number) => void
}

export function StepsSidebar({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: StepsSidebarProps) {
  const totalCompleted  = completedSteps.size
  const progressPercent = Math.round((totalCompleted / steps.length) * 100)

  return (
    <div className="flex flex-col h-full w-[280px] shrink-0 bg-secondary px-4 py-5">

      <div className="flex flex-col gap-0.5 flex-1">
        {steps.map((step, index) => {
          const isActive    = index === currentStep
          const isCompleted = completedSteps.has(index)

          const isClickable =
            index < currentStep ||
            steps
              .slice(0, index)
              .every((s, i) => i === currentStep || s.opcional || completedSteps.has(i))

          return (
            <div
              key={index}
              onClick={() => isClickable ? onStepClick(index) : undefined}
              className={[
                'flex items-center justify-between px-3 py-2.5 rounded-lg',
                'transition-all duration-150 select-none',
                isActive
                  ? 'bg-primary'
                  : isClickable
                    ? 'hover:bg-white/10 cursor-pointer'
                    : 'cursor-default opacity-50',
              ].join(' ')}
            >
              <span className={[
                'text-[13px]',
                isActive
                  ? 'text-secondary-foreground font-semibold'
                  : 'text-secondary-foreground/85 font-normal',
              ].join(' ')}>
                {index + 1}. {step.title}
                {step.opcional && (
                  <span className="block text-[10px] text-secondary-foreground/50 font-normal leading-none mt-0.5">
                    opcional
                  </span>
                )}
              </span>

              <span className="flex items-center justify-end min-w-[18px]">
                {isCompleted ? (
                  <span className="w-[18px] h-[18px] rounded-full bg-white/25 flex items-center justify-center">
                    <Check size={10} color="var(--secondary-foreground)" strokeWidth={3} />
                  </span>
                ) : isActive ? (
                  <ChevronRight size={14} className="text-secondary-foreground/70" />
                ) : null}
              </span>
            </div>
          )
        })}
      </div>

      {/* Barra de progreso */}
      <div className="pt-4 mt-auto">
        <p className="text-[11px] text-secondary-foreground/70 mb-2 text-center">
          Completa el proceso para publicar tu propiedad
        </p>
        <div className="h-5 w-full rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[11px] text-secondary-foreground/70 mt-1.5 text-center">
          {totalCompleted}/{steps.length} pasos completados
        </p>
      </div>

    </div>
  )
}