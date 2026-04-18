'use client'

import { useState }      from 'react'
import { useRouter }     from 'next/navigation'
import { DatosAvisoForm } from '@/features/publicacion/FormularioDinamicoCaracteristicas/Datos_Aviso/DatosAvisoForm'

//Componentes del form 
// Descomenta cada import cuando tengas el componente listo
// import { CategoriaEstadoForm } from '@/features/publicacion/FormularioDinamicoCaracteristicas/Categoria_Estado/CategoriaEstadoForm'
// import { UbicacionForm }       from '@/features/publicacion/steps/UbicacionForm'
// import { CaracteristicasForm } from '@/features/publicacion/steps/CaracteristicasForm'
// import { ImagenesForm }        from '@/features/publicacion/steps/ImagenesForm'
// import { VideoForm }           from '@/features/publicacion/steps/VideoForm'
// import { DescripcionForm }     from '@/features/publicacion/steps/DescripcionForm'

//Componente del stepper (stefa y andres) 
// import { PublicacionStepper }  from '@/features/publicacion/components/PublicacionStepper'

// ── Componentes UI 
import { Button } from '@/components/ui/button'


// Configuración de pasos
// Aquí defines el título que aparece en el cuadro azul
// y el componente que se renderiza en cada paso

const STEPS = [
  { title: 'Datos del Aviso'    },
  { title: 'Categoría y Estado' },
  { title: 'Ubicación'          },
  { title: 'Características'    },
  { title: 'Imágenes'           },
  { title: 'Video'              },
  { title: 'Descripción'        },
]

// 
//  AJUSTES DE DISEÑO — Toca solo esta sección para personalizar
// 
const DISENO = {

  // Fondo de toda la página
  pagina: {
    backgroundColor: '#F4EFE6',
  },

  // Posición vertical de todo dentro de <main>
  // 'center' = centrado en pantalla | 'flex-start' = más arriba
  alineacionVertical: 'center' as 'center' | 'flex-start',

  // Padding top/bottom de <main>
  // Súbelo para bajar todo el contenido, bájalo para subirlo
  paddingVertical: '24px',

  // Título "Crear publicación"  encima del contenedor
  tituloPagina: {
    fontSize:     '60px',
    fontWeight:   '700',
    color:        '#1F3A4D',
    marginBottom: '20px',   // separación entre título y contenedor
    marginLeft:   '-120px', // negativo = izquierda | positivo = derecha
    marginTop:    '40px',   // baja el título aumentando este valor
  },

  // Contenedor principal (naranja + azul juntos)
  contenedor: {
    maxWidth: '1000px',
    height:   '560px',
  },

  // Panel izquierdo naranja (stepper — otro equipo)
  panelIzquierdo: {
    width:           '340px',
    backgroundColor: '#C26E5A',
    padding:         '20px',
  },

  // Panel derecho azul
  // padding controla el espacio entre el borde azul y el cuadro crema
  // paddingBottom controla el espacio entre los botones y el borde inferior
  panelDerecho: {
    backgroundColor: '#1F3A4D',
    padding:         '50px',
    paddingBottom:   '20px', // ← espacio entre botones y borde inferior del panel
  },

  // Título dinámico del paso (dentro del panel azul, encima del cuadro crema)
  tituloPaso: {
    fontSize:     '20px',
    fontWeight:   '600',
    color:        '#ffffff',
    marginBottom: '20px',  // separación entre el título y el cuadro crema
    marginLeft:   '0px',   // negativo = izquierda | positivo = derecha
  },

  // Cuadro donde se renderiza el form
  cuadroForm: {
    backgroundColor: '#F4EFE6',
    borderRadius:    '12px',
    padding:         '25px',
  },

  // Botones de navegación
  botones: {
    gap:       '12px',
    marginTop: '15px', // 'auto' = se pegan al borde inferior | px = separación fija
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
// Fin de ajustes de diseño
// Placeholder temporal — reemplaza por el componente real
// cuando esté listo
function StepPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded-lg">
      Componente: {title} (en desarrollo)
    </div>
  )
}


// Decide qué componente renderizar según el paso actual
// Cuando tengas cada componente listo:
//   1. Descomenta el import arriba
//   2. Reemplaza el StepPlaceholder por el componente real
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
    // case 0: return <DatosAvisoForm onNext={onNext} onBack={onBack} />

    case 1: return <StepPlaceholder title={STEPS[1].title} />
    // case 1: return <CategoriaEstadoForm onNext={onNext} onBack={onBack} />

    case 2: return <StepPlaceholder title={STEPS[2].title} />
    // case 2: return <UbicacionForm onNext={onNext} onBack={onBack} />

    case 3: return <StepPlaceholder title={STEPS[3].title} />
    // case 3: return <CaracteristicasForm onNext={onNext} onBack={onBack} />

    case 4: return <StepPlaceholder title={STEPS[4].title} />
    // case 4: return <ImagenesForm onNext={onNext} onBack={onBack} />

    case 5: return <StepPlaceholder title={STEPS[5].title} />
    // case 5: return <VideoForm onNext={onNext} onBack={onBack} />

    case 6: return <StepPlaceholder title={STEPS[6].title} />
    // case 6: return <DescripcionForm onNext={onNext} onBack={onBack} />

    default: return null
  }
}


// ─────────────────────────────────────────────────────────────
// Page principal
// ─────────────────────────────────────────────────────────────
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

      {/* Título de la página*/}
      <div style={{ width: '100%', maxWidth: DISENO.contenedor.maxWidth }}>
        <h1 style={DISENO.tituloPagina}>
          Crear publicación
        </h1>
      </div>

      {/* Contenedor principal (naranja + azul) */}
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

        {/*  Panel izquierdo — stepper (otro equipo)
            Cuando el otro equipo entregue su componente:
            Reemplaza el contenido de este div por:
            <PublicacionStepper currentStep={currentStep} steps={STEPS} />
            Props que necesita el componente:
              - currentStep: número del paso actual (0–6)
              - steps: array con los títulos de cada paso
         */}
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
          {/* Placeholder del stepper */}
          <p style={{ color: '#fff', fontSize: '11px', opacity: 0.5, marginTop: 'auto', textAlign: 'center' }}>
            Stepper — otro equipo
          </p>
        </div>

        {/* Panel derecho — azul */}
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

          {/* Título dinámico del paso */}
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

          {/* Cuadro del form */}
          <div
            style={{
              ...DISENO.cuadroForm,
              flex:      1,
              overflowY: 'auto',
            }}
          >
            <StepContent
              step={currentStep}
              onNext={handleNext}
              onBack={handleBack}
            />
          </div>

          {/* Botones de navegación */}
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