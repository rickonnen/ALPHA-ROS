'use client'

import { useRef, Suspense, useState } from 'react'
import { useFormularioState } from '@/features/publicacion/FormularioDinamicoCaracteristicas/PaginaPrincipal/Useformulariostate'
import { usePublicar }        from '@/features/publicacion/FormularioDinamicoCaracteristicas/PaginaPrincipal/Usepublicar'
import { StepContent }        from '@/features/publicacion/FormularioDinamicoCaracteristicas/PaginaPrincipal/Stepcontent'
import { C, STEPS, SIDEBAR_STEPS } from '@/features/publicacion/FormularioDinamicoCaracteristicas/PaginaPrincipal/Sessionutils'
import { StepsSidebar }       from '@/features/publicacion/FormularioDinamicoCaracteristicas/Pasos/Stepssidebar'
import { SumarioModal }       from '@/features/publicacion/sumario/components/SumarioModal'

type TriggerRef = React.MutableRefObject<(() => void) | null>

function FormularioDinamicoInner() {
  const state = useFormularioState()

  const {
    modoEdicion, router,
    currentStep, completedSteps,
    hydrated, datosListos, sessionKey,
    blockMsg, publishError,
    isPublishing, bolShowSumario, setBolShowSumario,
    isMobile,
    imagenesRef, imagenesIniciales,
    isFirstStep, isLastStep,
  } = state

  const [showCancelarModal, setShowCancelarModal] = useState(false)

  const triggerRefs: Record<number, TriggerRef> = {
    0: useRef<(() => void) | null>(null),
    1: useRef<(() => void) | null>(null),
    2: useRef<(() => void) | null>(null),
    3: useRef<(() => void) | null>(null),
    4: useRef<(() => void) | null>(null),
    6: useRef<(() => void) | null>(null),
  }

  const {
    advanceDirect,
    handleUrlsChange,
    handlePublicar,
    handleNext,
    handleBack,
    handleSidebarClick,
  } = usePublicar({ ...state, triggerRefs })

  if (!hydrated || !datosListos || !sessionKey) return null

  const tituloPagina   = modoEdicion ? 'Editar publicación'  : 'Crear publicación'
  const textoPublicar  = modoEdicion ? 'Guardar'             : 'Publicar'
  const textoGuardando = modoEdicion ? 'Guardando...'        : 'Publicando...'

  const stepContentProps = {
    advanceDirect: currentStep === 6 ? () => setBolShowSumario(true) : advanceDirect,
    onBack:        handleBack,
    triggerRefs,
    imagenesRef,
    imagenesIniciales,
    onUrlsChange:  handleUrlsChange,
    sessionKey,
  }

  const handleBackOrCancel = () => {
    if (isFirstStep) setShowCancelarModal(true)
    else handleBack()
  }

  // ─── Modal cancelar ───────────────────────────────────────────────────────
  const CancelarModal = (
    <div
      onClick={() => setShowCancelarModal(false)}
      className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-background rounded-2xl p-8 max-w-[420px] w-[90%] flex flex-col items-center gap-4 shadow-2xl text-center"
      >
        <h3 className="text-xl font-bold text-primary m-0">
          ¿Cancelar formulario?
        </h3>
        <p className="text-base text-muted-foreground leading-relaxed m-0">
          Si cancelas ahora perderás todo el progreso.<br />
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3 mt-2 w-full justify-center">
          <button
            type="button"
            onClick={() => setShowCancelarModal(false)}
            className="flex-1 max-w-[160px] bg-background border-[1.5px] border-secondary text-secondary rounded-lg py-[11px] text-base font-semibold cursor-pointer hover:opacity-80 transition-opacity"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => { setShowCancelarModal(false); router.push('/') }}
            className="flex-1 max-w-[160px] bg-secondary text-secondary-foreground rounded-lg py-[11px] text-base font-semibold cursor-pointer hover:opacity-90 transition-opacity"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )

  // ─── MOBILE ───────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <main className="bg-background flex flex-col font-sans p-3 gap-0">

        <h1 className="text-3xl font-bold text-primary mb-3 mt-0">
          {tituloPagina}
        </h1>

        <div className="bg-primary rounded-xl flex flex-col p-4 gap-4">

          {/* Barra de progreso */}
          <div className="flex flex-col gap-1">
            <p className="m-0 text-xs text-primary-foreground/75 text-center">
              Completa el proceso para {modoEdicion ? 'guardar' : 'publicar'} tu propiedad
            </p>
            <div className="h-[18px] rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-secondary transition-[width] duration-400 ease-in-out"
                style={{ width: `${Math.round((completedSteps.size / STEPS.length) * 100)}%` }}
              />
            </div>
            <p className="m-0 text-xs text-primary-foreground/75 text-center">
              {completedSteps.size}/{STEPS.length} pasos completados
            </p>
          </div>

          {/* Título del paso + botón X */}
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-primary-foreground m-0 uppercase tracking-[0.06em] flex-1">
              {STEPS[currentStep].title}
              {STEPS[currentStep].opcional && (
                <span className="text-xs font-normal ml-1.5 text-secondary">-Opcional</span>
              )}
            </h2>
            <button
              type="button"
              onClick={() => setShowCancelarModal(true)}
              className="bg-transparent border-none text-primary-foreground text-2xl font-bold cursor-pointer leading-none p-0 flex-shrink-0"
            >
              ✕
            </button>
          </div>

          {/* Error / bloqueo */}
          {(blockMsg || publishError) && (
            <div className="bg-red-100 border border-red-300 rounded-md px-3 py-2 text-sm text-red-800">
              {blockMsg ?? publishError}
            </div>
          )}

          {/* Contenido del paso */}
          <div
            key={currentStep}
            className="bg-background rounded-lg p-3"
            style={{ animation: 'stepIn 0.3s ease forwards' }}
          >
            <StepContent step={currentStep} {...stepContentProps} />
          </div>

          {/* Indicadores de paso */}
          <div className="flex justify-center gap-2">
            {STEPS.map((_, i) => {
              const isActive    = i === currentStep
              const isCompleted = completedSteps.has(i)
              return (
                <button
                  key={i} type="button" onClick={() => handleSidebarClick(i)}
                  className={`w-[34px] h-[34px] rounded-full text-primary-foreground text-sm font-bold cursor-pointer flex items-center justify-center flex-shrink-0 transition-all duration-200
                    ${isActive    ? 'border-[3px] border-primary-foreground bg-transparent' : ''}
                    ${isCompleted ? 'bg-secondary border-none' : ''}
                    ${!isActive && !isCompleted ? 'bg-white/15 border-none' : ''}
                  `}
                >
                  {isCompleted ? '✓' : i + 1}
                </button>
              )
            })}
          </div>
        </div>

        {/* Botones Regresar / Siguiente */}
        <div className="flex gap-2.5 pt-3">
          <button
            type="button" onClick={handleBackOrCancel} disabled={isPublishing}
            className="flex-1 bg-background border-[1.5px] border-secondary text-secondary rounded-lg py-[11px] text-base font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Regresar
          </button>
          <button
            type="button" onClick={handleNext} disabled={isPublishing}
            className="flex-1 bg-secondary text-secondary-foreground rounded-lg py-[11px] text-base font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPublishing ? textoGuardando : isLastStep ? textoPublicar : 'Siguiente'}
          </button>
        </div>

        {bolShowSumario && (
          <SumarioModal
            onClose={() => setBolShowSumario(false)}
            onConfirmarPublicar={() => { setBolShowSumario(false); handlePublicar() }}
            modoEdicion={modoEdicion}
          />
        )}

        {showCancelarModal && CancelarModal}
      </main>
    )
  }

  // ─── DESKTOP ──────────────────────────────────────────────────────────────
  return (
    <main className="bg-background flex flex-col items-center justify-start px-4 py-2 font-sans">
      <style>{`
        @keyframes stepIn {
          from { opacity: 0; transform: translateX(18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @media (min-width: 1100px) {
          .desktop-zoom-container { zoom: 1.15; }
        }
        @media (max-width: 1440px) {
          .titulo-publicacion {
            margin-left: 0 !important;
            font-size: clamp(32px, 4.5vw, 60px) !important;
          }
        }
      `}</style>

      <div className="desktop-zoom-container w-full flex flex-col items-center">
        <div className="w-full max-w-[1000px]">
          <h1
            className="titulo-publicacion font-bold text-primary mb-5 mt-2.5 -ml-[9px]"
            style={{ fontSize: 60 }}
          >
            {tituloPagina}
          </h1>
        </div>

        {/* Contenedor principal */}
        <div className="w-full max-w-[1000px] h-[560px] flex rounded-xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.12)] relative">

          <StepsSidebar
            currentStep={currentStep}
            completedSteps={completedSteps}
            steps={SIDEBAR_STEPS}
            onStepClick={handleSidebarClick}
          />

          <div className="flex-1 bg-primary px-[50px] pt-[50px] pb-5 flex flex-col">

            {/* Título del paso + botón X */}
            <div className="flex items-center justify-between mb-5 flex-shrink-0">
              <h2
                key={`title-${currentStep}`}
                className="text-xl font-semibold text-primary-foreground m-0 uppercase tracking-[0.05em]"
                style={{ animation: 'stepIn 0.3s ease forwards' }}
              >
                {STEPS[currentStep].title}
                {STEPS[currentStep].opcional && (
                  <span className="text-xl font-semibold ml-2 text-secondary">-Opcional</span>
                )}
              </h2>
              <button
                type="button"
                onClick={() => setShowCancelarModal(true)}
                className="bg-transparent border-none text-primary-foreground text-[28px] font-bold cursor-pointer leading-none p-0 flex-shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Error / bloqueo */}
            {(blockMsg || publishError) && (
              <div className="bg-red-100 border border-red-300 rounded-md px-3 py-2 mb-2.5 text-sm text-red-800 flex-shrink-0">
                {blockMsg ?? publishError}
              </div>
            )}

            {/* Contenido del paso */}
            <div
              key={currentStep}
              className="bg-background rounded-xl p-[15px] flex-1 overflow-y-auto"
              style={{ animation: 'stepIn 0.3s ease forwards' }}
            >
              <StepContent step={currentStep} {...stepContentProps} />
            </div>

            {/* Botones Regresar / Siguiente */}
            <div className="flex justify-end gap-3 mt-[15px] flex-shrink-0">
              <button
                type="button" onClick={handleBackOrCancel} disabled={isPublishing}
                className="bg-background border-[1.5px] border-secondary text-secondary rounded-md px-5 py-[5px] text-base font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
              >
                Regresar
              </button>
              <button
                type="button" onClick={handleNext} disabled={isPublishing}
                className="bg-secondary text-secondary-foreground rounded-md px-5 py-[5px] text-base font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                {isPublishing ? textoGuardando : isLastStep ? textoPublicar : 'Siguiente'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {bolShowSumario && (
        <SumarioModal
          onClose={() => setBolShowSumario(false)}
          onConfirmarPublicar={() => { setBolShowSumario(false); handlePublicar() }}
          modoEdicion={modoEdicion}
        />
      )}

      {showCancelarModal && CancelarModal}
    </main>
  )
}

export default function CrearPublicacionPage() {
  return (
    <Suspense fallback={null}>
      <FormularioDinamicoInner />
    </Suspense>
  )
}