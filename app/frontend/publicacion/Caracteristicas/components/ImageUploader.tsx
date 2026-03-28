'use client'

import React, { useRef, useState } from 'react'
import { File as FileIcon, X } from 'lucide-react'

// ─── Constantes (CA-21 / CA-22 / CA-23 / CA-24 / CA-25) ──────────────────────

const MAX_FILES       = 5
const MAX_SIZE_BYTES  = 10 * 1024 * 1024
const MIN_WIDTH       = 1280
const MIN_HEIGHT      = 720
const ACCEPTED_TYPES  = ['image/jpeg', 'image/png']
const ACCEPTED_RATIOS = [4 / 3, 16 / 9]
const RATIO_TOLERANCE = 0.02

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ImageUploaderProps {
  files?:    File[]
  onChange?: (files: File[]) => void
  onRemove?: (index: number) => void
  error?:    string
  touched?:  boolean
}

// ─── Validación de dimensiones y aspecto ─────────────────────────────────────

function validateImageDimensions(
  file: File,
): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      const { width, height } = img

      if (width < MIN_WIDTH || height < MIN_HEIGHT) {
        URL.revokeObjectURL(url)
        return resolve({
          ok:    false,
          error: `Resolución mínima requerida: ${MIN_WIDTH}×${MIN_HEIGHT}px. La imagen tiene ${width}×${height}px.`,
        })
      }

      const ratio      = width / height
      const ratioValid = ACCEPTED_RATIOS.some(
        (r) => Math.abs(ratio - r) <= RATIO_TOLERANCE,
      )

      if (!ratioValid) {
        URL.revokeObjectURL(url)
        return resolve({
          ok:    false,
          error: 'Relación de aspecto no aceptada. Solo se permiten imágenes en proporción 4:3 o 16:9.',
        })
      }

      URL.revokeObjectURL(url)
      resolve({ ok: true })
    }

    img.src = url
  })
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function ImageUploader({ files = [], onChange, onRemove, error, touched }: ImageUploaderProps) {
  const inputRef                    = useRef<HTMLInputElement>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)

  // ── Estado controlado externamente por el hook ────────────────────────────
  const limitReached = files.length >= MAX_FILES

  // ── Manejo de archivo seleccionado ──────────────────────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldError(null)
    const file = e.target.files?.[0]
    if (!file) return

    e.target.value = ''

    // CA-21: formato
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFieldError('Solo se aceptan imágenes en formato JPG y PNG.')
      return
    }

    // CA-25: peso
    if (file.size > MAX_SIZE_BYTES) {
      setFieldError('El archivo supera el peso máximo de 10 MB.')
      return
    }

    // CA-22: límite
    if (files.length >= MAX_FILES) return

    // CA-23 + CA-24: dimensiones y aspecto
    const { ok, error: dimError } = await validateImageDimensions(file)
    if (!ok) {
      setFieldError(dimError ?? 'Imagen no válida.')
      return
    }

    onChange?.([file])
  }

  // ── Eliminar imagen ──────────────────────────────────────────────────────────

  const handleRemove = (index: number) => {
    setFieldError(null)
    onRemove?.(index)
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const showExternalError = touched && error
  const showFieldError    = !!fieldError

  return (
    <div className="flex flex-col gap-2">

      {/* Label */}
      <label className="text-sm font-medium text-[#2E2E2E]">
        Insertar imagen de la propiedad
      </label>

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        aria-hidden="true"
        onChange={handleFileChange}
      />

      {/* Trigger — input falso con ícono de archivo */}
      <button
        type="button"
        aria-label="Subir imagen"
        disabled={limitReached}
        onClick={() => inputRef.current?.click()}
        className={[
          'flex items-center justify-between w-full',
          'border border-gray-300 rounded-md px-3 py-2',
          'text-sm text-left transition-colors',
          limitReached
            ? 'bg-gray-50 cursor-not-allowed text-gray-300'
            : 'bg-white cursor-pointer hover:border-gray-400',
        ].join(' ')}
      >
        {limitReached
          ? <span className="text-gray-300 text-sm">Límite de 5 imágenes alcanzado</span>
          : <span className="text-gray-300 text-sm select-none">&nbsp;</span>
        }
        <FileIcon className="w-5 h-5 shrink-0 text-gray-700" />
      </button>

      {/* Error de validación del campo */}
      {showFieldError && (
        <span className="text-red-500 text-sm">{fieldError}</span>
      )}

      {/* Error externo del hook */}
      {showExternalError && (
        <span className="text-red-500 text-sm">{error}</span>
      )}

      {/* Vistas previas */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
          {files.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="relative rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt={`Vista previa ${idx + 1}`}
                aria-label={`Vista previa ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                aria-label={`Eliminar imagen ${idx + 1}`}
                onClick={() => handleRemove(idx)}
                className="absolute top-1 right-1 bg-white/80 hover:bg-white rounded-full p-0.5 shadow"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Contador — solo visible cuando hay imágenes */}
      {files.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          {files.length} / {MAX_FILES} imágenes
        </p>
      )}

    </div>
  )
}