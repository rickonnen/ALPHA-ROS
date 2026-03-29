/**
 * Dev: Gabriel Paredes Sipe
 * Date modification: 29/03/2026
 * Funcionalidad: Componente dropdown para seleccionar el departamento
 *                de Bolivia con validación y accesibilidad.
 *                Corrección: tamaño de letra de mensajes de error ajustado a 14px.
 * @param {DepartamentoSelectProps} props - value, error, touched, onChange y onBlur
 * @return {JSX.Element} Dropdown accesible de departamentos con validación
 */
import { useState, useRef, useEffect } from 'react'
import { Departamento, DEPARTAMENTOS } from '../Hooks/useCaracteristicasForm'

interface DepartamentoSelectProps {
  value:    Departamento;
  error:    string | undefined;
  touched:  boolean;
  onChange: (field: string, value: string) => void;
  onBlur:   (field: string) => void;
}

export function DepartamentoSelect({ value, error, touched, onChange, onBlur }: DepartamentoSelectProps) {
  const [open,        setOpen]        = useState(false)
  const [wasOpened,   setWasOpened]   = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selectedLabel = DEPARTAMENTOS.find(d => d.value === value)?.label

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        // Solo disparar onBlur si el usuario abrió el dropdown al menos una vez
        if (wasOpened) onBlur('departamento')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onBlur, wasOpened])

  const handleSelect = (val: string) => {
    onChange('departamento', val)
    setOpen(false)
    onBlur('departamento')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      setOpen(false)
      onBlur('departamento')
    }
  }

  return (
    <div className="flex flex-col gap-1.5" ref={ref}>
      <label htmlFor="departamento" className="text-sm font-medium text-[#2E2E2E]">
        Departamento
      </label>

      <button
        type="button"
        id="departamento"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="departamento-listbox"
        onKeyDown={handleKeyDown}
        onClick={() => {
          setOpen(prev => !prev)
          setWasOpened(true)
        }}
        className={`
          w-full border rounded-md px-3 py-2 text-sm bg-white text-left
          flex items-center justify-between outline-none
          ${open ? 'border-gray-500' : 'border-gray-300'}
          ${touched && error ? 'border-red-400' : ''}
        `}
      >
        <span className={selectedLabel ? 'text-[#2E2E2E]' : 'text-gray-400'}>
          {selectedLabel ?? 'Seleccione una opción'}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20" fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="relative z-50">
          <ul
            id="departamento-listbox"
            role="listbox"
            className="absolute top-1 left-0 w-full bg-white border border-gray-200 rounded-md shadow-md py-1 max-h-60 overflow-auto"
          >
            {DEPARTAMENTOS.map((dep) => (
              <li
                key={dep.value}
                role="option"
                aria-selected={dep.value === value}
                onClick={() => handleSelect(dep.value)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#2E2E2E] hover:bg-gray-50 cursor-pointer"
              >
                <span className="w-4 flex-shrink-0">
                  {dep.value === value && (
                    <svg className="w-4 h-4 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                <span>{dep.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {touched && error && (
        <span className="text-red-500 text-sm">{error}</span>
      )}
    </div>
  )
}