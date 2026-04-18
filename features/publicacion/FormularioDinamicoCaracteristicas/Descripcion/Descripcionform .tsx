/**
 * Dev: [tu nombre]
 * Date: 19/04/2026
 * Funcionalidad: Paso 7 — Descripción de la propiedad.
 *                Textarea de descripción libre con contador y validación.
 *                La sección "Características Extras" está reservada para otro dev.
 * @param {DescripcionFormProps} props - onNext, onBack
 * @return {JSX.Element} Formulario de descripción
 */
'use client'

import { Label }                               from '@/components/ui/label'
import { useDescripcionForm, MAX_DESCRIPCION } from './usedescripcionform'

interface DescripcionFormProps {
  onNext: () => void
  onBack: () => void
}

export function DescripcionForm({ onNext, onBack }: DescripcionFormProps) {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useDescripcionForm()

  const charCount        = values.descripcion.length
  const showError        = touched && !!errors.descripcion
  const onClickSiguiente = () => handleSubmit(() => onNext())

  return (
    <div className="flex flex-col h-full" style={{ gap: '2px' }}>

      {/* ── Descripción libre ──────────────────────────────── */}
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
          className={`w-full resize-none rounded-md border px-3 py-2 text-sm outline-none bg-white transition-colors
            focus:border-gray-500
            ${showError ? 'border-red-400' : 'border-[#D4CFC6]'}
          `}
        />

        {/* Fila error + contador — altura fija para que no desplace lo de abajo */}
        <div className="flex justify-between items-center" style={{ minHeight: '16px' }}>
          <span className="text-red-500 text-xs">
            {showError ? errors.descripcion : ''}
          </span>
          <span className="text-xs text-gray-400">
            {charCount}/{MAX_DESCRIPCION}
          </span>
        </div>
      </div>

      {/* ── Características Extras — reservado para otro dev ──
          Espacio disponible: desde aquí hasta el borde inferior del cuadroForm.
          El diseño incluye (ver mockup paso 7):
            - Título "Caracteristicas Extras" + badge "-Opcional"
            - Contador "X/4" de extras agregados
            - Botón [+] + chips eliminables (ej: Balcon ×, Piscina ×, Jardín ×)
            - Input "¿Qué título de característica desea colocar?"
            - Input "Ingrese una descripción de la característica"
          Props sugeridas para el sub-componente:
            - extras: { titulo: string; descripcion: string }[]
            - onAgregar:  (extra: { titulo: string; descripcion: string }) => void
            - onEliminar: (index: number) => void
      ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 flex-1 min-h-0">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-semibold text-[#1A1714]">Caracteristicas Extras</span>
          <span className="text-sm font-normal text-[#C26E5A]">-Opcional</span>
        </div>

        {/* Zona reservada — reemplazar por el componente real */}
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