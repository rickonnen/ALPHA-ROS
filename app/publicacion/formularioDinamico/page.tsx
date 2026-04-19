'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { DatosAvisoForm } from '@/features/publicacion/FormularioDinamicoCaracteristicas/Datos_Aviso/DatosAvisoForm'
import { CategoriaYEstadoForm } from '@/features/publicacion/FormularioDinamicoCaracteristicas/Categoria_Estado/CategoriaEstado'
import { useCategoriaForm } from '@/features/publicacion/FormularioDinamicoCaracteristicas/Categoria_Estado/useCategoriaForm'
import { UbicacionForm } from '@/features/publicacion/FormularioDinamicoCaracteristicas/Ubicacion/UbicacionForm'
import { CaracteristicasDetalleForm } from '@/features/publicacion/FormularioDinamicoCaracteristicas/Caracteristicas/CaracteristicasDetalleForm'
import { useCaracteristicasDetalleForm } from '@/features/publicacion/FormularioDinamicoCaracteristicas/Caracteristicas/useCaracteristicasDetalleForm'
import { ImagenesForm } from '@/features/publicacion/FormularioDinamicoCaracteristicas/Imagenes/ImagenesForm'
import { VideoForm } from '@/features/publicacion/FormularioDinamicoCaracteristicas/Video/Videoform'
import { DescripcionForm } from '@/features/publicacion/FormularioDinamicoCaracteristicas/Descripcion/Descripcionform'
import { publicarInmueble } from '@/features/publicacion/BackendFormulario/actions'
import { StepsSidebar } from '@/features/publicacion/FormularioDinamicoCaracteristicas/Pasos/Stepssidebar'
import { SumarioModal } from '@/features/publicacion/sumario/components/SumarioModal'

// ─── sessionStorage ───────────────────────────────────────────
const SK_STEP = 'publicacion_currentStep'
const SK_COMPLETED = 'publicacion_completedSteps'

function leerPaso(): number {
  try { const raw = sessionStorage.getItem(SK_STEP); const n = raw !== null ? parseInt(raw, 10) : 0; return isNaN(n) ? 0 : n } catch { return 0 }
}
function guardarPaso(step: number) {
  try { sessionStorage.setItem(SK_STEP, String(step)) } catch { }
}
function leerCompletados(): Set<number> {
  try { const raw = sessionStorage.getItem(SK_COMPLETED); if (!raw) return new Set(); return new Set(JSON.parse(raw) as number[]) } catch { return new Set() }
}
function guardarCompletados(set: Set<number>) {
  try { sessionStorage.setItem(SK_COMPLETED, JSON.stringify([...set])) } catch { }
}

const SESSION_KEYS_TO_CLEAN = [
  SK_STEP, SK_COMPLETED, 'datosAviso', 'categoriaYEstado', 'ubicacion',
  'caracteristicasDetalle', 'imagenesPropiedad_interacted',
  'caracteristicasImagenesPreview', 'caracteristicasImagenesNombres',
  'videoPropiedad', 'descripcionPropiedad',
]

const ESTADO_IDS: Record<string, number> = {
  'En Planos': 1, 'En Construccion': 2, 'Entrega Inmediata': 3,
}

// Títulos largos — usados en el encabezado derecho
const STEPS = [
  { title: 'Datos del Aviso',                 opcional: false },
  { title: 'Categoría y Estado',              opcional: false },
  { title: 'Ubicación de la Propiedad',       opcional: false },
  { title: 'Características de la Propiedad', opcional: false },
  { title: 'Imágenes de la Propiedad',        opcional: false },
  { title: 'Video de la Propiedad',           opcional: true  },
  { title: 'Descripción de la Propiedad',     opcional: false },
]

// Títulos cortos — usados únicamente en el sidebar izquierdo
const SIDEBAR_STEPS = [
  { title: 'Datos del Aviso *',    opcional: false },
  { title: 'Categoria y Estado *', opcional: false },
  { title: 'Ubicación *',          opcional: false },
  { title: 'Caracteristícas *',    opcional: false },
  { title: 'Imagenes *',           opcional: false },
  { title: 'Video',              opcional: true  },
  { title: 'Descripción *',        opcional: false },
]

// ─── Colores del proyecto ─────────────────────────────────────
const C = {
  crema:     '#F4EFE6',
  terracota: '#C26E5A',
  marino:    '#1F3A4D',
  borde:     '#D4CFC6',
}

// ─── Tipo ref ─────────────────────────────────────────────────
type TriggerRef = React.MutableRefObject<(() => void) | null>

function useStableTrigger(
  triggerRef: TriggerRef,
  handleSubmit: (cb: () => void) => void,
  advanceDirect: () => void,
) {
  const submitRef  = useRef(handleSubmit)
  const advanceRef = useRef(advanceDirect)
  useEffect(() => { submitRef.current  = handleSubmit  })
  useEffect(() => { advanceRef.current = advanceDirect })
  useEffect(() => {
    triggerRef.current = () => submitRef.current(() => advanceRef.current())
    return () => { triggerRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerRef])
}

// ─── Paso 1 ───────────────────────────────────────────────────
function CategoriaEstadoStep({ triggerRef, advanceDirect }: { triggerRef: TriggerRef; advanceDirect: () => void }) {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useCategoriaForm()
  useStableTrigger(triggerRef, handleSubmit, advanceDirect)
  return <CategoriaYEstadoForm values={values} errors={errors} touched={touched} onChange={handleChange} onBlur={handleBlur} />
}

// ─── Paso 3 ───────────────────────────────────────────────────
function CaracteristicasDetalleStep({ triggerRef, advanceDirect }: { triggerRef: TriggerRef; advanceDirect: () => void }) {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useCaracteristicasDetalleForm()
  const tipoPropiedad = (() => {
    try { const raw = sessionStorage.getItem('categoriaYEstado'); return raw ? (JSON.parse(raw).tipoPropiedad ?? '') : '' } catch { return '' }
  })()
  useStableTrigger(triggerRef, handleSubmit, advanceDirect)
  return <CaracteristicasDetalleForm values={values} errors={errors} touched={touched} tipoPropiedad={tipoPropiedad} onChange={handleChange} onBlur={handleBlur} />
}

// ─── StepContent ──────────────────────────────────────────────
function StepContent({
  step, advanceDirect, onBack, triggerRefs, imagenesRef,
}: {
  step: number; advanceDirect: () => void; onBack: () => void
  triggerRefs: Record<number, TriggerRef>; imagenesRef: React.MutableRefObject<File[]>
}) {
  switch (step) {
    case 0: return <DatosAvisoForm onNext={advanceDirect} onBack={onBack} submitRef={triggerRefs[0]} />
    case 1: return <CategoriaEstadoStep triggerRef={triggerRefs[1]} advanceDirect={advanceDirect} />
    case 2: return <UbicacionForm onNext={advanceDirect} onBack={onBack} submitRef={triggerRefs[2]} />
    case 3: return <CaracteristicasDetalleStep triggerRef={triggerRefs[3]} advanceDirect={advanceDirect} />
    case 4: return (
      <ImagenesForm
        onNext={advanceDirect} onBack={onBack} submitRef={triggerRefs[4]}
        onImagesChange={(files) => {
          imagenesRef.current = files
          try {
            sessionStorage.setItem('caracteristicasImagenesPreview', JSON.stringify(files.map(f => URL.createObjectURL(f))))
            sessionStorage.setItem('caracteristicasImagenesNombres', JSON.stringify(files.map(f => f.name)))
          } catch { }
        }}
      />
    )
    case 5: return <VideoForm onNext={advanceDirect} onBack={onBack} />
    case 6: return <DescripcionForm onNext={advanceDirect} onBack={onBack} submitRef={triggerRefs[6]} />
    default: return null
  }
}

// ─── Página principal ─────────────────────────────────────────
export default function CrearPublicacionPage() {
  const router = useRouter()

  const [currentStep,    setCurrentStep]    = useState<number>(() => typeof window !== 'undefined' ? leerPaso() : 0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(() => typeof window !== 'undefined' ? leerCompletados() : new Set())
  const [hydrated,       setHydrated]       = useState(() => typeof window !== 'undefined')
  const [blockMsg,       setBlockMsg]       = useState<string | null>(null)
  const [isPublishing,   setIsPublishing]   = useState(false)
  const [publishError,   setPublishError]   = useState<string | null>(null)
  const [bolShowSumario, setBolShowSumario] = useState(false)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )

  const imagenesRef    = useRef<File[]>([])
  const pendingStepRef = useRef<number | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    setIsMobile(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const triggerRefs: Record<number, TriggerRef> = {
    0: useRef<(() => void) | null>(null),
    1: useRef<(() => void) | null>(null),
    2: useRef<(() => void) | null>(null),
    3: useRef<(() => void) | null>(null),
    4: useRef<(() => void) | null>(null),
    6: useRef<(() => void) | null>(null),
  }

  useEffect(() => { if (hydrated) guardarPaso(currentStep)           }, [currentStep,    hydrated])
  useEffect(() => { if (hydrated) guardarCompletados(completedSteps) }, [completedSteps, hydrated])

  const isFirstStep = currentStep === 0
  const isLastStep  = currentStep === STEPS.length - 1

  const advanceDirect = useCallback(() => {
    if (isLastStep) return
    setBlockMsg(null)
    setCompletedSteps(prev => { const next = new Set(prev); next.add(currentStep); return next })
    const target = pendingStepRef.current
    pendingStepRef.current = null
    setCurrentStep(target !== null ? target : prev => prev + 1)
  }, [isLastStep, currentStep])

  const handlePublicar = useCallback(async () => {
    setPublishError(null)
    setIsPublishing(true)
    try {
      const datosAviso      = JSON.parse(sessionStorage.getItem('datosAviso')             ?? '{}')
      const categoria       = JSON.parse(sessionStorage.getItem('categoriaYEstado')       ?? '{}')
      const ubicacion       = JSON.parse(sessionStorage.getItem('ubicacion')              ?? '{}')
      const caracteristicas = JSON.parse(sessionStorage.getItem('caracteristicasDetalle') ?? '{}')
      const video           = JSON.parse(sessionStorage.getItem('videoPropiedad')         ?? '{}')
      const descripcion     = JSON.parse(sessionStorage.getItem('descripcionPropiedad')   ?? '{}')

      const formData = new FormData()
      formData.append('titulo',              datosAviso.titulo        ?? '')
      formData.append('tipoOperacion',       datosAviso.tipoOperacion ?? '')
      formData.append('precio',              String(datosAviso.precio ?? '0'))
      formData.append('tipoMoneda',          datosAviso.tipoMoneda    ?? 'USD')
      formData.append('tipoInmueble',        categoria.tipoPropiedad  ?? '')
      formData.append('estadoConstruccion',  String(ESTADO_IDS[categoria.estadoPropiedad as string] ?? 1))
      formData.append('direccion',           ubicacion.direccion      ?? '')
      formData.append('departamento',        ubicacion.departamento   ?? '')
      formData.append('zona',                ubicacion.zona           ?? '')
      if (ubicacion.lat) formData.append('lat', String(ubicacion.lat))
      if (ubicacion.lng) formData.append('lng', String(ubicacion.lng))
      formData.append('habitaciones',        String(caracteristicas.habitaciones ?? 0))
      formData.append('banios',              String(caracteristicas.banios       ?? 0))
      formData.append('garajes',             String(caracteristicas.garajes      ?? 0))
      formData.append('plantas',             String(caracteristicas.plantas      ?? 0))
      formData.append('superficie',          String(caracteristicas.superficie   ?? '0'))

      if (imagenesRef.current.length === 0) {
        setPublishError('Debes subir al menos 1 imagen.')
        setIsPublishing(false)
        return
      }
      imagenesRef.current.forEach(f => formData.append('imagenes', f))
      formData.append('videoUrl',    video.url              ?? '')
      formData.append('descripcion', descripcion.descripcion ?? '')
      formData.append('id_usuario',  '')

      const result = await publicarInmueble(formData)
      if (result.success) {
        SESSION_KEYS_TO_CLEAN.forEach(k => { try { sessionStorage.removeItem(k) } catch { } })
        router.push(`/publicacion/${result.idPublicacion}`)
      } else if (result.reason === 'LIMITE_ALCANZADO') {
        setPublishError('Has alcanzado el límite de publicaciones gratuitas.')
      } else {
        const firstError = Object.values(result.errors ?? {}).flat()[0] as string | undefined
        setPublishError(firstError ?? 'Error al publicar. Intenta de nuevo.')
      }
    } catch (err) {
      setPublishError(`Error inesperado: ${err instanceof Error ? err.message : JSON.stringify(err)}`)
    } finally {
      setIsPublishing(false)
    }
  }, [router])

  const handleNext = useCallback(() => {
    pendingStepRef.current = null
    setBlockMsg(null)
    setPublishError(null)
    if (isLastStep) { triggerRefs[currentStep]?.current?.(); return }
    if (currentStep === 5) { advanceDirect(); return }
    setCompletedSteps(prev => { const next = new Set(prev); next.delete(currentStep); return next })
    triggerRefs[currentStep]?.current?.()
  }, [isLastStep, currentStep, advanceDirect, triggerRefs])

  const handleBack = useCallback(() => {
    pendingStepRef.current = null
    setBlockMsg(null)
    setPublishError(null)
    if (isFirstStep) router.back()
    else setCurrentStep(prev => prev - 1)
  }, [isFirstStep, router])

  const handleSidebarClick = useCallback((index: number) => {
    setBlockMsg(null)
    setPublishError(null)
    if (index === currentStep) return
    if (index < currentStep) { pendingStepRef.current = null; setCurrentStep(index); return }
    const intermediosCompletos = STEPS
      .slice(0, index)
      .every((step, i) => i === currentStep || step.opcional || completedSteps.has(i))
    if (!intermediosCompletos) { setBlockMsg('Debes completar los pasos anteriores antes de avanzar a este.'); return }
    if (currentStep === 5) { setCurrentStep(index); return }
    pendingStepRef.current = index
    setCompletedSteps(prev => { const next = new Set(prev); next.delete(currentStep); return next })
    triggerRefs[currentStep]?.current?.()
  }, [currentStep, completedSteps, triggerRefs])

  if (!hydrated) return null

  //MOBILE
  if (isMobile) {
    return (
      <main style={{
        backgroundColor: C.crema,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-geist-sans)',
        padding: '16px 12px',
        gap: 0,
      }}>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.marino, margin: '0 0 12px' }}>
          Crear publicación
        </h1>

        <div style={{
          backgroundColor: C.marino,
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 16px 16px',
          gap: 14,
        }}>

          {/* Barra de progreso */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.75)', textAlign: 'center' }}>
              Completa el proceso para publicar tu propiedad
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

          {/* Título del paso — usa STEPS (nombres largos) */}
          <h2 style={{
            fontSize: 16, fontWeight: 700, color: '#ffffff', margin: 0,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {STEPS[currentStep].title}
            {STEPS[currentStep].opcional && (
              <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 6, color: C.terracota }}>-Opcional</span>
            )}
          </h2>

          {(blockMsg || publishError) && (
            <div style={{
              backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6,
              padding: '8px 12px', fontSize: 13, color: '#991b1b',
            }}>
              {blockMsg ?? publishError}
            </div>
          )}

          <div style={{ backgroundColor: C.crema, borderRadius: 10, padding: 14 }}>
            <StepContent
              step={currentStep}
              advanceDirect={currentStep === 6 ? () => setBolShowSumario(true) : advanceDirect}
              onBack={handleBack}
              triggerRefs={triggerRefs}
              imagenesRef={imagenesRef}
            />
          </div>

          {/* Numeritos */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {STEPS.map((_, i) => {
              const isActive    = i === currentStep
              const isCompleted = completedSteps.has(i)
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSidebarClick(i)}
                  style={{
                    width:           34,
                    height:          34,
                    borderRadius:    '50%',
                    border:          isActive ? '3px solid #ffffff' : 'none',
                    backgroundColor: isCompleted ? C.terracota : isActive ? 'transparent' : 'rgba(255,255,255,0.15)',
                    color:           '#ffffff',
                    fontSize:        13,
                    fontWeight:      700,
                    cursor:          'pointer',
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    flexShrink:      0,
                    transition:      'all 0.2s',
                  }}
                >
                  {isCompleted ? '✓' : i + 1}
                </button>
              )
            })}
          </div>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: 10, padding: '12px 0 0' }}>
          <button
            type="button"
            onClick={handleBack}
            disabled={isPublishing}
            style={{
              flex: 1,
              backgroundColor: C.crema,
              border: `1.5px solid ${C.terracota}`,
              color: C.terracota,
              borderRadius: 8,
              padding: '11px 0',
              fontSize: 15,
              fontWeight: 600,
              cursor: isPublishing ? 'not-allowed' : 'pointer',
              opacity: isPublishing ? 0.6 : 1,
            }}
          >
            Regresar
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={isPublishing}
            style={{
              flex: 1,
              backgroundColor: C.terracota,
              border: `1.5px solid ${C.terracota}`,
              color: '#ffffff',
              borderRadius: 8,
              padding: '11px 0',
              fontSize: 15,
              fontWeight: 600,
              cursor: isPublishing ? 'not-allowed' : 'pointer',
              opacity: isPublishing ? 0.6 : 1,
            }}
          >
            {isPublishing ? 'Publicando...' : isLastStep ? 'Publicar' : 'Siguiente'}
          </button>
        </div>

        {bolShowSumario && (
          <SumarioModal
            onClose={() => setBolShowSumario(false)}
            onConfirmarPublicar={() => { setBolShowSumario(false); handlePublicar() }}
          />
        )}
      </main>
    )
  }

  //DESKTOP
  return (
    <main
      style={{
        backgroundColor: C.crema, minHeight: '100vh', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '8px 16px', fontFamily: 'var(--font-geist-sans)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 1000 }}>
        <h1 style={{
          fontSize: 60, fontWeight: 700, color: C.marino,
          marginBottom: 20, marginTop: 10, marginLeft: -9,
        }}>
          Crear publicación
        </h1>
      </div>

      <div style={{
        width: '100%', maxWidth: 1000, height: 560,
        display: 'flex', borderRadius: 12, overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
      }}>
        {/* Sidebar izquierdo — usa SIDEBAR_STEPS (nombres cortos) */}
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
          {/* Encabezado derecho — usa STEPS (nombres largos) */}
          <h2 style={{
            fontSize: 20, fontWeight: 600, color: '#ffffff', marginBottom: 20,
            textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0,
          }}>
            {STEPS[currentStep].title}
            {STEPS[currentStep].opcional && (
              <span style={{ fontSize: 20, fontWeight: 600, marginLeft: 8, color: C.terracota }}>-Opcional</span>
            )}
          </h2>

          {(blockMsg || publishError) && (
            <div style={{
              backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6,
              padding: '8px 12px', marginBottom: 10, fontSize: 13, color: '#991b1b', flexShrink: 0,
            }}>
              {blockMsg ?? publishError}
            </div>
          )}

          <div style={{
            backgroundColor: C.crema, borderRadius: 12, padding: 15,
            flex: 1, overflowY: 'auto',
          }}>
            <StepContent
              step={currentStep}
              advanceDirect={currentStep === 6 ? () => setBolShowSumario(true) : advanceDirect}
              onBack={handleBack}
              triggerRefs={triggerRefs}
              imagenesRef={imagenesRef}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 15, flexShrink: 0 }}>
            <button
              type="button"
              onClick={handleBack}
              disabled={isPublishing}
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
              type="button"
              onClick={handleNext}
              disabled={isPublishing}
              style={{
                backgroundColor: C.terracota, border: `1.5px solid ${C.terracota}`,
                color: '#ffffff', borderRadius: 6, padding: '5px 20px',
                fontSize: 16, fontWeight: 600,
                cursor: isPublishing ? 'not-allowed' : 'pointer',
                opacity: isPublishing ? 0.6 : 1,
              }}
            >
              {isPublishing ? 'Publicando...' : isLastStep ? 'Publicar' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>

      {bolShowSumario && (
        <SumarioModal
          onClose={() => setBolShowSumario(false)}
          onConfirmarPublicar={() => { setBolShowSumario(false); handlePublicar() }}
        />
      )}
    </main>
  )
}