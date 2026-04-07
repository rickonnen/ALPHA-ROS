/**
 * Dev: Gabriel Paredes
 * Date modification: 06/04/2026
 * Funcionalidad: Componente para subir imágenes de un inmueble con
 *                validación de formato, peso, resolución y aspecto
 * Corrección: asterisco (*) en label de campo obligatorio
 * @param {ImageUploaderProps} props - files, onChange, onRemove, error, touched
 * @return {JSX.Element} Uploader de imágenes con previsualizaciones y validaciones
 */

'use client'

import React, { useRef, useState, useEffect, startTransition } from 'react'
import { File as FileIcon, X } from 'lucide-react'

const MAX_FILES       = 5
const MAX_SIZE_BYTES  = 10 * 1024 * 1024
const MIN_WIDTH       = 1280
const MIN_HEIGHT      = 720
const ACCEPTED_TYPES  = ['image/jpeg', 'image/png']
const ACCEPTED_RATIOS = [4 / 3, 16 / 9]
const RATIO_TOLERANCE = 0.02

const SESSION_KEY = 'imageUploader_userInteracted'

export interface ImageUploaderProps {
  files?:    File[]
  onChange?: (files: File[]) => void
  onRemove?: (index: number) => void
  error?:    string
  touched?:  boolean
}

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

export function ImageUploader({ files = [], onChange, onRemove, error, touched }: ImageUploaderProps) {
  const inputRef                      = useRef<HTMLInputElement>(null)
  const [fieldError,  setFieldError]  = useState<string | null>(null)
  const [wasVisited,  setWasVisited]  = useState<boolean>(false)

  useEffect(() => {
    try {
      const interacted = sessionStorage.getItem(SESSION_KEY) === 'true'
      if (interacted && files.length === 0) {
        startTransition(() => setWasVisited(true))
      } else {
        sessionStorage.removeItem(SESSION_KEY)
      }
    } catch { /* SSR */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const limitReached = files.length >= MAX_FILES

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldError(null)
    setWasVisited(false)
    const file = e.target.files?.[0]
    if (!file) return

    e.target.value = ''

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFieldError('Solo se aceptan imágenes en formato JPG y PNG.')
      return
    }

    if (file.size > MAX_SIZE_BYTES) {
      setFieldError('El archivo supera el peso máximo de 10 MB.')
      return
    }

    if (files.length >= MAX_FILES) {
      setFieldError(`No puedes agregar más de ${MAX_FILES} imágenes.`)
      return
    }

    const { ok, error: dimError } = await validateImageDimensions(file)
    if (!ok) {
      setFieldError(dimError ?? 'Imagen no válida.')
      return
    }

    try {
      sessionStorage.setItem(SESSION_KEY, 'true')
    } catch { /* SSR */ }

    onChange?.([file])
  }

  const handleButtonClick = () => {
    if (limitReached) {
      setFieldError(`No puedes agregar más de ${MAX_FILES} imágenes.`)
      return
    }
    setFieldError(null)
    setWasVisited(false)
    inputRef.current?.click()
  }

  const handleRemove = (index: number) => {
    setFieldError(null)
    if (files.length === 1) {
      try { sessionStorage.removeItem(SESSION_KEY) } catch { /* SSR */ }
      setWasVisited(false)
    }
    onRemove?.(index)
  }

  const showExternalError = touched && !!error
  const showFieldError    = !!fieldError
  const showRedBorder     = !limitReached && (showFieldError || showExternalError)

  return (
    <div className="flex flex-col gap-2">

      <label className="text-sm font-medium text-[#2E2E2E]">
        Insertar imagen de la propiedad <span className="font-normal text-muted-foreground">*</span>
      </label>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        aria-hidden="true"
        onChange={handleFileChange}
      />

      <button
        type="button"
        aria-label="Subir imagen"
        onClick={handleButtonClick}
        className={[
          'flex items-center justify-between w-full',
          'border rounded-md px-3 py-2',
          'text-sm text-left transition-colors',
          limitReached
            ? 'bg-gray-50 cursor-not-allowed text-gray-300'
            : `bg-white cursor-pointer ${showRedBorder ? '' : 'hover:border-gray-400'}`,
          showRedBorder ? 'border-red-400' : 'border-gray-300',
        ].join(' ')}
      >
        {limitReached
          ? <span className="text-gray-300 text-sm">Límite de 5 imágenes alcanzado</span>
          : <span className="text-gray-300 text-sm select-none">&nbsp;</span>
        }
        <FileIcon className="w-5 h-5 shrink-0 text-gray-700" />
      </button>

      {showFieldError && (
        <span className="text-red-500 text-sm">{fieldError}</span>
      )}

      {showExternalError && (
        <span className="text-red-500 text-sm">{error}</span>
      )}

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

      {files.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          {files.length} / {MAX_FILES} imágenes
        </p>
      )}

      {wasVisited && files.length === 0 && (
        <span className="text-red-500" style={{ fontSize: '14px' }}>
          Por favor, inserte su imagen de nuevo.
        </span>
      )}

    </div>
  )
}