'use client'

import { useState } from 'react'
import { useCaracteristicasForm } from './Hooks/useCaracteristicasForm'
import { DireccionForm } from './components/DireccionForm'
import { DepartamentoSelect } from './components/DepartamentoSelect'
import { HabitacionesForm } from './components/HabitacionesForm'
import { ImageUploader } from './components/ImageUploader'
import { VideoSection } from './components/VideoSection'
import { Button } from '@/components/ui/button'
import { publicarConImagenes } from '@/app/backend/publicacion/CaracteristicasBackend/actions'
import { useRouter } from "next/navigation"

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitOk, setSubmitOk] = useState(false)

  const [strVideoUrl, setStrVideoUrl] = useState(() => {
    if (typeof window === "undefined") return ""
    return sessionStorage.getItem("videoUrl") ?? ""
  })

  const onChange = handleChange as (field: string, value: string) => void
  const onBlur = handleBlur as (field: string) => void

  const handleVideoUrl = (url: string) => {
    setStrVideoUrl(url)
    sessionStorage.setItem("videoUrl", url)
  }

  const onSubmit = () => {
    setSubmitError(null)

    handleSubmit(async (formValues) => {
      setIsSubmitting(true)

      try {
        const strPaso1 = sessionStorage.getItem("informacionComercial")
        if (!strPaso1) {
          setSubmitError("Faltan datos del paso 1. Regresa y completa el formulario.")
          setIsSubmitting(false)
          return
        }
        const objPaso1 = JSON.parse(strPaso1)

        const formData = new FormData()
        formData.append('titulo', objPaso1.titulo)
        formData.append('precio', objPaso1.precio)
        formData.append('tipoPropiedad', objPaso1.tipoPropiedad)
        formData.append('tipoOperacion', objPaso1.tipoOperacion)
        formData.append('descripcion', objPaso1.descripcion)
        formData.append('direccion', formValues.direccion)
        formData.append('superficie', formValues.superficie.replace(/\./g, ''))
        formData.append('departamento', formValues.departamento)
        formData.append('zona', formValues.zona)
        formData.append('habitaciones', formValues.habitaciones)
        formData.append('banios', formValues.banios)
        formData.append('plantas', formValues.plantas)
        formData.append('garajes', formValues.garajes)
        formValues.imagenes.forEach((file) => formData.append('imagenes', file))
        formData.append('videoUrl', strVideoUrl)

        const result = await publicarConImagenes(formData)

        if (result.success) {
          sessionStorage.removeItem("informacionComercial")
          sessionStorage.removeItem("informacionComercialDraft")
          sessionStorage.removeItem("videoUrl")
          setSubmitOk(true)
          console.log("ID generado por la DB:", result.idPublicacion);
          
          // --- ÚNICO CAMBIO: REDIRECCIÓN ---
          router.push(`/frontend/publicacion/${result.idPublicacion}`);
          // ---------------------------------
          
        } else {
          const firstError = Object.values(result.errors).flat()[0] ?? null
          setSubmitError(firstError ?? 'Error al guardar. Intenta de nuevo.')
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : JSON.stringify(err)
        setSubmitError(`Error: ${msg}`)
      } finally {
        setIsSubmitting(false)
      }
    })
  }

  return (
    <main
      className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 font-[family-name:var(--font-geist-sans)]"
      
      style={{ background: "linear-gradient(to bottom, #F4EFE6 35%, #E7E1D7 35%)" }}
    >
      <div className="w-full max-w-2xl">
        <h1 className="text-xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-[#1F3A4D] pl-0 sm:pl-6 lg:pl-60">
          Crear publicación
        </h1>
      </div>

      <div className="w-full max-w-2xl mx-auto bg-white rounded-xl p-4 sm:p-8">
        <h2 className="text-center font-semibold text-base sm:text-lg tracking-wide mb-4 sm:mb-6 uppercase text-[#1F3A4D]">
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

          <div className="flex flex-col gap-1.5">
            <label htmlFor="zona" className="text-sm font-medium text-[#2E2E2E]">
              Zona
            </label>
            <input
              id="zona"
              type="text"
              maxLength={100}
              value={values.zona}
              onChange={(e) => onChange('zona', e.target.value)}
              onBlur={() => onBlur('zona')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-500"
            />
            {touched.zona && errors.zona && (
              <span className="text-red-500 text-sm">{errors.zona}</span>
            )}
          </div>

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

          {submitError && (
            <p className="text-red-500 text-sm text-center bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {submitError}
            </p>
          )}

          <div
            data-testid="form-actions"
            className="flex justify-end gap-3 mt-4"
          >
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => {
                router.push("/frontend/publicacion/informacion-comercial")
              }}
              className="border-[#C26E5A] text-[#C26E5A] hover:bg-[#C26E5A]/10 px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-base font-semibold"
            >
              Regresar
            </Button>

            <Button
              type="button"
              disabled={isSubmitting}
              onClick={onSubmit}
              className="bg-[#C26E5A] hover:bg-[#a85a48] text-white px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-base font-semibold disabled:opacity-60"
            >
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}