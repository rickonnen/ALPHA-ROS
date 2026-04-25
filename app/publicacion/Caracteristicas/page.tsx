'use client'

/**
 * Dev: Gabriel Paredes Sipe
 * Date modification: 18/04/2026
 * HU5 (solo visual): el paso 2 ahora navega a /publicacion/sumario
 * tras validar los datos, sin publicar directamente desde esta vista.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { useCaracteristicasForm } from '@/features/publicacion/caracteristicas/Hooks/useCaracteristicasForm'
import { DireccionForm } from '@/features/publicacion/caracteristicas/components/DireccionForm'
import { DepartamentoSelect } from '@/features/publicacion/caracteristicas/components/DepartamentoSelect'
import { ZonaInput } from '@/features/publicacion/caracteristicas/components/Zona'
import { HabitacionesForm } from '@/features/publicacion/caracteristicas/components/HabitacionesForm'
import { ImageUploader } from '@/features/publicacion/caracteristicas/components/ImageUploader'
import { VideoSection } from '@/features/publicacion/caracteristicas/components/VideoSection'
import { SumarioModal } from '@/features/publicacion/sumario/components/SumarioModal'
import { Button } from '@/components/ui/button'

const SUMARIO_VISIBLE_KEY = 'publicacionSumarioVisible'

export default function CaracteristicasPage() {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    handleAgregarImagenes,
    handleEliminarImagen,
  } = useCaracteristicasForm()

  const router = useRouter()
  const [strErrorNavegacion, setStrErrorNavegacion] = useState<string | null>(null)
  const [bolShowSumarioModal, setBolShowSumarioModal] = useState(() => {
    if (typeof window === 'undefined') return false

    const bolSumarioVisible = sessionStorage.getItem(SUMARIO_VISIBLE_KEY) === 'true'
    if (!bolSumarioVisible) return false

    const strPaso1 = sessionStorage.getItem('informacionComercial')
    const strPaso2 = sessionStorage.getItem('caracteristicasInmueble')
    const bolTieneDatosRecuperables = Boolean(strPaso1 || strPaso2)

    if (!bolTieneDatosRecuperables) {
      sessionStorage.removeItem(SUMARIO_VISIBLE_KEY)
      return false
    }

    return true
  })

  const [strVideoUrl, setStrVideoUrl] = useState(() => {
    if (typeof window === 'undefined') return ''
    return sessionStorage.getItem('videoUrl') ?? ''
  })

  const onChange = handleChange as (field: string, value: string) => void
  const onBlur = handleBlur as (field: string) => void

  const handleVideoUrl = (url: string) => {
    setStrVideoUrl(url)
    sessionStorage.setItem('videoUrl', url)
  }

  const limpiarBanderaSumario = () => {
    if (typeof window === 'undefined') return
    sessionStorage.removeItem(SUMARIO_VISIBLE_KEY)
  }

  const limpiarSugerenciaActiva = () => {
    if (typeof document === 'undefined') return
    const objElementoActivo = document.activeElement
    if (objElementoActivo instanceof HTMLElement) {
      objElementoActivo.blur()
    }
  }

  const guardarPreviewImagenes = (files: File[]) => {
    try {
      const arrPreviewsNuevas = files.map((file) => URL.createObjectURL(file))
      const arrNombresNuevos = files.map((file) => file.name)

      const arrPreviewsGuardadas = JSON.parse(sessionStorage.getItem('caracteristicasImagenesPreview') ?? '[]')
      const arrNombresGuardados = JSON.parse(sessionStorage.getItem('caracteristicasImagenesNombres') ?? '[]')

      const arrPreviewsPrevias: string[] = []
      const arrNombresPrevios: string[] = []

      if (Array.isArray(arrPreviewsGuardadas)) {
        arrPreviewsGuardadas.forEach((item, index) => {
          const strPreview = typeof item === 'string' ? item.trim() : ''
          if (!strPreview || strPreview.startsWith('blob:')) return

          arrPreviewsPrevias.push(strPreview)

          const strNombre = Array.isArray(arrNombresGuardados) && typeof arrNombresGuardados[index] === 'string'
            ? String(arrNombresGuardados[index]).trim()
            : ''
          arrNombresPrevios.push(strNombre || `Imagen ${arrPreviewsPrevias.length}`)
        })
      }

      const arrPreviews = [...arrPreviewsPrevias, ...arrPreviewsNuevas]
      const arrNombres = [...arrNombresPrevios, ...arrNombresNuevos]
      sessionStorage.setItem('caracteristicasImagenesPreview', JSON.stringify(arrPreviews))
      sessionStorage.setItem('caracteristicasImagenesNombres', JSON.stringify(arrNombres))
    } catch {
      // Solo visual: si falla el preview, el sumario muestra placeholders.
    }
  }

  const onClickSiguiente = () => {
    setStrErrorNavegacion(null)
    handleSubmit((formValues) => {
      const strPaso1 = sessionStorage.getItem('informacionComercial')
      if (!strPaso1) {
        setStrErrorNavegacion('Faltan datos del paso 1. Regresa y completa el formulario.')
        return
      }
      guardarPreviewImagenes(formValues.imagenes)
      limpiarSugerenciaActiva()
      sessionStorage.setItem(SUMARIO_VISIBLE_KEY, 'true')
      setBolShowSumarioModal(true)
    })
  }

  return (
    <main
      className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 font-[family-name:var(--font-geist-sans)]"
      style={{ background: 'linear-gradient(to bottom, #F4EFE6 35%, #E7E1D7 35%)' }}
    >
      <div className="w-full max-w-2xl">
        <h1 className="text-xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-[#1F3A4D] pl-0 sm:pl-6 lg:pl-40">
          Crear publicacion
        </h1>
      </div>

      <div className="w-full max-w-2xl mx-auto bg-white rounded-xl p-4 sm:p-8 mt-8">
        <h2 className="text-center font-semibold text-base sm:text-lg tracking-wide mb-4 sm:mb-6 uppercase text-black">
          Caracteristicas del inmueble
        </h2>

        <div className="flex flex-col gap-4">
          <DireccionForm
            addressValue={values.direccion}
            areaValue={values.superficie}
            addressError={errors.direccion}
            areaError={errors.superficie}
            addressTouched={touched.direccion ?? false}
            areaTouched={touched.superficie ?? false}
            onChange={onChange}
            onBlur={onBlur}
          />

          <DepartamentoSelect
            value={values.departamento}
            error={errors.departamento}
            touched={touched.departamento ?? false}
            onChange={onChange}
            onBlur={onBlur}
          />

          <ZonaInput
            value={values.zona}
            error={errors.zona}
            touched={touched.zona ?? false}
            onChange={onChange}
            onBlur={onBlur}
          />

          <HabitacionesForm
            bedroomsValue={values.habitaciones}
            bathroomsValue={values.banios}
            floorsValue={values.plantas}
            garagesValue={values.garajes}
            errors={{
              habitaciones: errors.habitaciones,
              banios: errors.banios,
              plantas: errors.plantas,
              garajes: errors.garajes,
            }}
            touched={{
              habitaciones: touched.habitaciones ?? false,
              banios: touched.banios ?? false,
              plantas: touched.plantas ?? false,
              garajes: touched.garajes ?? false,
            }}
            onChange={onChange}
            onBlur={onBlur}
          />

          <ImageUploader
            files={values.imagenes}
            onChange={handleAgregarImagenes}
            onRemove={handleEliminarImagen}
            error={errors.imagenes}
            touched={touched.imagenes ?? false}
          />

          <VideoSection
            onURLChange={handleVideoUrl}
            defaultUrl={strVideoUrl}
          />

          {strErrorNavegacion && (
            <p className="text-red-500 text-sm text-center bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {strErrorNavegacion}
            </p>
          )}

          <div
            data-testid="form-actions"
            className="flex justify-end gap-3 mt-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/publicacion/informacion-comercial')}
              className="border-[#C26E5A] text-[#C26E5A] hover:bg-[#C26E5A]/10 px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-base font-semibold"
            >
              Regresar
            </Button>

            <Button
              type="button"
              onClick={onClickSiguiente}
              className="bg-[#C26E5A] hover:bg-[#a85a48] text-white px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-base font-semibold"
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      {bolShowSumarioModal && (
        <SumarioModal
          onClose={() => {
            limpiarBanderaSumario()
            setBolShowSumarioModal(false)
          }}
          onGoPaso1={() => {
            limpiarBanderaSumario()
            setBolShowSumarioModal(false)
            router.push('/publicacion/informacion-comercial')
          }}
          onGoPaso2={() => {
            limpiarBanderaSumario()
            setBolShowSumarioModal(false)
          }}
        />
      )}
    </main>
  )
}
