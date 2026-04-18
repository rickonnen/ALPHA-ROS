/**
 * Dev: Gabriel Paredes
 * Date: 17/04/2026
 * Funcionalidad: Paso Ubicación — dirección via mapa, departamento y zona.
 * @param {UbicacionFormProps} props - onNext, onBack
 * @return {JSX.Element} Formulario de ubicación
 */
'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic                         from 'next/dynamic'
import { Label }                       from '@/components/ui/label'
import { useUbicacionForm }            from './useUbicacionForm'
import { DEPARTAMENTOS, MAX_ZONA }     from './useUbicacionTypes'

// Carga el mapa solo en cliente
const LocationPicker = dynamic(
  () => import('./LocationPicker'),
  {
    ssr:     false,
    loading: () => (
      <div className="h-64 w-full flex items-center justify-center bg-slate-100 rounded-lg text-slate-400 text-sm">
        Cargando mapa...
      </div>
    ),
  }
)

interface UbicacionFormProps {
  onNext: () => void
  onBack: () => void
}

export function UbicacionForm({ onNext, onBack }: UbicacionFormProps) {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleUbicacion,
    handleBlur,
    handleSubmit,
  } = useUbicacionForm()

  //  Modal del mapa
  const [mapaAbierto, setMapaAbierto] = useState(false)

  //Dropdown departamento
  const [dropdownOpen,    setDropdownOpen]    = useState(false)
  const [dropdownTouched, setDropdownTouched] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
        if (dropdownTouched) handleBlur('departamento')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownTouched, handleBlur])

  const handleSelectDepto = (opcion: string) => {
    handleChange('departamento', opcion)
    handleBlur('departamento')
    setDropdownOpen(false)
  }

  const onClickSiguiente = () => handleSubmit(() => onNext())

  return (
    <>
      {/* ── Modal del mapa*/}
      {mapaAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setMapaAbierto(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-5 w-full max-w-2xl mx-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Header modal */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#1A1714]">
                Selecciona la ubicación
              </h3>
              <button
                type="button"
                onClick={() => setMapaAbierto(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Mapa */}
            <LocationPicker
              onChange={(data) => {
                handleUbicacion(data)
                setMapaAbierto(false)
              }}
            />
          </div>
        </div>
      )}

      {/*Formulario */}
      <div className="flex flex-col gap-5 h-full" style={{ paddingTop: '12px' }}>

        {/* Dirección — abre el mapa al hacer click */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium text-[#1A1714]">
            ¿Cual es la dirección de la propiedad?
          </Label>
          <button
            type="button"
            onClick={() => setMapaAbierto(true)}
            onBlur={() => handleBlur('direccion')}
            className={`w-full h-[40px] px-3 text-sm bg-white rounded-md border outline-none flex items-center justify-between transition-colors ${
              touched.direccion && errors.direccion
                ? 'border-red-400'
                : 'border-[#D4CFC6]'
            } ${values.direccion ? 'text-[#1A1714]' : 'text-gray-400'}`}
          >
            <span className="truncate">
              {values.direccion || 'Haz click para seleccionar en el mapa'}
            </span>
            {/* Icono pin */}
            <svg
              className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </button>
          <span className="text-red-500 text-xs h-4 block">
            {touched.direccion && errors.direccion ? errors.direccion : ''}
          </span>
        </div>

        {/* Departamento */}
        <div className="flex flex-col gap-1.5" ref={dropdownRef}>
          <Label className="text-sm font-medium text-[#1A1714]">
            ¿Cual es el departamento en el que se encuentra la propiedad?
          </Label>
          <button
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
            onClick={() => {
              setDropdownOpen(prev => !prev)
              setDropdownTouched(true)
            }}
            onKeyDown={e => {
              if (e.key === 'Tab' || e.key === 'Escape') {
                setDropdownOpen(false)
                handleBlur('departamento')
              }
            }}
            className={`w-full h-[40px] px-3 text-sm bg-white rounded-md border outline-none flex items-center justify-between transition-colors ${
              touched.departamento && errors.departamento
                ? 'border-red-400'
                : dropdownOpen
                ? 'border-gray-500'
                : 'border-[#D4CFC6]'
            } ${values.departamento ? 'text-[#1A1714]' : 'text-gray-400'}`}
          >
            <span>{values.departamento || 'Seleccione una opción'}</span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="relative z-50">
              <ul
                role="listbox"
                className="absolute top-1 left-0 w-full bg-white border border-[#D4CFC6] rounded-md shadow-md py-1 max-h-48 overflow-auto"
              >
                {DEPARTAMENTOS.map((depto: string) => (
                  <li
                    key={depto}
                    role="option"
                    aria-selected={depto === values.departamento}
                    onClick={() => handleSelectDepto(depto)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-[#1A1714] hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="w-4 flex-shrink-0">
                      {depto === values.departamento && (
                        <svg className="w-4 h-4 text-[#1A1714]" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </span>
                    <span className={depto === values.departamento ? 'font-medium' : ''}>
                      {depto}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <span className="text-red-500 text-xs h-4 block">
            {touched.departamento && errors.departamento ? errors.departamento : ''}
          </span>
        </div>

        {/* Zona */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium text-[#1A1714]">
            Especifique Zona
          </Label>
          <input
            type="text"
            value={values.zona}
            maxLength={MAX_ZONA}
            onChange={e => handleChange('zona', e.target.value)}
            onBlur={() => handleBlur('zona')}
            placeholder=""
            className={`w-full border rounded-md px-3 py-2 text-sm outline-none bg-white focus:border-gray-500 ${
              touched.zona && errors.zona ? 'border-red-400' : 'border-[#D4CFC6]'
            }`}
          />
          <span className="text-red-500 text-xs h-4 block">
            {touched.zona && errors.zona ? errors.zona : ''}
          </span>
        </div>

      </div>
    </>
  )
}