'use client'

import { useState }      from 'react'
import { useRouter }     from 'next/navigation'
import { DatosAvisoForm } from '@/features/publicacion/FormularioDinamicoCaracteristicas/Datos_Aviso/DatosAvisoForm'
import { CategoriaYEstadoForm } from '@/features/publicacion/FormularioDinamicoCaracteristicas/Categoria_Estado/CategoriaEstado'
import { useCategoriaForm } from '@/features/publicacion/FormularioDinamicoCaracteristicas/Categoria_Estado/useCategoriaForm'
import { CaracteristicasDetalleForm } from '@/features/publicacion/FormularioDinamicoCaracteristicas/Caracteristicas/CaracteristicasDetalleForm'
import { useCaracteristicasDetalleForm } from '@/features/publicacion/FormularioDinamicoCaracteristicas/Caracteristicas/useCaracteristicasDetalleForm'
import { ImagenesForm } from '@/features/publicacion/FormularioDinamicoCaracteristicas/Imagenes/ImagenesForm'
import { VideoForm }    from '@/features/publicacion/FormularioDinamicoCaracteristicas/Video/Videoform'
// import { PublicacionStepper }  from '@/features/publicacion/components/PublicacionStepper'

import { Button } from '@/components/ui/button'

const STEPS = [
  { title: 'Datos del Aviso'    },
  { title: 'Categoría y Estado' },
  { title: 'Ubicación'          },
  { title: 'Características'    },
  { title: 'Imágenes'           },
  { title: 'Video '              },
  { title: 'Descripción'        },
]

const DISENO = {
  pagina: {
    backgroundColor: '#F4EFE6',
  },
  alineacionVertical: 'center' as 'center' | 'flex-start',
  paddingVertical: '24px',
  tituloPagina: {
    fontSize:     '60px',
    fontWeight:   '700',
    color:        '#1F3A4D',
    marginBottom: '20px',
    marginLeft:   '-120px',
    marginTop:    '40px',
  },
  contenedor: {
    maxWidth: '1000px',
    height:   '560px',
  },
  panelIzquierdo: {
    width:           '340px',
    backgroundColor: '#C26E5A',
    padding:         '20px',
  },
  panelDerecho: {
    backgroundColor: '#1F3A4D',
    padding:         '50px',
    paddingBottom:   '20px',
  },
  tituloPaso: {
    fontSize:     '20px',
    fontWeight:   '600',
    color:        '#ffffff',
    marginBottom: '20px',
    marginLeft:   '0px',
  },
  cuadroForm: {
    backgroundColor: '#F4EFE6',
    borderRadius:    '12px',
    padding:         '15px',
  },
  botones: {
    gap:       '12px',
    marginTop: '15px',
  },
  botonRegresar: {
    backgroundColor: '#F4EFE6',
    border:          '1.5px solid #C26E5A',
    color:           '#C26E5A',
    borderRadius:    '6px',
    padding:         '5px 20px',
    fontSize:        '16px',
    fontWeight:      '600',
  },
  botonSiguiente: {
    backgroundColor: '#C26E5A',
    border:          '1.5px solid #C26E5A',
    color:           '#ffffff',
    borderRadius:    '6px',
    padding:         '5px 20px',
    fontSize:        '16px',
    fontWeight:      '600',
  },
}

function StepPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded-lg">
      Componente: {title} (en desarrollo)
    </div>
  )
}

function CategoriaEstadoStep() {
  const { values, errors, touched, handleChange, handleBlur } = useCategoriaForm()
  return (
    <CategoriaYEstadoForm
      values={values}
      errors={errors}
      touched={touched}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  )
}

function CaracteristicasDetalleStep() {
  const { values, errors, touched, handleChange, handleBlur } = useCaracteristicasDetalleForm()
  return (
    <CaracteristicasDetalleForm
      values={values}
      errors={errors}
      touched={touched}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  )
}

function StepContent({
  step,
  onNext,
  onBack,
}: {
  step:   number
  onNext: () => void
  onBack: () => void
}) {
  switch (step) {
    case 0: return <DatosAvisoForm onNext={onNext} onBack={onBack} />
    case 1: return <CategoriaEstadoStep />
    case 2: return <StepPlaceholder title={STEPS[2].title} />
    case 3: return <CaracteristicasDetalleStep />
    case 4: return <ImagenesForm onNext={onNext} onBack={onBack} />
    case 5: return <VideoForm onNext={onNext} onBack={onBack} />
    case 6: return <StepPlaceholder title={STEPS[6].title} />
    default: return null
  }
}

export default function CrearPublicacionPage() {
  const router                        = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  const isFirstStep = currentStep === 0
  const isLastStep  = currentStep === STEPS.length - 1

  const handleNext = () => { if (!isLastStep) setCurrentStep(prev => prev + 1) }
  const handleBack = () => {
    if (isFirstStep) router.back()
    else setCurrentStep(prev => prev - 1)
  }

  return (
    <main
      style={{
        ...DISENO.pagina,
        minHeight:      '100vh',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: DISENO.alineacionVertical,
        padding:        `${DISENO.paddingVertical} 16px`,
        fontFamily:     'var(--font-geist-sans)',
      }}
    >
      <div style={{ width: '100%', maxWidth: DISENO.contenedor.maxWidth }}>
        <h1 style={DISENO.tituloPagina}>
          Crear publicación
        </h1>
      </div>

      <div
        style={{
          width:        '100%',
          maxWidth:     DISENO.contenedor.maxWidth,
          height:       DISENO.contenedor.height,
          display:      'flex',
          borderRadius: '12px',
          overflow:     'hidden',
          boxShadow:    '0 4px 24px rgba(0,0,0,0.12)',
        }}
      >
        <div
          style={{
            width:           DISENO.panelIzquierdo.width,
            flexShrink:      0,
            backgroundColor: DISENO.panelIzquierdo.backgroundColor,
            padding:         DISENO.panelIzquierdo.padding,
            display:         'flex',
            flexDirection:   'column',
          }}
        >
          <p style={{ color: '#fff', fontSize: '11px', opacity: 0.5, marginTop: 'auto', textAlign: 'center' }}>
            Stepper — otro equipo
          </p>
        </div>

        <div
          style={{
            flex:            1,
            backgroundColor: DISENO.panelDerecho.backgroundColor,
            padding:         DISENO.panelDerecho.padding,
            paddingBottom:   DISENO.panelDerecho.paddingBottom,
            display:         'flex',
            flexDirection:   'column',
          }}
        >
          <h2
            style={{
              ...DISENO.tituloPaso,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              flexShrink:    0,
            }}
          >
            {STEPS[currentStep].title}
          </h2>

          <div
            style={{
              ...DISENO.cuadroForm,
              flex:      1,
              overflowY: 'visible',
            }}
          >
            <StepContent
              step={currentStep}
              onNext={handleNext}
              onBack={handleBack}
            />
          </div>

          <div
            style={{
              display:        'flex',
              justifyContent: 'flex-end',
              gap:            DISENO.botones.gap,
              marginTop:      DISENO.botones.marginTop,
              flexShrink:     0,
            }}
          >
            <button
              type="button"
              onClick={handleBack}
              style={{ ...DISENO.botonRegresar, cursor: 'pointer', backgroundColor: '#F4EFE6' }}
            >
              Regresar
            </button>

            <button
              type="button"
              onClick={handleNext}
              style={{ ...DISENO.botonSiguiente, cursor: 'pointer' }}
            >
              {isLastStep ? 'Publicar' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}