/**
 * Dev: Gabriel Paredes
 * Date: 19/04/2026
 * Funcionalidad: Descripción de la propiedad e integración de Características Extras
 *
 * FIXES v5:
 *  1. Auto-selecciona la primera etiqueta al montar (modo edición con características ya cargadas).
 *  2. Sin autoFocus en el input de detalle — seleccionar etiqueta no entra al campo de texto.
 *  3. Dropdown usa createPortal — escapa de overflow:hidden del contenedor padre.
 *  4. Posición del dropdown via ref DOM directo (sin setState en useEffect).
 *  5. Contador del detalle ENCIMA del input.
 *  6. Sin ícono lápiz en modo lectura del título.
 */
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  useDescripcionForm,
  MAX_DESCRIPCION,
  MAX_CARACTERISTICAS,
  PREDEFINED_FEATURES,
} from './usedescripcionform'

const MAX_DETALLE = 100

// ── PortalDropdown ─────────────────────────────────────────────
interface PortalDropdownProps {
  anchorRef: React.RefObject<HTMLElement | null>
  open:      boolean
  children:  React.ReactNode
}

function PortalDropdown({ anchorRef, open, children }: PortalDropdownProps) {
  const listRef = useRef<HTMLUListElement>(null)

  const reposition = useCallback(() => {
    if (!listRef.current || !anchorRef.current) return
    const r = anchorRef.current.getBoundingClientRect()
    listRef.current.style.top   = `${r.bottom + 4}px`
    listRef.current.style.left  = `${r.left}px`
    listRef.current.style.width = `${r.width}px`
  }, [anchorRef])

  useEffect(() => {
    if (!open) return
    reposition()
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [open, reposition])

  if (!open) return null

  return createPortal(
    <ul
      ref={listRef}
      style={{
        position:        'fixed',
        top:             0,
        left:            0,
        width:           0,
        maxHeight:       200,
        zIndex:          9999,
        overflowY:       'auto',
        backgroundColor: '#ffffff',
        border:          '1px solid #e5e7eb',
        borderRadius:    '0.375rem',
        boxShadow:       '0 4px 16px rgba(0,0,0,0.14)',
        margin:          0,
        padding:         0,
        listStyle:       'none',
      }}
    >
      {children}
    </ul>,
    document.body,
  )
}

// ── Props ──────────────────────────────────────────────────────
interface DescripcionFormProps {
  onNext:     () => void
  onBack:     () => void
  submitRef?: React.MutableRefObject<(() => void) | null>
}

// ── Componente principal ───────────────────────────────────────
export function DescripcionForm({ onNext, onBack, submitRef }: DescripcionFormProps) {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    searchTerm, setSearchTerm,
    sugerencias, caracteristicaError,
    agregarCaracteristica, eliminarCaracteristica, actualizarDetalle, actualizarTitulo,
  } = useDescripcionForm()

  const [isAdding,  setIsAdding]  = useState(false)
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const [editingTitle,    setEditingTitle]    = useState(false)
  const [titleSearchTerm, setTitleSearchTerm] = useState('')
  const [detalleError,    setDetalleError]    = useState<string | null>(null)

  // Refs de anchors para los portales
  const addInputRef   = useRef<HTMLInputElement | null>(null)
  const titleInputRef = useRef<HTMLInputElement | null>(null)

  // submitRef
  useEffect(() => {
    if (!submitRef) return
    submitRef.current = () => handleSubmit(() => onNext())
  })
  useEffect(() => {
    if (!submitRef) return
    return () => { submitRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitRef])

  // ── FIX 1: Auto-seleccionar la primera etiqueta al montar o cuando cambia la lista ──
  // Si no hay ninguna activa (o la activa ya no existe), selecciona la primera disponible.
  // Cuando se está en modo "añadir" no interfiere.
  useEffect(() => {
    const lista = values.caracteristicas || []
    if (lista.length === 0) {
      setActiveTag(null)
    } else if (!isAdding) {
      setActiveTag(prev =>
        prev && lista.some(c => c.titulo === prev) ? prev : lista[0].titulo
      )
    }
  }, [values.caracteristicas, isAdding])

  // Sugerencias para edición de título (derivado puro)
  const titleSugs = (() => {
    if (!titleSearchTerm.trim()) return []
    const term        = titleSearchTerm.toLowerCase()
    const yaAgregados = (values.caracteristicas || []).map(c => c.titulo.toLowerCase())
    return PREDEFINED_FEATURES
      .filter(f =>
        f.nombre.toLowerCase().startsWith(term) &&
        !yaAgregados.includes(f.nombre.toLowerCase())
      )
      .map(f => f.nombre)
  })()

  const charCount       = values.descripcion.length
  const showError       = touched && !!errors.descripcion
  const caracteristicas = values.caracteristicas || []
  const isLimitReached  = caracteristicas.length >= MAX_CARACTERISTICAS

  const handleAgregarClick = (nombreSugerido: string) => {
    const t = nombreSugerido.trim()
    if (!t) return
    agregarCaracteristica(t)
    const existe = caracteristicas.some(c => c.titulo.toLowerCase() === t.toLowerCase())
    if (!existe && !isLimitReached) {
      setActiveTag(t)
      setIsAdding(false)
      setSearchTerm('')
    }
  }

  const handleRemove = (titulo: string, e: React.MouseEvent) => {
    e.stopPropagation()
    eliminarCaracteristica(titulo)
    if (activeTag === titulo) {
      const idx       = caracteristicas.findIndex(c => c.titulo === titulo)
      const restantes = caracteristicas.filter(c => c.titulo !== titulo)
      if (restantes.length === 0) {
        setActiveTag(null)
      } else {
        const nextIdx = idx < restantes.length ? idx : restantes.length - 1
        setActiveTag(restantes[nextIdx].titulo)
      }
    }
    setEditingTitle(false)
    setTitleSearchTerm('')
    setDetalleError(null)
  }

  const handleDetalleChange = (titulo: string, value: string) => {
    if (value.length > MAX_DETALLE) {
      setDetalleError(`Máximo ${MAX_DETALLE} caracteres.`)
      return
    }
    setDetalleError(null)
    actualizarDetalle(titulo, value)
  }

  const handleTitleSelect = (nuevoTitulo: string) => {
    if (!activeTag) return
    actualizarTitulo(activeTag, nuevoTitulo)
    setActiveTag(nuevoTitulo)
    setEditingTitle(false)
    setTitleSearchTerm('')
  }

  const activeCaracteristica = caracteristicas.find(c => c.titulo === activeTag)

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full" style={{ gap: '2px' }}>

      {/* ── Descripción libre ── */}
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
          className={`w-full resize-none rounded-md border px-3 py-2 text-sm outline-none bg-white transition-colors focus:border-gray-400 ${
            showError ? 'border-red-400' : 'border-[#D4CFC6]'
          }`}
        />
        <div className="flex justify-between items-center" style={{ minHeight: '16px' }}>
          <span className="text-red-500 text-xs">{showError ? errors.descripcion : ''}</span>
          <span className="text-xs text-gray-400">{charCount}/{MAX_DESCRIPCION}</span>
        </div>
      </div>

      {/* ── Características Extras ── */}
      <div className="flex flex-col gap-2 flex-1 min-h-0 mt-2">

        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#1A1714]">Caracteristicas Extras</span>
            <span className="text-sm font-normal text-[#C26E5A]">-Opcional</span>
          </div>
          {(caracteristicas.length > 0 || isAdding) && (
            <span className="text-xs text-gray-500 font-medium">
              {caracteristicas.length}/{MAX_CARACTERISTICAS}
            </span>
          )}
        </div>

        {/* Botón "+" y Etiquetas */}
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {!isLimitReached && (
            <button
              type="button"
              onClick={() => { setIsAdding(true); setActiveTag(null); setEditingTitle(false) }}
              className="flex items-center justify-center w-8 h-8 rounded-md border-2 border-[#C26E5A] text-[#C26E5A] bg-transparent hover:bg-[#C26E5A]/10 transition-colors focus:outline-none flex-shrink-0"
              title="Añadir característica"
            >
              <span className="text-xl font-bold leading-none mb-0.5">+</span>
            </button>
          )}

          {caracteristicas.map((c) => {
            const isVisuallyActive = activeTag === c.titulo && !isAdding
            return (
              <span
                key={c.id_caracteristica}
                onClick={() => {
                  setActiveTag(c.titulo)
                  setIsAdding(false)
                  setEditingTitle(false)
                  setTitleSearchTerm('')
                  setDetalleError(null)
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold border transition-colors cursor-pointer ${
                  isVisuallyActive
                    ? 'bg-[#C26E5A] text-white border-[#C26E5A]'
                    : 'bg-transparent text-[#C26E5A] border-[#C26E5A] hover:bg-[#C26E5A]/10'
                }`}
              >
                {c.titulo}
                <button
                  type="button"
                  onClick={(e) => handleRemove(c.titulo, e)}
                  className={`${isVisuallyActive ? 'hover:text-white/70' : 'hover:text-red-700'} focus:outline-none transition-colors`}
                >
                  ✕
                </button>
              </span>
            )
          })}
        </div>

        {/* Texto de ayuda */}
        {caracteristicas.length === 0 && !isAdding && (
          <div className="flex items-center justify-center py-6">
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              En caso de necesitar ingresar más<br />
              detalles del inmueble, añada una<br />
              característica especifica de su<br />
              inmueble
            </p>
          </div>
        )}

        {/* ── Modo Añadir ── */}
        {isAdding && (
          <div className="flex flex-col gap-2 mt-2 animate-in fade-in duration-200">
            <div>
              <Label className="block text-xs font-bold text-gray-700 mb-1">
                ¿Qué título de característica desea colocar? *
              </Label>

              <Input
                ref={addInputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') { setIsAdding(false); setSearchTerm('') }
                }}
                placeholder="Ej. Piscina, Balcón"
                className="border-gray-300 w-full focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-400"
                autoFocus
              />

              <PortalDropdown
                anchorRef={addInputRef}
                open={searchTerm.trim().length > 0}
              >
                {sugerencias.length > 0 ? (
                  sugerencias.map((sug) => {
                    const yaAgregada = caracteristicas.some(
                      c => c.titulo.toLowerCase() === sug.toLowerCase()
                    )
                    return (
                      <li
                        key={sug}
                        onMouseDown={(e) => { e.preventDefault(); if (!yaAgregada) handleAgregarClick(sug) }}
                        style={{
                          padding:         '8px 16px',
                          fontSize:        14,
                          cursor:          yaAgregada ? 'not-allowed' : 'pointer',
                          backgroundColor: yaAgregada ? '#f3f4f6'    : undefined,
                          color:           yaAgregada ? '#9ca3af'    : undefined,
                        }}
                        onMouseEnter={e => { if (!yaAgregada) (e.currentTarget as HTMLLIElement).style.backgroundColor = 'rgba(194,110,90,0.1)' }}
                        onMouseLeave={e => { if (!yaAgregada) (e.currentTarget as HTMLLIElement).style.backgroundColor = '' }}
                      >
                        {sug}{yaAgregada && <span style={{ fontSize: 12, marginLeft: 6 }}>(Ya agregada)</span>}
                      </li>
                    )
                  })
                ) : (
                  <li style={{ padding: '8px 16px', fontSize: 14, color: '#9ca3af' }}>
                    Sin sugerencias para &quot;{searchTerm.trim()}&quot;
                  </li>
                )}
              </PortalDropdown>
            </div>

            {caracteristicaError && (
              <p className="text-red-500 text-xs font-semibold">{caracteristicaError}</p>
            )}
          </div>
        )}

        {/* ── Modo Edición de etiqueta seleccionada ── */}
        {caracteristicas.length > 0 && activeTag && activeCaracteristica && !isAdding && (
          <div className="flex flex-col gap-4 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">

            {/* Título */}
            <div>
              <Label className="block text-xs font-bold text-gray-700 mb-1">
                Título de la característica
              </Label>

              {editingTitle ? (
                <div>
                  <Input
                    ref={titleInputRef}
                    value={titleSearchTerm}
                    onChange={(e) => setTitleSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setEditingTitle(false)
                        setTitleSearchTerm('')
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        setEditingTitle(false)
                        setTitleSearchTerm('')
                      }, 150)
                    }}
                    placeholder={`Cambiar "${activeCaracteristica.titulo}"...`}
                    className="border-[#C26E5A] w-full focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#C26E5A] text-sm"
                    autoFocus
                  />

                  <PortalDropdown
                    anchorRef={titleInputRef}
                    open={titleSearchTerm.trim().length > 0}
                  >
                    {titleSugs.length > 0 ? (
                      titleSugs.map((sug) => (
                        <li
                          key={sug}
                          onMouseDown={(e) => { e.preventDefault(); handleTitleSelect(sug) }}
                          style={{ padding: '8px 16px', fontSize: 14, cursor: 'pointer' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLLIElement).style.backgroundColor = 'rgba(194,110,90,0.1)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLLIElement).style.backgroundColor = '' }}
                        >
                          {sug}
                        </li>
                      ))
                    ) : (
                      <li style={{ padding: '8px 16px', fontSize: 14, color: '#9ca3af' }}>
                        Sin sugerencias para &quot;{titleSearchTerm.trim()}&quot;
                      </li>
                    )}
                  </PortalDropdown>

                  <p className="text-xs text-gray-400 mt-1">
                    Solo se aceptan valores de la lista.
                  </p>
                </div>
              ) : (
                /* Modo lectura — sin ícono lápiz */
                <div
                  className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 cursor-pointer hover:border-[#C26E5A]/50 hover:bg-[#C26E5A]/5 transition-colors group"
                  onClick={() => { setEditingTitle(true); setTitleSearchTerm('') }}
                >
                  <span className="font-medium">{activeCaracteristica.titulo}</span>
                  <span className="text-xs text-gray-400 group-hover:text-[#C26E5A] transition-colors">
                    Cambiar
                  </span>
                </div>
              )}
            </div>

            {/* Detalle — FIX 2: sin autoFocus para no entrar al campo al seleccionar etiqueta */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label className="text-xs font-bold text-gray-700">
                  Ingrese una descripción (Opcional)
                </Label>
                <span className={`text-xs ${
                  activeCaracteristica.detalle.length >= MAX_DETALLE ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {activeCaracteristica.detalle.length}/{MAX_DETALLE}
                </span>
              </div>
              <Input
                value={activeCaracteristica.detalle}
                onChange={(e) => handleDetalleChange(activeCaracteristica.titulo, e.target.value)}
                placeholder="Ej. Amplio con vista a la calle..."
                maxLength={MAX_DETALLE}
                className={`focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-400 border-gray-300 text-sm w-full ${
                  detalleError ? 'border-red-400' : ''
                }`}
              />
              {detalleError && (
                <p className="text-red-500 text-xs mt-1">{detalleError}</p>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  )
}