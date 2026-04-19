/**
 * Dev: [tu nombre]
 * Date: 19/04/2026
 * Funcionalidad: Paso 7 — Descripción de la propiedad e integración de Características Extras (HU-03).
 * CAMBIO: Contador dinámico. Al añadir, solo aparece el título. Al seleccionar sugerencia, crea la etiqueta y abre su descripción.
 */
'use client'

import { useEffect, useState }                     from 'react'
import { Label }                                   from '@/components/ui/label'
import { Input }                                   from '@/components/ui/input'
import { Button }                                  from '@/components/ui/button'
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

  // --- Estados locales para la UI Interactiva ---
  const [isAdding, setIsAdding] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Exponer handleSubmit hacia la page
  useEffect(() => {
    if (!submitRef) return
    submitRef.current = () => handleSubmit(() => onNext())
  })
  
  useEffect(() => {
    if (!submitRef) return
    return () => { submitRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitRef])

  // Limpieza visual si se borran todas las características
  useEffect(() => {
    if (values.caracteristicas?.length === 0) {
      setActiveTag(null);
    }
  }, [values.caracteristicas?.length]);

  const charCount = values.descripcion.length
  const showError = touched && !!errors.descripcion
  
  const caracteristicas = values.caracteristicas || []
  const isLimitReached = caracteristicas.length >= MAX_CARACTERISTICAS

  // Función simplificada: Agrega el título y pasa a MODO EDICIÓN inmediatamente
  const handleAgregarClick = (tituloSugerido?: string) => {
    // Si viene de la sugerencia usa ese texto, sino usa lo que escribió en el buscador
    const t = (tituloSugerido || searchTerm).trim(); 
    if (!t) return;
    
    const exists = caracteristicas.some(c => c.titulo.toLowerCase() === t.toLowerCase());
    
    agregarCaracteristica(t);

    if (!exists && !isLimitReached) {
      setActiveTag(t);       // Mágicamente abre el campo de descripción abajo
      setIsAdding(false);    // Cierra el buscador
      setSearchTerm("");     // Limpia el buscador para la próxima
    }
  };

  const handleRemove = (titulo: string, e: React.MouseEvent) => {
    e.stopPropagation();
    eliminarCaracteristica(titulo);
    if (activeTag === titulo) {
      setActiveTag(null);
    }
  };

  const activeCaracteristica = caracteristicas.find(c => c.titulo === activeTag);

  return (
    <div className="flex flex-col h-full" style={{ gap: '2px' }}>

      {/* --- Descripción libre--- */}
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

      {/* --- Características Extras --- */}
      <div className="flex flex-col gap-2 flex-1 min-h-0 mt-2">
        
        {/* Título y Contador Apilados */}
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#1A1714]">Caracteristicas Extras</span>
            <span className="text-sm font-normal text-[#C26E5A]">-Opcional</span>
          </div>
          
          {/* El contador solo aparece si hay etiquetas o se está añadiendo */}
          {(caracteristicas.length > 0 || isAdding) && (
            <span className="text-xs text-gray-500 font-medium">
              {caracteristicas.length}/{MAX_CARACTERISTICAS}
            </span>
          )}
        </div>

        {/* Fila de Acción: Botón "+" y Etiquetas */}
        <div className="flex flex-wrap items-center gap-2 mt-1">
          
          {/* Botón "+" CUADRADO (rounded-md) */}
          {!isLimitReached && (
            <button 
              onClick={() => {
                setIsAdding(true);
                setActiveTag(null);
              }}
              className="flex items-center justify-center w-8 h-8 rounded-md border-2 border-[#C26E5A] text-[#C26E5A] bg-transparent hover:bg-[#C26E5A]/10 transition-colors focus:outline-none flex-shrink-0"
              title="Añadir característica"
            >
              <span className="text-xl font-bold leading-none mb-0.5">+</span>
            </button>
          )}

          {/* Mapeo de Etiquetas REDONDAS (rounded-full) */}
          {caracteristicas.map((c) => {
            const isActive = activeTag === c.titulo;
            const isVisualyActive = isActive && !isAdding; 
            
            return (
              <span 
                key={c.titulo} 
                onClick={() => {
                  setActiveTag(c.titulo);
                  setIsAdding(false);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold border transition-colors cursor-pointer ${
                  isVisualyActive 
                    ? 'bg-[#C26E5A] text-white border-[#C26E5A]' 
                    : 'bg-transparent text-[#C26E5A] border-[#C26E5A] hover:bg-[#C26E5A]/10' 
                }`}
              >
                {c.titulo} 
                <button onClick={(e) => handleRemove(c.titulo, e)} className={`${isVisualyActive ? 'hover:text-white/70' : 'hover:text-red-700'} focus:outline-none transition-colors`}>
                  ✕
                </button>
              </span>
            );
          })}
        </div>

        {/* Texto de ayuda si no hay etiquetas */}
        {caracteristicas.length === 0 && !isAdding && (
          <div className="flex items-center justify-center py-6">
            <p className="text-sm text-gray-500 italic text-center max-w-[90%]">
              En caso de necesitar ingresar mas detalles del inmueble, añada una caracteristica especifica de su inmueble.
            </p>
          </div>
        )}

        {/* 3. Formulario Modo Añadir */}
        {isAdding && (
          <div className="flex flex-col gap-4 mt-2 animate-in fade-in duration-200">
            <div className="relative">
              <Label className="block text-xs font-bold text-gray-700 mb-1">¿Qué título de característica desea colocar? *</Label>
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ej. Piscina, Balcón"
                className="focus-visible:ring-[#C26E5A] border-gray-300 w-full"
                autoFocus
              />
              
              {/* Dropdown de Sugerencias */}
              {searchTerm.trim().length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {sugerencias.length > 0 ? (
                    sugerencias.map((sug) => {
                      const yaAgregada = caracteristicas.some(c => c.titulo.toLowerCase() === sug.toLowerCase());
                      return (
                        <li 
                          key={sug}
                          onClick={() => {
                            if (!yaAgregada) handleAgregarClick(sug); // Crea la etiqueta al instante
                          }}
                          className={`px-4 py-2 text-sm cursor-pointer ${yaAgregada ? 'bg-gray-100 text-gray-400' : 'hover:bg-[#C26E5A]/10 hover:text-[#C26E5A]'}`}
                        >
                          {sug} {yaAgregada && "(Ya agregada)"}
                        </li>
                      );
                    })
                  ) : (
                    <li className="px-4 py-2 text-sm text-gray-500">Puedes registrar este nuevo atributo</li>
                  )}
                </ul>
              )}
            </div>

            {caracteristicaError && <p className="text-red-500 text-xs font-semibold">{caracteristicaError}</p>}

            <div className="flex gap-2 justify-end mt-1">
              <Button 
                variant="outline"
                onClick={() => setIsAdding(false)} 
                className="text-gray-500 border-gray-300 hover:bg-gray-100 h-8 text-xs"
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => handleAgregarClick()} // Toma lo escrito en el Input
                disabled={!searchTerm.trim()}
                className="bg-[#C26E5A] hover:bg-[#a65d4b] text-white font-bold h-8 text-xs"
              >
                Añadir
              </Button>
            </div>
          </div>
        )}

        {/* 4. Formulario Modo Edición (Aparece automáticamente al añadir) */}
        {caracteristicas.length > 0 && activeTag && activeCaracteristica && !isAdding && (
          <div className="flex flex-col gap-4 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
            
            {/* Campo 1: Editar Título */}
            <div>
              <Label className="block text-xs font-bold text-gray-700 mb-1">Título de la característica *</Label>
              <Input 
                value={activeCaracteristica.titulo}
                onChange={(e) => {
                  const nuevoTitulo = e.target.value;
                  actualizarTitulo(activeCaracteristica.titulo, nuevoTitulo);
                  setActiveTag(nuevoTitulo); 
                }}
                className="focus-visible:ring-[#C26E5A] border-gray-300 text-sm w-full"
              />
            </div>

            {/* Campo 2: Añadir/Editar Descripción */}
            <div>
              <Label className="block text-xs font-bold text-gray-700 mb-1">
                Ingrese una descripción (Opcional)
              </Label>
              <Input 
                value={activeCaracteristica.detalle}
                onChange={(e) => actualizarDetalle(activeCaracteristica.titulo, e.target.value)}
                placeholder="Ej. Amplio con vista a la calle..."
                className="focus-visible:ring-[#C26E5A] border-gray-300 text-sm w-full"
                autoFocus // El cursor saltará directamente a este campo al seleccionar la etiqueta
              />
            </div>

          </div>
        )}

      </div>
    </div>
  )
}