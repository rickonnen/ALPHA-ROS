'use client'

import { useRef, useEffect } from 'react'
import { DatosAvisoForm }            from '@/features/publicacion/FormularioDinamicoCaracteristicas/Datos_Aviso/DatosAvisoForm'
import { CategoriaYEstadoForm }      from '@/features/publicacion/FormularioDinamicoCaracteristicas/Categoria_Estado/CategoriaEstado'
import { useCategoriaForm }          from '@/features/publicacion/FormularioDinamicoCaracteristicas/Categoria_Estado/useCategoriaForm'
import { UbicacionForm }             from '@/features/publicacion/FormularioDinamicoCaracteristicas/Ubicacion/UbicacionForm'
import { CaracteristicasDetalleForm } from '@/features/publicacion/FormularioDinamicoCaracteristicas/Caracteristicas/CaracteristicasDetalleForm'
import { useCaracteristicasDetalleForm } from '@/features/publicacion/FormularioDinamicoCaracteristicas/Caracteristicas/useCaracteristicasDetalleForm'
import { ImagenesForm }              from '@/features/publicacion/FormularioDinamicoCaracteristicas/Imagenes/ImagenesForm'
import { VideoForm }                 from '@/features/publicacion/FormularioDinamicoCaracteristicas/Video/Videoform'
import { DescripcionForm }           from '@/features/publicacion/FormularioDinamicoCaracteristicas/Descripcion/Descripcionform'

type TriggerRef = React.MutableRefObject<(() => void) | null>

// ─── Hook auxiliar para conectar triggerRef con handleSubmit ──────────────────
function useStableTrigger(
  triggerRef:    TriggerRef,
  handleSubmit:  (cb: () => void) => void,
  advanceDirect: () => void,
) {
  const submitRef  = useRef(handleSubmit)
  const advanceRef = useRef(advanceDirect)
  useEffect(() => { submitRef.current  = handleSubmit })
  useEffect(() => { advanceRef.current = advanceDirect })
  useEffect(() => {
    triggerRef.current = () => submitRef.current(() => advanceRef.current())
    return () => { triggerRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerRef])
}

// ─── Paso 1: Categoría y Estado ───────────────────────────────────────────────
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

// ─── Paso 3: Características ──────────────────────────────────────────────────
function CaracteristicasDetalleStep({
  triggerRef,
  advanceDirect,
}: {
  triggerRef:    TriggerRef
  advanceDirect: () => void
}) {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useCaracteristicasDetalleForm()
  const tipoPropiedad = (() => {
    try {
      const raw = sessionStorage.getItem('categoriaYEstado')
      return raw ? (JSON.parse(raw).tipoPropiedad ?? '') : ''
    } catch { return '' }
  })()
  useStableTrigger(triggerRef, handleSubmit, advanceDirect)
  return (
    <CaracteristicasDetalleForm
      values={values} errors={errors} touched={touched}
      tipoPropiedad={tipoPropiedad}
      onChange={handleChange} onBlur={handleBlur}
    />
  )
}

// ─── Props de StepContent ─────────────────────────────────────────────────────
export interface StepContentProps {
  step:              number
  advanceDirect:     () => void
  onBack:            () => void
  triggerRefs:       Record<number, TriggerRef>
  imagenesRef:       React.MutableRefObject<File[]>
  imagenesIniciales: string[]
  onUrlsChange:      (quedan: string[], aBorrar: string[]) => void
  sessionKey:        string
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function StepContent({
  step, advanceDirect, onBack, triggerRefs,
  imagenesRef, imagenesIniciales, onUrlsChange, sessionKey,
}: StepContentProps) {
  switch (step) {
    case 0:
      return (
        <DatosAvisoForm
          onNext={advanceDirect} onBack={onBack}
          submitRef={triggerRefs[0]}
        />
      )
    case 1:
      return (
        <CategoriaEstadoStep
          triggerRef={triggerRefs[1]}
          advanceDirect={advanceDirect}
        />
      )
    case 2:
      return (
        <UbicacionForm
          onNext={advanceDirect} onBack={onBack}
          submitRef={triggerRefs[2]}
        />
      )
    case 3:
      return (
        <CaracteristicasDetalleStep
          triggerRef={triggerRefs[3]}
          advanceDirect={advanceDirect}
        />
      )
    case 4:
      return (
        <ImagenesForm
          onNext={advanceDirect} onBack={onBack}
          submitRef={triggerRefs[4]}
          sessionKey={sessionKey}
          imagenesIniciales={imagenesIniciales}
          onUrlsChange={onUrlsChange}
          onImagesChange={(files) => {
            imagenesRef.current = files
            try {
              sessionStorage.setItem('caracteristicasImagenesPreview', JSON.stringify(files.map(f => URL.createObjectURL(f))))
              sessionStorage.setItem('caracteristicasImagenesNombres', JSON.stringify(files.map(f => f.name)))
            } catch { }
          }}
        />
      )
    case 5:
      return <VideoForm onNext={advanceDirect} onBack={onBack} />
    case 6:
      return (
        <DescripcionForm
          onNext={advanceDirect} onBack={onBack}
          submitRef={triggerRefs[6]}
        />
      )
    default:
      return null
  }
}