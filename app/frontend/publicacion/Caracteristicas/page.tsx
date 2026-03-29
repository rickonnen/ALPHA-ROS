'use client'

import { useState }               from 'react'
import { useCaracteristicasForm } from './Hooks/useCaracteristicasForm'
import { DireccionForm }          from './Components/DireccionForm'
import { DepartamentoSelect }     from './Components/DepartamentoSelect'
import { HabitacionesForm }       from './Components/HabitacionesForm'
import { ImageUploader }          from './Components/ImageUploader'
import { Button }                 from '@/components/ui/button'
import { publicarConImagenes }    from '@/app/backend/publicacion/CaracteristicasBackend/actions'

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

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError,  setSubmitError]  = useState<string | null>(null)
  const [submitOk,     setSubmitOk]     = useState(false)

  const onChange = handleChange as (field: string, value: string) => void
  const onBlur   = handleBlur   as (field: string) => void

  const onSubmit = () => {
    setSubmitError(null)

    handleSubmit(async (formValues) => {
      setIsSubmitting(true)
      try {
        const formData = new FormData()
        formData.append('direccion',    formValues.direccion)
        formData.append('superficie',   formValues.superficie.replace(/\./g, ''))
        formData.append('departamento', formValues.departamento)
        formData.append('zona',         formValues.zona)
        formData.append('habitaciones', formValues.habitaciones)
        formData.append('banios',       formValues.banios)
        formData.append('plantas',      formValues.plantas)
        formData.append('garajes',      formValues.garajes)
        formValues.imagenes.forEach((file) => formData.append('imagenes', file))

        const result = await publicarConImagenes(formData)

        if (result.success) {
          setSubmitOk(true)
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

  if (submitOk) {
    return (
      <main className="min-h-screen bg-[#F4EFE6] flex items-center justify-center px-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center flex flex-col gap-4">
          <div className="text-5xl">✓</div>
          <h2 className="text-3xl font-semibold text-[#1F3A4D]">
            ¡Publicación registrada con éxito!
          </h2>
          <p className="text-base text-gray-500">
            Tu inmueble ya está guardado y visible en la plataforma.
          </p>
          <Button
            type="button"
            className="bg-[#C26E5A] hover:bg-[#a85a48] text-white mt-2"
            onClick={() => setSubmitOk(false)}
          >
            Crear otra publicación
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F4EFE6] px-4 py-6 sm:px-6 sm:py-8 font-[family-name:var(--font-geist-sans)]">

      {/* H1: text-3xl mobile, text-5xl desktop */}
      <h1 className="text-3xl sm:text-3xl font-bold mb-4 sm:mb-6 text-[#1F3A4D]">
        Crear publicación
      </h1>

      <div className="w-full max-w-2xl mx-auto bg-white rounded-xl p-4 sm:p-8">

        {/* Subtítulo sección: text-xl font-medium */}
        <h2 className="text-center font-medium text-xl tracking-wide mb-4 sm:mb-6 uppercase text-[#2E2E2E]">
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
              banios:       errors.banios,
              plantas:      errors.plantas,
              garajes:      errors.garajes,
            }}
            touched={{
              habitaciones: touched.habitaciones ?? false,
              banios:       touched.banios       ?? false,
              plantas:      touched.plantas      ?? false,
              garajes:      touched.garajes      ?? false,
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

          {submitError && (
            <p className="text-sm text-red-500 text-center bg-red-50 border border-red-200 rounded-md px-3 py-2">
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
                // TODO: navegar a sección 1 conservando datos (Tarea 2.9)
              }}
              className="border-[#C26E5A] text-[#C26E5A] hover:bg-[#C26E5A]/10 px-6 sm:px-8 py-4 sm:py-5 text-sm font-semibold"
            >
              Regresar
            </Button>

            <Button
              type="button"
              disabled={isSubmitting}
              onClick={onSubmit}
              className="bg-[#C26E5A] hover:bg-[#a85a48] text-white px-6 sm:px-8 py-4 sm:py-5 text-sm font-semibold disabled:opacity-60"
            >
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </Button>
          </div>

        </div>
      </div>
    </main>
  )
}