/**
 * Dev: [tu nombre]
 * Date: 19/04/2026
 * Funcionalidad: Paso 7 — Descripción de la propiedad e integración de Características Extras (HU-03).
 * CAMBIO: Etiqueta única seleccionada por defecto. Texto de ayuda sin cursiva, 4 líneas.
 */
'use client'

import { useEffect, useState }                     from 'react'
import { Label }                                   from '@/components/ui/label'
import { Input }                                   from '@/components/ui/input'
import { useDescripcionForm, MAX_DESCRIPCION, MAX_CARACTERISTICAS } from './usedescripcionform'

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
    searchTerm, setSearchTerm,
    sugerencias, caracteristicaError,
    agregarCaracteristica, eliminarCaracteristica, actualizarDetalle, actualizarTitulo
  } = useDescripcionForm()

  const [isAdding, setIsAdding] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    if (!submitRef) return
    submitRef.current = () => handleSubmit(() => onNext())
  })

  useEffect(() => {
    if (!submitRef) return
    return () => { submitRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitRef])

  // Si hay exactamente 1 característica y no hay ninguna activa, seleccionarla por defecto
  useEffect(() => {
    const lista = values.caracteristicas || []
    if (lista.length === 0) {
      setActiveTag(null)
    } else if (lista.length === 1 && !isAdding) {
      setActiveTag(lista[0].titulo)
    }
  }, [values.caracteristicas, isAdding])

  const charCount        = values.descripcion.length
  const showError        = touched && !!errors.descripcion
  const caracteristicas  = values.caracteristicas || []
  const isLimitReached   = caracteristicas.length >= MAX_CARACTERISTICAS

  const handleAgregarClick = (tituloSugerido: string) => {
    const t = tituloSugerido.trim();
    if (!t) return;
    const exists = caracteristicas.some(c => c.titulo.toLowerCase() === t.toLowerCase());
    agregarCaracteristica(t);
    if (!exists && !isLimitReached) {
      setActiveTag(t);
      setIsAdding(false);
      setSearchTerm("");
    }
  };

  const handleRemove = (titulo: string, e: React.MouseEvent) => {
    e.stopPropagation();
    eliminarCaracteristica(titulo);
    if (activeTag === titulo) {
      const idx = caracteristicas.findIndex(c => c.titulo === titulo);
      const restantes = caracteristicas.filter(c => c.titulo !== titulo);
      if (restantes.length === 0) {
        setActiveTag(null);
      } else {
        // Selecciona la siguiente; si era la última, selecciona la anterior
        const nextIdx = idx < restantes.length ? idx : restantes.length - 1;
        setActiveTag(restantes[nextIdx].titulo);
      }
    }
  };

  const activeCaracteristica = caracteristicas.find(c => c.titulo === activeTag);

  return (
    <div className="flex flex-col h-full" style={{ gap: '2px' }}>

      {/* --- Descripción libre --- */}
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

      {/* --- Características Extras --- */}
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
              onClick={() => { setIsAdding(true); setActiveTag(null); }}
              className="flex items-center justify-center w-8 h-8 rounded-md border-2 border-[#C26E5A] text-[#C26E5A] bg-transparent hover:bg-[#C26E5A]/10 transition-colors focus:outline-none flex-shrink-0"
              title="Añadir característica"
            >
              <span className="text-xl font-bold leading-none mb-0.5">+</span>
            </button>
          )}

          {caracteristicas.map((c) => {
            const isVisualyActive = activeTag === c.titulo && !isAdding;
            return (
              <span
                key={c.titulo}
                onClick={() => { setActiveTag(c.titulo); setIsAdding(false); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold border transition-colors cursor-pointer ${
                  isVisualyActive
                    ? 'bg-[#C26E5A] text-white border-[#C26E5A]'
                    : 'bg-transparent text-[#C26E5A] border-[#C26E5A] hover:bg-[#C26E5A]/10'
                }`}
              >
                {c.titulo}
                <button
                  onClick={(e) => handleRemove(c.titulo, e)}
                  className={`${isVisualyActive ? 'hover:text-white/70' : 'hover:text-red-700'} focus:outline-none transition-colors`}
                >
                  ✕
                </button>
              </span>
            );
          })}
        </div>

        {/* Texto de ayuda — sin cursiva, 4 líneas centradas */}
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

        {/* Formulario Modo Añadir */}
        {isAdding && (
          <div className="flex flex-col gap-2 mt-2 animate-in fade-in duration-200">
            <div className="relative">
              <Label className="block text-xs font-bold text-gray-700 mb-1">
                ¿Qué título de característica desea colocar? *
              </Label>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') { setIsAdding(false); setSearchTerm(""); }
                }}
                placeholder="Ej. Piscina, Balcón"
                className="border-gray-300 w-full focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-400"
                autoFocus
              />

              {/* Dropdown con scroll interno */}
              {searchTerm.trim().length > 0 && (
                <ul
                  className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-md shadow-lg overflow-y-auto"
                  style={{ maxHeight: '160px' }}
                >
                  {sugerencias.length > 0 ? (
                    sugerencias.map((sug) => {
                      const yaAgregada = caracteristicas.some(
                        c => c.titulo.toLowerCase() === sug.toLowerCase()
                      );
                      return (
                        <li
                          key={sug}
                          onClick={() => { if (!yaAgregada) handleAgregarClick(sug); }}
                          className={`px-4 py-2 text-sm ${
                            yaAgregada
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'cursor-pointer hover:bg-[#C26E5A]/10 hover:text-[#C26E5A]'
                          }`}
                        >
                          {sug} {yaAgregada && <span className="text-xs">(Ya agregada)</span>}
                        </li>
                      );
                    })
                  ) : (
                    <li className="px-4 py-2 text-sm text-gray-400 select-none">
                      No hay sugerencias para {searchTerm.trim()}
                    </li>
                  )}
                </ul>
              )}
            </div>

            {caracteristicaError && (
              <p className="text-red-500 text-xs font-semibold">{caracteristicaError}</p>
            )}
          </div>
        )}

        {/* Formulario Modo Edición */}
        {caracteristicas.length > 0 && activeTag && activeCaracteristica && !isAdding && (
          <div className="flex flex-col gap-4 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <Label className="block text-xs font-bold text-gray-700 mb-1">
                Título de la característica *
              </Label>
              <Input
                value={activeCaracteristica.titulo}
                onChange={(e) => {
                  const nuevoTitulo = e.target.value;
                  actualizarTitulo(activeCaracteristica.titulo, nuevoTitulo);
                  setActiveTag(nuevoTitulo);
                }}
                className="focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-400 border-gray-300 text-sm w-full"
              />
            </div>
            <div>
              <Label className="block text-xs font-bold text-gray-700 mb-1">
                Ingrese una descripción (Opcional)
              </Label>
              <Input
                value={activeCaracteristica.detalle}
                onChange={(e) => actualizarDetalle(activeCaracteristica.titulo, e.target.value)}
                placeholder="Ej. Amplio con vista a la calle..."
                className="focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-400 border-gray-300 text-sm w-full"
                autoFocus
              />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}