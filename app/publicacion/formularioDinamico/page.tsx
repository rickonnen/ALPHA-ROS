'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter }                                 from 'next/navigation'

import { DatosAvisoForm }               from '@/features/publicacion/FormularioDinamicoCaracteristicas/Datos_Aviso/DatosAvisoForm'
import { CategoriaYEstadoForm }         from '@/features/publicacion/FormularioDinamicoCaracteristicas/Categoria_Estado/CategoriaEstado'
import { useCategoriaForm }             from '@/features/publicacion/FormularioDinamicoCaracteristicas/Categoria_Estado/useCategoriaForm'
import { UbicacionForm }                from '@/features/publicacion/FormularioDinamicoCaracteristicas/Ubicacion/UbicacionForm'
import { CaracteristicasDetalleForm }   from '@/features/publicacion/FormularioDinamicoCaracteristicas/Caracteristicas/CaracteristicasDetalleForm'
import { useCaracteristicasDetalleForm } from '@/features/publicacion/FormularioDinamicoCaracteristicas/Caracteristicas/useCaracteristicasDetalleForm'
import { ImagenesForm }                 from '@/features/publicacion/FormularioDinamicoCaracteristicas/Imagenes/ImagenesForm'
import { VideoForm }                    from '@/features/publicacion/FormularioDinamicoCaracteristicas/Video/Videoform'
import { DescripcionForm }              from '@/features/publicacion/FormularioDinamicoCaracteristicas/Descripcion/Descripcionform'
import { publicarInmueble }             from '@/features/publicacion/BackendFormulario/actions'
// import { PublicacionStepper } from '@/features/publicacion/components/PublicacionStepper'

// sessionStorage — paso actual y pasos completados
const SK_STEP      = 'publicacion_currentStep'
const SK_COMPLETED = 'publicacion_completedSteps'

function leerPaso(): number {
  try { const raw = sessionStorage.getItem(SK_STEP); const n = raw !== null ? parseInt(raw, 10) : 0; return isNaN(n) ? 0 : n } catch { return 0 }
}
function guardarPaso(step: number) {
  try { sessionStorage.setItem(SK_STEP, String(step)) } catch {}
}
function leerCompletados(): Set<number> {
  try { const raw = sessionStorage.getItem(SK_COMPLETED); if (!raw) return new Set(); return new Set(JSON.parse(raw) as number[]) } catch { return new Set() }
}
function guardarCompletados(set: Set<number>) {
  try { sessionStorage.setItem(SK_COMPLETED, JSON.stringify([...set])) } catch {}
}

// Claves de sessionStorage de cada paso — para limpiar al publicar
const SESSION_KEYS_TO_CLEAN = [
  SK_STEP,
  SK_COMPLETED,
  'datosAviso',
  'categoriaEstado',
  'ubicacion',
  'caracteristicasDetalle',
  'imagenesPropiedad_interacted',
  'videoPropiedad',
  'descripcionPropiedad',
]

// Pasos
const STEPS = [
  { title: 'Datos del Aviso',    opcional: false },
  { title: 'Categoría y Estado', opcional: false },
  { title: 'Ubicación',          opcional: false },
  { title: 'Características',    opcional: false },
  { title: 'Imágenes',           opcional: false },
  { title: 'Video',              opcional: true  },
  { title: 'Descripción',        opcional: false },
]

// Diseño
const DISENO = {
  pagina:             { backgroundColor: '#F4EFE6' },
  alineacionVertical: 'center' as const,
  paddingVertical:    '24px',
  tituloPagina: {
    fontSize: '60px', fontWeight: '700', color: '#1F3A4D',
    marginBottom: '20px', marginLeft: '-120px', marginTop: '40px',
  },
  contenedor:     { maxWidth: '1000px', height: '560px' },
  panelIzquierdo: { width: '340px', backgroundColor: '#C26E5A', padding: '20px' },
  panelDerecho:   { backgroundColor: '#1F3A4D', padding: '50px', paddingBottom: '20px' },
  tituloPaso:     { fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '20px' },
  cuadroForm:     { backgroundColor: '#F4EFE6', borderRadius: '12px', padding: '15px' },
  botones:        { gap: '12px', marginTop: '15px' },
  botonRegresar: {
    backgroundColor: '#F4EFE6', border: '1.5px solid #C26E5A', color: '#C26E5A',
    borderRadius: '6px', padding: '5px 20px', fontSize: '16px', fontWeight: '600',
  },
  botonSiguiente: {
    backgroundColor: '#C26E5A', border: '1.5px solid #C26E5A', color: '#ffffff',
    borderRadius: '6px', padding: '5px 20px', fontSize: '16px', fontWeight: '600',
  },
}

// Tipo ref para triggers de validación por paso
type TriggerRef = React.MutableRefObject<(() => void) | null>

// ─────────────────────────────────────────────────────────────
// useStableTrigger
// Usado SOLO para pasos que NO instancian su propio hook:
// paso 1 (CategoriaEstadoStep) y paso 3 (CaracteristicasDetalleStep)
// ─────────────────────────────────────────────────────────────
function useStableTrigger(
  triggerRef:    TriggerRef,
  handleSubmit:  (cb: () => void) => void,
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
// Paso 1: Categoría y Estado
function CategoriaEstadoStep({
  triggerRef,
  advanceDirect,
}: {
  triggerRef:    TriggerRef
  advanceDirect: () => void
}) {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useCategoriaForm()
  useStableTrigger(triggerRef, handleSubmit, advanceDirect)
  return (
    <CategoriaYEstadoForm
      values={values} errors={errors} touched={touched}
      onChange={handleChange} onBlur={handleBlur}
    />
  )
}
// Paso 3: Características
function CaracteristicasDetalleStep({
  triggerRef,
  advanceDirect,
}: {
  triggerRef:    TriggerRef
  advanceDirect: () => void
}) {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
    useCaracteristicasDetalleForm()
  useStableTrigger(triggerRef, handleSubmit, advanceDirect)
  return (
    <CaracteristicasDetalleForm
      values={values} errors={errors} touched={touched}
      onChange={handleChange} onBlur={handleBlur}
    />
  )
}

// Contenido del paso activo
function StepContent({
  step,
  advanceDirect,
  onBack,
  triggerRefs,
  imagenesRef,
}: {
  step:          number
  advanceDirect: () => void
  onBack:        () => void
  triggerRefs:   Record<number, TriggerRef>
  imagenesRef:   React.MutableRefObject<File[]>
}) {
  switch (step) {
    // Paso 0 — DatosAvisoForm instancia su propio hook → le pasamos submitRef
    case 0: return (
      <DatosAvisoForm
        onNext={advanceDirect}
        onBack={onBack}
        submitRef={triggerRefs[0]}
      />
    )
    // Paso 1 — CategoriaYEstadoForm no instancia hook → Step wrapper con useStableTrigger
    case 1: return (
      <CategoriaEstadoStep triggerRef={triggerRefs[1]} advanceDirect={advanceDirect} />
    )
    // Paso 2 — UbicacionForm instancia su propio hook → le pasamos submitRef
    case 2: return (
      <UbicacionForm
        onNext={advanceDirect}
        onBack={onBack}
        submitRef={triggerRefs[2]}
      />
    )
    // Paso 3 — CaracteristicasDetalleForm no instancia hook → Step wrapper con useStableTrigger
    case 3: return (
      <CaracteristicasDetalleStep triggerRef={triggerRefs[3]} advanceDirect={advanceDirect} />
    )
    // Paso 4 — ImagenesForm instancia su propio hook → le pasamos submitRef
    // onImagesChange escribe los File[] en imagenesRef para que handlePublicar los lea
    case 4: return (
      <ImagenesForm
        onNext={advanceDirect}
        onBack={onBack}
        submitRef={triggerRefs[4]}
        onImagesChange={(files) => { imagenesRef.current = files }}
      />
    )
    // Paso 5 — Video, opcional, sin validación
    case 5: return <VideoForm onNext={advanceDirect} onBack={onBack} />
    // Paso 6 — DescripcionForm instancia su propio hook → le pasamos submitRef
    case 6: return (
      <DescripcionForm
        onNext={advanceDirect}
        onBack={onBack}
        submitRef={triggerRefs[6]}
      />
    )
    default: return null
  }
}

// Página principal
export default function CrearPublicacionPage() {
  const router = useRouter()

  // ── Sin login por ahora — descomentar useAuth cuando esté listo ──
  // const { user } = useAuth()
  const user = null

  const [currentStep,    setCurrentStep]    = useState<number>(() =>
    typeof window !== 'undefined' ? leerPaso() : 0
  )
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(() =>
    typeof window !== 'undefined' ? leerCompletados() : new Set()
  )
  const [hydrated,     setHydrated]     = useState(() => typeof window !== 'undefined')
  const [blockMsg,     setBlockMsg]     = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)

  // Ref con los File[] de imágenes — ImagenesForm los escribe aquí via onImagesChange
  const imagenesRef = useRef<File[]>([])

  // triggerRefs — uno por cada paso que necesita validación (todos menos video paso 5)
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
    setCurrentStep(prev => prev + 1)
  }, [isLastStep, currentStep])

  // ─────────────────────────────────────────────────────────
  // handlePublicar — lee sessionStorage, arma FormData y llama
  // al server action.
  //
  // Cuando el sumario esté listo (otro dev):
  //   1. En handleNext del último paso muestra el sumario
  //      en vez de llamar triggerRefs[6] directamente
  //   2. El onConfirmar del sumario llama handlePublicar()
  // ─────────────────────────────────────────────────────────
  const handlePublicar = useCallback(async () => {
    setPublishError(null)
    setIsPublishing(true)

    try {
      const datosAviso      = JSON.parse(sessionStorage.getItem('datosAviso')            ?? '{}')
      const categoria       = JSON.parse(sessionStorage.getItem('categoriaEstado')        ?? '{}')
      const ubicacion       = JSON.parse(sessionStorage.getItem('ubicacion')              ?? '{}')
      const caracteristicas = JSON.parse(sessionStorage.getItem('caracteristicasDetalle') ?? '{}')
      const video           = JSON.parse(sessionStorage.getItem('videoPropiedad')         ?? '{}')
      const descripcion     = JSON.parse(sessionStorage.getItem('descripcionPropiedad')   ?? '{}')

      const formData = new FormData()

      // Paso 0 — Datos del Aviso
      formData.append('titulo',        datosAviso.titulo        ?? '')
      formData.append('tipoOperacion', datosAviso.tipoOperacion ?? '')
      formData.append('precio',        String(datosAviso.precio ?? '0'))
      formData.append('tipoMoneda',    datosAviso.tipoMoneda    ?? 'USD')

      // Paso 1 — Categoría y Estado
      formData.append('tipoInmueble',       categoria.tipoInmueble              ?? '')
      formData.append('estadoConstruccion', String(categoria.estadoConstruccion ?? 1))

      // Paso 2 — Ubicación
      formData.append('direccion',    ubicacion.direccion    ?? '')
      formData.append('departamento', ubicacion.departamento ?? '')
      formData.append('zona',         ubicacion.zona         ?? '')
      if (ubicacion.lat) formData.append('lat', String(ubicacion.lat))
      if (ubicacion.lng) formData.append('lng', String(ubicacion.lng))

      // Paso 3 — Características
      formData.append('habitaciones', String(caracteristicas.habitaciones ?? 0))
      formData.append('banios',       String(caracteristicas.banios       ?? 0))
      formData.append('garajes',      String(caracteristicas.garajes      ?? 0))
      formData.append('plantas',      String(caracteristicas.plantas      ?? 0))
      formData.append('superficie',   String(caracteristicas.superficie   ?? '0'))

      // Paso 4 — Imágenes desde el ref (File objects)
      if (imagenesRef.current.length === 0) {
        setPublishError('Debes subir al menos 1 imagen.')
        setIsPublishing(false)
        return
      }
      imagenesRef.current.forEach(f => formData.append('imagenes', f))

      // Paso 5 — Video (opcional)
      formData.append('videoUrl', video.url ?? '')

      // Paso 6 — Descripción
      formData.append('descripcion', descripcion.descripcion ?? '')

      // Usuario — null mientras no haya login
      // Cuando el login esté listo reemplazar por: user?.id ?? ''
      formData.append('id_usuario', '')

      const result = await publicarInmueble(formData)

      if (result.success) {
        SESSION_KEYS_TO_CLEAN.forEach(k => {
          try { sessionStorage.removeItem(k) } catch {}
        })
        router.push(`/publicacion/${result.idPublicacion}`)

      } else if (result.reason === 'LIMITE_ALCANZADO') {
        // TODO: mostrar modal de límite cuando el login esté integrado
        setPublishError('Has alcanzado el límite de publicaciones gratuitas.')

      } else {
        const firstError = Object.values(result.errors ?? {}).flat()[0] as string | undefined
        setPublishError(firstError ?? 'Error al publicar. Intenta de nuevo.')
      }

    } catch (err) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err)
      setPublishError(`Error inesperado: ${msg}`)
    } finally {
      setIsPublishing(false)
    }
  }, [router])

  // handleNext — avanza al siguiente paso o publica si es el último
  const handleNext = useCallback(() => {
    setBlockMsg(null)
    setPublishError(null)

    // Último paso (6 — Descripción) → validar y luego publicar
    // Cuando el sumario esté listo: mostrar sumario aquí en vez de publicar directo
    if (isLastStep) {
      triggerRefs[currentStep]?.current?.()
      return
    }

    // Video (paso 5) es opcional → avanzar sin validar
    if (currentStep === 5) { advanceDirect(); return }

    // Resto → disparar validación del paso actual
    triggerRefs[currentStep]?.current?.()
  }, [isLastStep, currentStep, advanceDirect, triggerRefs])

  const handleBack = useCallback(() => {
    setBlockMsg(null)
    setPublishError(null)
    if (isFirstStep) router.back()
    else setCurrentStep(prev => prev - 1)
  }, [isFirstStep, router])

  /**
   * handleSidebarClick — para el componente del otro equipo.
   *
   * Para el otro equipo:
   * 1. Descomentar el import de PublicacionStepper arriba.
   * 2. Reemplazar el <div> del panel izquierdo por:
   *
   *    <PublicacionStepper
   *      currentStep={currentStep}
   *      completedSteps={completedSteps}
   *      steps={STEPS}
   *      onStepClick={handleSidebarClick}
   *    />
   *
   * 3. Dentro de PublicacionStepper, al hacer clic en un paso:
   *    onClick={() => onStepClick(index)}
   *
   * Reglas:
   *  Hacia atrás: siempre permitido.
   *  Hacia adelante: solo si ya está en completedSteps o es opcional.
   *  Paso obligatorio no completado: muestra mensaje, no cambia el paso.
   */
  const handleSidebarClick = useCallback((index: number) => {
    setBlockMsg(null)
    setPublishError(null)
    if (index === currentStep) return
    if (index < currentStep) { setCurrentStep(index); return }
    if (completedSteps.has(index) || STEPS[index].opcional) {
      setCurrentStep(index)
    } else {
      setBlockMsg('Debes completar los pasos anteriores antes de avanzar a este.')
    }
  }, [currentStep, completedSteps])

  if (!hydrated) return null

  return (
    <main
      style={{
        ...DISENO.pagina,
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: DISENO.alineacionVertical,
        padding: `${DISENO.paddingVertical} 16px`, fontFamily: 'var(--font-geist-sans)',
      }}
    >
      <div style={{ width: '100%', maxWidth: DISENO.contenedor.maxWidth }}>
        <h1 style={DISENO.tituloPagina}>Crear publicación</h1>
      </div>

      <div
        style={{
          width: '100%', maxWidth: DISENO.contenedor.maxWidth, height: DISENO.contenedor.height,
          display: 'flex', borderRadius: '12px', overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        }}
      >
        {/* Panel izquierdo
            Reemplazar este <div> completo por:

            <PublicacionStepper
              currentStep={currentStep}
              completedSteps={completedSteps}
              steps={STEPS}
              onStepClick={handleSidebarClick}
            />
        */}
        <div
          style={{
            width: DISENO.panelIzquierdo.width, flexShrink: 0,
            backgroundColor: DISENO.panelIzquierdo.backgroundColor,
            padding: DISENO.panelIzquierdo.padding, display: 'flex', flexDirection: 'column',
          }}
        >
          <p style={{ color: '#fff', fontSize: '11px', opacity: 0.5, marginTop: 'auto', textAlign: 'center' }}>
            Stepper — otro equipo
          </p>
        </div>

        {/* Panel derecho */}
        <div
          style={{
            flex: 1, backgroundColor: DISENO.panelDerecho.backgroundColor,
            padding: DISENO.panelDerecho.padding, paddingBottom: DISENO.panelDerecho.paddingBottom,
            display: 'flex', flexDirection: 'column',
          }}
        >
          <h2 style={{ ...DISENO.tituloPaso, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>
            {STEPS[currentStep].title}
            {STEPS[currentStep].opcional && (
              <span style={{ fontSize: '12px', fontWeight: 400, marginLeft: '8px', opacity: 0.6 }}>
                (opcional)
              </span>
            )}
          </h2>

          {/* Mensaje de bloqueo de navegación */}
          {blockMsg && (
            <div style={{
              backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px',
              padding: '8px 12px', marginBottom: '10px', fontSize: '13px', color: '#991b1b', flexShrink: 0,
            }}>
              {blockMsg}
            </div>
          )}

          {/* Error de publicación */}
          {publishError && (
            <div style={{
              backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px',
              padding: '8px 12px', marginBottom: '10px', fontSize: '13px', color: '#991b1b', flexShrink: 0,
            }}>
              {publishError}
            </div>
          )}

          <div style={{ ...DISENO.cuadroForm, flex: 1, overflowY: 'auto' }}>
            <StepContent
              step={currentStep}
              advanceDirect={currentStep === 6 ? handlePublicar : advanceDirect}
              onBack={handleBack}
              triggerRefs={triggerRefs}
              imagenesRef={imagenesRef}
            />
          </div>

          <div style={{
            display: 'flex', justifyContent: 'flex-end',
            gap: DISENO.botones.gap, marginTop: DISENO.botones.marginTop, flexShrink: 0,
          }}>
            <button
              type="button"
              onClick={handleBack}
              disabled={isPublishing}
              style={{
                ...DISENO.botonRegresar,
                cursor: isPublishing ? 'not-allowed' : 'pointer',
                backgroundColor: '#F4EFE6',
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
                ...DISENO.botonSiguiente,
                cursor: isPublishing ? 'not-allowed' : 'pointer',
                opacity: isPublishing ? 0.6 : 1,
              }}
            >
              {isPublishing ? 'Publicando...' : isLastStep ? 'Publicar' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}