'use client'

import { useRef, useState, useEffect } from 'react'
import { useImagenesForm } from './useImagenesForm'
import { MAX_FILES }       from './useImagenesTypes'

interface ImagenesFormProps {
  onNext:           () => void
  onBack:           () => void
  submitRef:        React.MutableRefObject<(() => void) | null>
  onImagesChange:   (files: File[]) => void
  imagenesIniciales?: string[]
  onUrlsChange?:      (urlsQueQuedan: string[], urlsABorrar: string[]) => void
  sessionKey: string
}

export function ImagenesForm({
  onNext, onBack, submitRef, onImagesChange,
  imagenesIniciales = [], onUrlsChange,
  sessionKey,
}: ImagenesFormProps) {
  const {
    values, errors, touched, fieldError,
    previews, limitReached,
    handleAgregar, handleEliminar, handleSubmit,
  } = useImagenesForm(sessionKey)

  const [urlsExistentes, setUrlsExistentes] = useState<string[]>(imagenesIniciales)
  const [urlsABorrar,    setUrlsABorrar]    = useState<string[]>([])
  const [selectedIdx,    setSelectedIdx]    = useState(0)

  const [prevImagenes, setPrevImagenes] = useState<string[]>(imagenesIniciales)

  if (prevImagenes !== imagenesIniciales) {
    setPrevImagenes(imagenesIniciales)
    setUrlsExistentes(imagenesIniciales)
    setUrlsABorrar([])
    setSelectedIdx(0)
  }

  const inputRef                = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    submitRef.current = () => {
      if (urlsExistentes.length > 0 || values.imagenes.length > 0) {
        onNext()
        return
      }
      handleSubmit(() => onNext())
    }
    return () => { submitRef.current = null }
  }, [handleSubmit, onNext, submitRef, urlsExistentes, values.imagenes])

  useEffect(() => {
    onImagesChange(values.imagenes)
  }, [values.imagenes, onImagesChange])

  useEffect(() => {
    onUrlsChange?.(urlsExistentes, urlsABorrar)
  }, [urlsExistentes, urlsABorrar, onUrlsChange])

  const handleEliminarUrl = (url: string) => {
    setUrlsExistentes(prev => prev.filter(u => u !== url))
    setUrlsABorrar(prev => [...prev, url])
    setSelectedIdx(0)
  }

  const totalCount   = urlsExistentes.length + values.imagenes.length
  const puedeAgregar = totalCount < MAX_FILES

  const previewsCombinados = [
    ...urlsExistentes,
    ...previews,
  ]

  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragging(true)  }
  const handleDragLeave = ()                    => { setDragging(false) }
  const handleDrop      = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) handleAgregar(e.dataTransfer.files)
  }

  const hasFiles  = totalCount > 0
  const showError = (touched && !!errors.imagenes) || !!fieldError

  // Clases responsivas para miniaturas:
  // mobile  → w-16 h-12  (64×48px)  — wrap en 3+2
  // desktop → w-28 h-20  (112×80px) — fila única
  const thumbClass = `
    relative rounded-lg overflow-hidden flex-shrink-0 transition-all
    w-16 h-12
    sm:w-24 sm:h-16
    md:w-28 md:h-20
  `

  return (
    <div className="flex flex-col gap-4 h-full">

      {/* Contador */}
      <div className="flex justify-end">
        <span className="text-xs text-gray-500 font-medium">
          {totalCount}/{MAX_FILES} Imágenes
        </span>
      </div>

      {/* Sin imágenes: zona de drop */}
      {!hasFiles && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="flex-1 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors"
          style={{
            borderColor:     dragging ? '#C26E5A' : '#D4B8AE',
            backgroundColor: dragging ? '#f9ede9' : '#EDE8E0',
            minHeight:       '220px',
          }}
        >
          <svg viewBox="0 0 64 64" fill="none" style={{ width: '64px', height: '64px' }}>
            <path
              d="M46 28.5C45.3 21.4 39.3 16 32 16c-5.8 0-10.8 3.4-13.2 8.4C14.5 24.9 10 29.6 10 35.5 10 41.9 15.1 47 21.5 47H45c5.5 0 10-4.5 10-10 0-5.1-3.8-9.3-8.7-9.9-.1 0-.2 0-.3.1z"
              stroke="#C26E5A" strokeWidth="2"
            />
            <line x1="32" y1="47" x2="32" y2="31" stroke="#C26E5A" strokeWidth="2" strokeLinecap="round"/>
            <polyline points="26,38 32,31 38,39" stroke="#C26E5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="text-center">
            <p className="text-sm font-semibold text-[#1F3A4D]">Arrastra tus imagenes aqui</p>
            <p className="text-xs text-gray-500 mt-0.5">o haga click para seleccionar</p>
            <p className="text-xs text-gray-400 mt-0.5">Minimo 1 - Maximo 5</p>
          </div>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
            className="mt-1 px-5 py-2 text-sm font-semibold text-white rounded-full"
            style={{ backgroundColor: '#1F3A4D' }}
          >
            Seleccionar Archivos
          </button>
        </div>
      )}

      {/* Con imágenes */}
      {hasFiles && (
        <div className="flex flex-col gap-3 flex-1">

          {/* Imagen principal */}
          <div
            className="relative rounded-xl overflow-hidden"
            style={{ backgroundColor: '#F4EFE6' }}
          >
            <img
              src={previewsCombinados[selectedIdx]}
              alt={`Imagen principal ${selectedIdx + 1}`}
              className="w-full object-contain"
              style={{ maxHeight: '220px', width: '100%' }}
            />
            <button
              type="button"
              onClick={() => {
                const esUrlExistente = selectedIdx < urlsExistentes.length
                if (esUrlExistente) {
                  handleEliminarUrl(urlsExistentes[selectedIdx])
                } else {
                  const idxEnNuevas = selectedIdx - urlsExistentes.length
                  handleEliminar(idxEnNuevas)
                }
                setSelectedIdx(prev => Math.max(0, prev - 1))
              }}
              className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1 shadow"
            >
              <svg className="w-4 h-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Miniaturas responsivas */}
          <div className="flex flex-wrap md:flex-nowrap gap-2">

            {previewsCombinados.map((src, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={thumbClass}
                style={{
                  border:          idx === selectedIdx ? '2px solid #C26E5A' : '2px solid transparent',
                  backgroundColor: '#EDE8E0',
                }}
              >
                <img src={src} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}

            {puedeAgregar && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className={`${thumbClass} flex flex-col items-center justify-center border-2 border-dashed gap-0.5`}
                style={{
                  borderColor:     '#D4B8AE',
                  backgroundColor: '#EDE8E0',
                }}
              >
                <span className="text-lg leading-none text-[#C26E5A] font-light">+</span>
                <span className="text-[9px] text-[#C26E5A] font-medium leading-none">Insertar</span>
                <span className="text-[9px] text-[#C26E5A] font-medium leading-none">Imagen</span>
              </button>
            )}
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        className="hidden"
        aria-hidden="true"
        onChange={e => {
          if (e.target.files?.length) handleAgregar(e.target.files)
          e.target.value = ''
        }}
      />

      {showError && !hasFiles && (
        <span className="text-red-500 text-xs">
          {fieldError ?? errors.imagenes}
        </span>
      )}
    </div>
  )
}