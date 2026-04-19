'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DatosAvisoForm }        from '@/features/publicacion/FormularioDinamicoCaracteristicas/Datos_Aviso/DatosAvisoForm'
import { CategoriaYEstadoForm }  from '@/features/publicacion/FormularioDinamicoCaracteristicas/Categoria_Estado/CategoriaEstado'
import { useCategoriaForm }      from '@/features/publicacion/FormularioDinamicoCaracteristicas/Categoria_Estado/useCategoriaForm'
import { UbicacionForm }         from '@/features/publicacion/FormularioDinamicoCaracteristicas/Ubicacion/UbicacionForm'
import { CaracteristicasDetalleForm }    from '@/features/publicacion/FormularioDinamicoCaracteristicas/Caracteristicas/CaracteristicasDetalleForm'
import { useCaracteristicasDetalleForm } from '@/features/publicacion/FormularioDinamicoCaracteristicas/Caracteristicas/useCaracteristicasDetalleForm'
import { ImagenesForm }    from '@/features/publicacion/FormularioDinamicoCaracteristicas/Imagenes/ImagenesForm'
import { VideoForm }       from '@/features/publicacion/FormularioDinamicoCaracteristicas/Video/Videoform'
import { DescripcionForm } from '@/features/publicacion/FormularioDinamicoCaracteristicas/Descripcion/Descripcionform'
// import { PublicacionStepper } from '@/features/publicacion/components/PublicacionStepper'

//sessionStorage
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

//Pasos
const STEPS = [
  { title: 'Datos del Aviso',    opcional: false },
  { title: 'Categoría y Estado', opcional: false },
  { title: 'Ubicación',          opcional: false },
  { title: 'Características',    opcional: false },
  { title: 'Imágenes',           opcional: false },
  { title: 'Video',              opcional: true  },
  { title: 'Descripción',        opcional: false },
]

//Tipo ref
type TriggerRef = React.MutableRefObject<(() => void) | null>

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

//Paso 1: Categoría y Estado
function CategoriaEstadoStep({ triggerRef, advanceDirect }: { triggerRef: TriggerRef, advanceDirect: () => void }) {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useCategoriaForm()
  useStableTrigger(triggerRef, handleSubmit, advanceDirect)
  return <CategoriaYEstadoForm values={values} errors={errors} touched={touched} onChange={handleChange} onBlur={handleBlur} />
}

//Paso 3: Características
function CaracteristicasDetalleStep({ triggerRef, advanceDirect }: { triggerRef: TriggerRef, advanceDirect: () => void }) {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useCaracteristicasDetalleForm()
  useStableTrigger(triggerRef, handleSubmit, advanceDirect)
  return <CaracteristicasDetalleForm values={values} errors={errors} touched={touched} onChange={handleChange} onBlur={handleBlur} />
}

//Contenido del paso activo
function StepContent({ step, advanceDirect, onBack, triggerRefs }: { step: number, advanceDirect: () => void, onBack: () => void, triggerRefs: Record<number, TriggerRef> }) {
  switch (step) {
    case 0: return <DatosAvisoForm onNext={advanceDirect} onBack={onBack} submitRef={triggerRefs[0]} />
    case 1: return <CategoriaEstadoStep triggerRef={triggerRefs[1]} advanceDirect={advanceDirect} />
    case 2: return <UbicacionForm onNext={advanceDirect} onBack={onBack} submitRef={triggerRefs[2]} />
    case 3: return <CaracteristicasDetalleStep triggerRef={triggerRefs[3]} advanceDirect={advanceDirect} />
    case 4: return <ImagenesForm onNext={advanceDirect} onBack={onBack} submitRef={triggerRefs[4]} />
    case 5: return <VideoForm onNext={advanceDirect} onBack={onBack} />
    case 6: return <DescripcionForm onNext={advanceDirect} onBack={onBack} submitRef={triggerRefs[6]} />
    default: return null
  }
}

//Página principal
export default function CrearPublicacionPage() {
  const router = useRouter()

  const [currentStep,    setCurrentStep]    = useState<number>(() =>
    typeof window !== 'undefined' ? leerPaso() : 0
  )
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(() =>
    typeof window !== 'undefined' ? leerCompletados() : new Set()
  )
  const [hydrated,  setHydrated]  = useState(() => typeof window !== 'undefined')
  const [blockMsg,  setBlockMsg]  = useState<string | null>(null)

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

  const handleNext = useCallback(() => {
    if (isLastStep) return
    setBlockMsg(null)
    if (currentStep === 5) { advanceDirect(); return }
    triggerRefs[currentStep]?.current?.()
  }, [isLastStep, currentStep, advanceDirect, triggerRefs])

  const handleBack = useCallback(() => {
    setBlockMsg(null)
    if (isFirstStep) router.back()
    else setCurrentStep(prev => prev - 1)
  }, [isFirstStep, router])

  const handleSidebarClick = useCallback((index: number) => {
    setBlockMsg(null)
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
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 lg:p-8 bg-[#F4EFE6] font-[family-name:var(--font-geist-sans)]">
      
      {/* Título de la página adaptativo */}
      <div className="w-full max-w-[1000px] mb-4 md:mb-6">
        <h1 className="text-3xl md:text-5xl lg:text-[60px] font-bold text-[#1F3A4D] lg:-ml-[20px] mt-4 md:mt-8">
          Crear publicación
        </h1>
      </div>

      {/* Contenedor Principal: Se apila en móvil (flex-col) y se pone lado a lado en PC (md:flex-row) */}
      <div className="w-full max-w-[1000px] flex flex-col md:flex-row bg-white rounded-xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.12)] md:h-[600px] lg:h-[650px]">
        
        {/* Panel izquierdo (Stepper) */}
        <div className="w-full md:w-[280px] lg:w-[340px] bg-[#C26E5A] p-4 md:p-6 flex flex-col shrink-0">
          <p className="text-white text-xs opacity-50 mt-auto text-center">
            Stepper — otro equipo
          </p>
        </div>

        {/* Panel derecho (Formularios) */}
        <div className="flex-1 bg-[#1F3A4D] p-4 md:p-8 lg:p-[50px] lg:pb-5 flex flex-col h-[500px] md:h-auto">
          
          <h2 className="text-lg md:text-xl font-semibold text-white mb-4 uppercase tracking-wider shrink-0">
            {STEPS[currentStep].title}
            {STEPS[currentStep].opcional && (
              <span className="text-xs font-normal ml-2 opacity-60 normal-case">(opcional)</span>
            )}
          </h2>

          {blockMsg && (
            <div className="bg-red-100 border border-red-300 rounded-md p-2 md:p-3 mb-3 text-xs md:text-sm text-red-800 shrink-0">
              {blockMsg}
            </div>
          )}

          {/* Cuadro Form: ESTE es el que tiene overflow-y-auto. */}
          <div className="bg-[#F4EFE6] rounded-xl p-3 md:p-4 flex-1 overflow-y-auto custom-scrollbar">
            <StepContent
              step={currentStep}
              advanceDirect={advanceDirect}
              onBack={handleBack}
              triggerRefs={triggerRefs}
            />
          </div>

          {/* Botones de Navegación Responsivos */}
          <div className="flex justify-end gap-3 mt-4 shrink-0">
            <button 
              type="button" 
              onClick={handleBack}
              className="bg-[#F4EFE6] border-2 border-[#C26E5A] text-[#C26E5A] rounded-md px-4 md:px-5 py-1.5 md:py-2 text-sm md:text-base font-semibold hover:bg-[#F0DDD9] transition-colors"
            >
              Regresar
            </button>
            <button 
              type="button" 
              onClick={handleNext}
              className="bg-[#C26E5A] border-2 border-[#C26E5A] text-white rounded-md px-4 md:px-5 py-1.5 md:py-2 text-sm md:text-base font-semibold hover:bg-[#a65d4b] transition-colors"
            >
              {isLastStep ? 'Publicar' : 'Siguiente'}
            </button>
          </div>
          
        </div>
      </div>
    </main>
  )
}