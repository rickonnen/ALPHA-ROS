'use client'

/**
 * Dev: Gabriel Paredes Sipe
 * Date modification: 18/04/2026
 * Corrección: Se integra el modal de límite de publicaciones en el submit final
 * Corrección: Se agrega modal de confirmación antes de publicar el inmueble
 * HU5 (solo visual): el paso 2 ahora navega a /publicacion/sumario
 * tras validar los datos, sin publicar directamente desde esta vista.
 */

import { useState } from 'react'
import { useCaracteristicasForm } from '@/features/publicacion/caracteristicas/Hooks/useCaracteristicasForm'
import { DireccionForm } from '@/features/publicacion/caracteristicas/components/DireccionForm'
import { DepartamentoSelect } from '@/features/publicacion/caracteristicas/components/DepartamentoSelect'
import { ZonaInput } from '@/features/publicacion/caracteristicas/components/Zona'
import { HabitacionesForm } from '@/features/publicacion/caracteristicas/components/HabitacionesForm'
import { ImageUploader } from '@/features/publicacion/caracteristicas/components/ImageUploader'
import { VideoSection } from '@/features/publicacion/caracteristicas/components/VideoSection'
import { SumarioModal } from '@/features/publicacion/sumario/components/SumarioModal'
import { Button } from '@/components/ui/button'
import { publicarConImagenes } from '@/features/publicacion/CaracteristicasBackend/actions'
import { useRouter } from "next/navigation"
import FreePublicationLimitModal from '@/features/publicacion/components/FreePublicationLimitModal'

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
    handleReset,
  } = useCaracteristicasForm()

  const router = useRouter()
  const [isSubmitting,          setIsSubmitting]          = useState(false)
  const [submitError,           setSubmitError]           = useState<string | null>(null)
  const [submitOk,              setSubmitOk]              = useState(false)
  const [bolShowModal,          setBolShowModal]          = useState(false)
  const [bolConfirmar,          setBolConfirmar]          = useState(false)
  const [strErrorNavegacion,    setStrErrorNavegacion]    = useState<string | null>(null)
  const [bolShowSumarioModal,   setBolShowSumarioModal]   = useState(false)

  const [strVideoUrl, setStrVideoUrl] = useState(() => {
    if (typeof window === "undefined") return ""
    return sessionStorage.getItem("videoUrl") ?? ""
  })

  const onChange = handleChange as (field: string, value: string) => void
  const onBlur   = handleBlur   as (field: string) => void

  const handleVideoUrl = (url: string) => {
    setStrVideoUrl(url)
    sessionStorage.setItem("videoUrl", url)
  }

  const guardarPreviewImagenes = (files: File[]) => {
    try {
      const arrPreviews = files.map((file) => URL.createObjectURL(file))
      const arrNombres  = files.map((file) => file.name)
      sessionStorage.setItem('caracteristicasImagenesPreview', JSON.stringify(arrPreviews))
      sessionStorage.setItem('caracteristicasImagenesNombres', JSON.stringify(arrNombres))
    } catch {
      // Solo visual: si falla el preview, el sumario muestra placeholders.
    }
  }

  // HU5: primero validar el form, si pasa mostrar SumarioModal
  const onClickSiguiente = () => {
    setStrErrorNavegacion(null)
    handleSubmit((formValues) => {
      const strPaso1 = sessionStorage.getItem('informacionComercial')
      if (!strPaso1) {
        setStrErrorNavegacion('Faltan datos del paso 1. Regresa y completa el formulario.')
        return
      }
      guardarPreviewImagenes(formValues.imagenes)
      setBolShowSumarioModal(true)
    })
  }

  // RM2-13: el usuario confirmó en el modal, ahora sí publicar
  const onConfirmarPublicar = () => {
    setBolConfirmar(false)
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
        formData.append('titulo',        objPaso1.titulo)
        formData.append('precio',        objPaso1.precio)
        formData.append('tipoPropiedad', objPaso1.tipoPropiedad)
        formData.append('tipoOperacion', objPaso1.tipoOperacion)
        formData.append('descripcion',   objPaso1.descripcion)
        formData.append('id_usuario',    objPaso1.id_usuario ?? '')
        formData.append('direccion',    formValues.direccion)
        formData.append('superficie',   formValues.superficie.replace(/\./g, ''))
        formData.append('departamento', formValues.departamento)
        formData.append('zona',         formValues.zona)
        formData.append('habitaciones', formValues.habitaciones)
        formData.append('banios',       formValues.banios)
        formData.append('plantas',      formValues.plantas)
        formData.append('garajes',      formValues.garajes)
        formValues.imagenes.forEach((file) => formData.append('imagenes', file))
        formData.append('videoUrl', strVideoUrl)

        const result = await publicarConImagenes(formData)

        if (result.success) {
          sessionStorage.removeItem("caracteristicasInmueble")
          sessionStorage.removeItem("caracteristicasInmuebleUsuario")
          sessionStorage.removeItem("informacionComercialDraft")
          sessionStorage.removeItem("informacionComercialDraftUsuario")
          sessionStorage.removeItem("informacionComercial")
          sessionStorage.removeItem("videoUrl")
          sessionStorage.removeItem("imageUploader_userInteracted")
          setSubmitOk(true)
          console.log("ID generado por la DB:", result.idPublicacion)
          router.push(`/publicacion/perfil_del_inmueble/${result.idPublicacion}`)
        } else {
          if (result.reason === "LIMITE_ALCANZADO") {
            setBolShowModal(true)
          } else {
            const firstError = result.errors ? Object.values(result.errors).flat()[0] : null
            setSubmitError(firstError as string ?? 'Error al guardar. Intenta de nuevo.')
          }
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
        <h1 className="text-xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-[#1F3A4D] pl-0 sm:pl-6 lg:pl-40">
          Crear publicación
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

          <VideoSection
            onURLChange={handleVideoUrl}
            defaultUrl={strVideoUrl}
          />

          {(submitError || strErrorNavegacion) && (
            <p className="text-red-500 text-sm text-center bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {submitError ?? strErrorNavegacion}
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
              onClick={() => router.push("/publicacion/informacion-comercial")}
              className="border-[#C26E5A] text-[#C26E5A] hover:bg-[#C26E5A]/10 px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-base font-semibold"
            >
              Regresar
            </Button>

            <Button
              type="button"
              disabled={isSubmitting}
              onClick={onClickSiguiente}
              className="bg-[#C26E5A] hover:bg-[#a85a48] text-white px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-base font-semibold disabled:opacity-60"
            >
              {isSubmitting ? 'Publicando...' : 'Siguiente'}
            </Button>
          </div>
        </div>
      </div>

      {/* HU5: SumarioModal — se abre al pasar la validación del paso 2 */}
      {bolShowSumarioModal && (
        <SumarioModal
          onClose={() => setBolShowSumarioModal(false)}
        />
      )}

      {/* RM2-13: Modal de confirmación antes de publicar */}
      {bolConfirmar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-4 flex flex-col gap-4">
            <h3 className="text-base font-semibold text-[#1F3A4D] text-center">
              ¿Confirmar publicación?
            </h3>
            <p className="text-sm text-gray-500 text-center">
              ¿Estás seguro de que deseas publicar este inmueble? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-center mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBolConfirmar(false)}
                className="border-[#C26E5A] text-[#C26E5A] hover:bg-[#C26E5A]/10 px-6 py-2 font-semibold"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={onConfirmarPublicar}
                className="bg-[#C26E5A] hover:bg-[#a85a48] text-white px-6 py-2 font-semibold"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* HU5: Modal de límite de publicaciones */}
      <FreePublicationLimitModal
        bolOpen={bolShowModal}
        onBack={() => setBolShowModal(false)}
      />
    </main>
  )
}