'use client'

import { useCaracteristicasForm } from './Hooks/useCaracteristicasForm'
import { DireccionForm }          from './Components/DireccionForm'
import { DepartamentoSelect }     from './Components/DepartamentoSelect'
import { HabitacionesForm }       from './Components/HabitacionesForm'
import { ImageUploader }          from './Components/ImageUploader'
import { Button }                 from '@/components/ui/button'

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

  const onChange = handleChange as (field: string, value: string) => void
  const onBlur   = handleBlur   as (field: string) => void

  const onSubmit = () => {
    handleSubmit((formValues) => {
      console.log('Formulario válido, datos listos para enviar:', formValues)
    })
  }

  return (
    <main className="min-h-screen bg-[#F4EFE6] p-8 font-[family-name:var(--font-geist-sans)]">
      {/* Título principal — color primario #1F3A4D */}
      <h1 className="text-4xl font-bold mb-6 text-[#1F3A4D]">
        Crear publicación
      </h1>

      <div className="max-w-2xl mx-auto bg-white rounded-xl p-8">
        {/* Título de la sección */}
        <h2 className="text-center font-semibold text-lg tracking-wide mb-6 uppercase text-[#2E2E2E]">
          Caracteristicas del inmueble
        </h2>

        <div className="flex flex-col gap-4">

          {/* Campos: Dirección y Superficie — Tarea 2.1.1 */}
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

          {/* Selector: Departamento — Tarea 2.1.1 */}
          <DepartamentoSelect
            value={values.departamento}
            error={errors.departamento}
            touched={touched.departamento ?? false}
            onChange={onChange}
            onBlur={onBlur}
          />

          {/* Campo: Zona — Tarea 2.1.1 */}
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

          {/* Campos numéricos: Habitaciones, Baños, Garajes, Plantas — Tarea 2.1.2 */}
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

          {/* ImageUploader — Tarea 2.5 */}
          <ImageUploader
            files={values.imagenes}
            onChange={handleAgregarImagenes}
            onRemove={handleEliminarImagen}
            error={errors.imagenes}
            touched={touched.imagenes ?? false}
          />

          {/* Espacio reservado para VideoUrlInput — Tarea 2.X */}
          {/* TODO: agregar <VideoUrlInput /> cuando esté listo */}

          {/* Botones de navegación */}
          <div
            data-testid="form-actions"
            className="flex justify-end gap-3 mt-4"
          >
            {/* Regresar — borde y texto terracota */}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // TODO: navegar a sección 1 conservando datos (Tarea 2.9)
              }}
              className="border-[#C26E5A] text-[#C26E5A] hover:bg-[#C26E5A]/10 px-8 py-5 text-base font-semibold"
            >
              Regresar
            </Button>

            {/* Publicar — fondo terracota */}
            <Button
              type="button"
              onClick={onSubmit}
              className="bg-[#C26E5A] hover:bg-[#a85a48] text-white px-8 py-5 text-base font-semibold"
            >
              Publicar
            </Button>
          </div>

        </div>
      </div>
    </main>
  )
}