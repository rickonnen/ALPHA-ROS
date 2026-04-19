/**
 * Dev: [tu nombre]
 * Date: 19/04/2026
 * Funcionalidad: Paso 7 — Descripción de la propiedad.
 * CAMBIO: se agregó prop opcional `submitRef` para que la page pueda
 *         disparar la validación desde el botón "Siguiente" externo.
 */
'use client'

import { useEffect }                               from 'react'
import { Label }                                   from '@/components/ui/label'
import { useDescripcionForm, MAX_DESCRIPCION }     from './Usedescripcionform'

interface DescripcionFormProps {
  onNext:    () => void
  onBack:    () => void
  submitRef?: React.MutableRefObject<(() => void) | null>
}

export function DescripcionForm({ onNext, onBack, submitRef }: DescripcionFormProps) {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useDescripcionForm()

  // Exponer handleSubmit hacia la page — sin deps para que siempre esté fresco
  useEffect(() => {
    if (!submitRef) return
    submitRef.current = () => handleSubmit(() => onNext())
  })
  useEffect(() => {
    if (!submitRef) return
    return () => { submitRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitRef])

  const charCount = values.descripcion.length
  const showError = touched && !!errors.descripcion

  return (
    <div className="flex flex-col h-full" style={{ gap: '2px' }}>

      {/* Descripción libre */}
      <div className="flex flex-col gap-1 flex-shrink-0">
        <Label htmlFor="descripcion" className="text-sm font-medium text-[#1A1714]">
          Añada una descripción de su propiedad
        </Label>
        <textarea
          id="descripcion"
          value={values.descripcion}
          maxLength={MAX_DESCRIPCION}
          onChange={e => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder="Escribe una descripción"
          rows={3}
          className={`w-full resize-none rounded-md border px-3 py-2 text-sm outline-none bg-white transition-colors focus:border-gray-500 ${
            showError ? 'border-red-400' : 'border-[#D4CFC6]'
          }`}
        />
        <div className="flex justify-between items-center" style={{ minHeight: '16px' }}>
          <span className="text-red-500 text-xs">{showError ? errors.descripcion : ''}</span>
          <span className="text-xs text-gray-400">{charCount}/{MAX_DESCRIPCION}</span>
        </div>
      </div>

      {/* Características Extras — reservado para otro dev */}
      <div className="flex flex-col gap-1 flex-1 min-h-0">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-semibold text-[#1A1714]">Caracteristicas Extras</span>
          <span className="text-sm font-normal text-[#C26E5A]">-Opcional</span>
        </div>
        <div
          className="flex-1 flex items-center justify-center rounded-xl border-2 border-dashed"
          style={{ borderColor: '#D4CFC6', backgroundColor: '#EDE8E0' }}
        >
          <p className="text-xs text-gray-400 text-center px-4">
            Sección pendiente de implementación.
          </p>
        </div>
      </div>

    </div>
  )
}