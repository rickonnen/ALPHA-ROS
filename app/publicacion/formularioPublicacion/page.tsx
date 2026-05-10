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
  const [bolShowFreeModal, setBolShowFreeModal] = useState(false)
  const [bolShowPlanLimitModal, setBolShowPlanLimitModal] = useState(false)
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
  } = usePublicar({ ...state, triggerRefs, setBolShowFreeModal, setBolShowPlanLimitModal, })

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

  // ─── Handler para el botón Regresar ──────────────────────────────────────
  const handleBackOrCancel = () => {
    if (isFirstStep) {
      setShowCancelarModal(true)
    } else {
      handleBack()
    }
  }

  // ─── Modal cancelar ───────────────────────────────────────────────────────
  const CancelarModal = (
    <div
      onClick={() => setShowCancelarModal(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff', borderRadius: 16,
          padding: '36px 32px', maxWidth: 420, width: '90%',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.22)',
          textAlign: 'center',
        }}
      >
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.marino }}>
          ¿Cancelar formulario?
        </h3>
        <p style={{ margin: 0, fontSize: 15, color: '#6b7280', lineHeight: 1.5 }}>
          Si cancelas ahora perderás todo el progreso.<br />
          Esta acción no se puede deshacer.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, width: '100%', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => setShowCancelarModal(false)}
            style={{
              flex: 1, maxWidth: 160,
              backgroundColor: '#ffffff', border: `1.5px solid ${C.terracota}`,
              color: C.terracota, borderRadius: 8, padding: '11px 0',
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => { setShowCancelarModal(false); router.push('/') }}
            style={{
              flex: 1, maxWidth: 160,
              backgroundColor: C.terracota, border: 'none',
              color: '#ffffff', borderRadius: 8, padding: '11px 0',
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
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
      <main style={{
        backgroundColor: C.crema, display: 'flex', flexDirection: 'column',
        fontFamily: 'var(--font-geist-sans)', padding: '16px 12px', gap: 0,
      }}>
        <style>{`
          @keyframes stepIn {
            from { opacity: 0; transform: translateX(18px); }
            to   { opacity: 1; transform: translateX(0); }
          }
        `}</style>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.marino, margin: '0 0 12px' }}>
          {tituloPagina}
        </h1>

        {/* ── Contenedor marino altura fija: flex:1 en contenido lo distribuye bien ── */}
        <div style={{
          backgroundColor: C.marino, borderRadius: 12, display: 'flex',
          flexDirection: 'column', padding: '16px 16px 16px', gap: 14,
          height: 650,
        }}>

          {/* Barra de progreso — flexShrink: 0 para que nunca se comprima */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.75)', textAlign: 'center' }}>
              Completa el proceso para {modoEdicion ? 'guardar' : 'publicar'} tu propiedad
            </p>
            <div style={{ height: 18, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <div style={{
                height: '100%', borderRadius: 99, backgroundColor: C.terracota,
                width: `${Math.round((completedSteps.size / STEPS.length) * 100)}%`,
                transition: 'width 0.4s ease',
              }} />
            </div>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.75)', textAlign: 'center' }}>
              {completedSteps.size}/{STEPS.length} pasos completados
            </p>
          </div>

          {/* Título del paso + botón X — minHeight reserva espacio para 2 líneas siempre */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexShrink: 0, minHeight: 46 }}>
            <h2 style={{
              fontSize: 16, fontWeight: 700, color: '#ffffff', margin: 0,
              textTransform: 'uppercase', letterSpacing: '0.06em', flex: 1,
            }}>
              {STEPS[currentStep].title}
              {STEPS[currentStep].opcional && (
                <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 6, color: C.terracota }}>-Opcional</span>
              )}
            </h2>
            <button
              type="button"
              onClick={() => setShowCancelarModal(true)}
              style={{
                background: 'none', border: 'none',
                color: '#ffffff', fontSize: 24, fontWeight: 700,
                cursor: 'pointer', lineHeight: 1, padding: 0,
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>

          {(blockMsg || publishError) && (
            <div style={{
              backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6,
              padding: '8px 12px', fontSize: 13, color: '#991b1b', flexShrink: 0,
            }}>
              {blockMsg ?? publishError}
            </div>
          )}

          {/* Área de contenido — height fijo siempre, scroll si desborda */}
          <div key={currentStep} style={{
            backgroundColor: C.crema, borderRadius: 10, padding: 14,
            height: 430, flexShrink: 0, overflowY: 'auto',
            animation: 'stepIn 0.3s ease forwards',
          }}>
            <StepContent step={currentStep} {...stepContentProps} />
          </div>

          {/* Botones de pasos circulares — flexShrink: 0 */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexShrink: 0 }}>
            {STEPS.map((_, i) => {
              const isActive    = i === currentStep
              const isCompleted = completedSteps.has(i)
              return (
                <button
                  key={i} type="button" onClick={() => handleSidebarClick(i)}
                  style={{
                    width: 34, height: 34, borderRadius: '50%',
                    border: isActive ? '3px solid #ffffff' : 'none',
                    backgroundColor: isCompleted ? C.terracota : isActive ? 'transparent' : 'rgba(255,255,255,0.15)',
                    color: '#ffffff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.2s',
                  }}
                >
                  {isCompleted ? '✓' : i + 1}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, padding: '12px 0 0' }}>
          <button
            type="button" onClick={handleBackOrCancel} disabled={isPublishing}
            style={{
              flex: 1, backgroundColor: C.crema, border: `1.5px solid ${C.terracota}`,
              color: C.terracota, borderRadius: 8, padding: '11px 0',
              fontSize: 15, fontWeight: 600,
              cursor: isPublishing ? 'not-allowed' : 'pointer',
              opacity: isPublishing ? 0.6 : 1,
            }}
          >
            Regresar
          </button>
          <button
            type="button" onClick={handleNext} disabled={isPublishing}
            style={{
              flex: 1, backgroundColor: C.terracota, border: `1.5px solid ${C.terracota}`,
              color: '#ffffff', borderRadius: 8, padding: '11px 0',
              fontSize: 15, fontWeight: 600,
              cursor: isPublishing ? 'not-allowed' : 'pointer',
              opacity: isPublishing ? 0.6 : 1,
            }}
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
    <main style={{
      backgroundColor: C.crema, display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
      padding: '8px 16px', fontFamily: 'var(--font-geist-sans)',
    }}>
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

      <div className="desktop-zoom-container" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1000 }}>
          <h1
            className="titulo-publicacion"
            style={{
              fontSize: 60, fontWeight: 700, color: C.marino,
              marginBottom: 20, marginTop: 10, marginLeft: -9,
            }}
          >
            {tituloPagina}
          </h1>
        </div>

        <div style={{
          width: '100%', maxWidth: 1000, height: 560,
          display: 'flex', borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          position: 'relative',
        }}>
          <StepsSidebar
            currentStep={currentStep}
            completedSteps={completedSteps}
            steps={SIDEBAR_STEPS}
            onStepClick={handleSidebarClick}
          />

          <div style={{
            flex: 1, backgroundColor: C.marino,
            padding: '50px 50px 20px', display: 'flex', flexDirection: 'column',
          }}>
            {/* Título del paso + botón X alineados */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexShrink: 0 }}>
              <h2 key={`title-${currentStep}`} style={{
                fontSize: 20, fontWeight: 600, color: '#ffffff', margin: 0,
                textTransform: 'uppercase', letterSpacing: '0.05em',
                animation: 'stepIn 0.3s ease forwards',
              }}>
                {STEPS[currentStep].title}
                {STEPS[currentStep].opcional && (
                  <span style={{ fontSize: 20, fontWeight: 600, marginLeft: 8, color: C.terracota }}>-Opcional</span>
                )}
              </h2>
              <button
                type="button"
                onClick={() => setShowCancelarModal(true)}
                style={{
                  background: 'none', border: 'none',
                  color: '#ffffff', fontSize: 28, fontWeight: 700,
                  cursor: 'pointer', lineHeight: 1, padding: 0,
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>

            {(blockMsg || publishError) && (
              <div style={{
                backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6,
                padding: '8px 12px', marginBottom: 10, fontSize: 13, color: '#991b1b', flexShrink: 0,
              }}>
                {blockMsg ?? publishError}
              </div>
            )}

            <div key={currentStep} style={{
              backgroundColor: C.crema, borderRadius: 12, padding: 15,
              flex: 1, overflowY: 'auto', animation: 'stepIn 0.3s ease forwards',
            }}>
              <StepContent step={currentStep} {...stepContentProps} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 15, flexShrink: 0 }}>
              <button
                type="button" onClick={handleBackOrCancel} disabled={isPublishing}
                style={{
                  backgroundColor: C.crema, border: `1.5px solid ${C.terracota}`,
                  color: C.terracota, borderRadius: 6, padding: '5px 20px',
                  fontSize: 16, fontWeight: 600,
                  cursor: isPublishing ? 'not-allowed' : 'pointer',
                  opacity: isPublishing ? 0.6 : 1,
                }}
              >
                Regresar
              </button>
              <button
                type="button" onClick={handleNext} disabled={isPublishing}
                style={{
                  backgroundColor: C.terracota, border: `1.5px solid ${C.terracota}`,
                  color: '#ffffff', borderRadius: 6, padding: '5px 20px',
                  fontSize: 16, fontWeight: 600,
                  cursor: isPublishing ? 'not-allowed' : 'pointer',
                  opacity: isPublishing ? 0.6 : 1,
                }}
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

// ─── Export con Suspense ──────────────────────────────────────────────────────
export default function CrearPublicacionPage() {
  return (
    <Suspense fallback={null}>
      <FormularioDinamicoInner />
    </Suspense>
  )
}