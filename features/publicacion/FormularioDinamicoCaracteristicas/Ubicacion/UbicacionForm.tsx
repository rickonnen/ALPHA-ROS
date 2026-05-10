'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal }                from 'react-dom'
import dynamic                         from 'next/dynamic'
import { Label }                       from '@/components/ui/label'
import { useUbicacionForm }            from './useUbicacionForm'
import { DEPARTAMENTOS, MAX_ZONA }     from './useUbicacionTypes'
import { MIN_ZONA }                    from './useUbicacionValidacion'
import type { LocationData }           from './LocationPicker'

const LocationPicker = dynamic(
  () => import('./LocationPicker'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[260px] flex items-center justify-center bg-muted text-muted-foreground rounded-lg text-sm">
        Cargando mapa...
      </div>
    ),
  }
)

interface UbicacionFormProps {
  onNext:     () => void
  onBack:     () => void
  submitRef?: React.MutableRefObject<(() => void) | null>
}

export function UbicacionForm({ onNext, onBack, submitRef }: UbicacionFormProps) {
  const {
    values, errors, touched,
    handleChange, handleUbicacion, handleBlur, handleSubmit,
  } = useUbicacionForm()

  useEffect(() => {
    if (!submitRef) return
    submitRef.current = () => handleSubmit(() => onNext())
  })
  useEffect(() => {
    if (!submitRef) return
    return () => { submitRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitRef])

  const [mapaAbierto,     setMapaAbierto]     = useState(false)
  const [dropdownOpen,    setDropdownOpen]    = useState(false)
  const [dropdownTouched, setDropdownTouched] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [pendingLocation, setPendingLocation] = useState<LocationData | null>(null)
  const [deptoEnMapa,     setDeptoEnMapa]     = useState<string>(values.departamento)

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
    if (values.direccion && opcion !== values.departamento) {
      handleChange('direccion', '')
      handleChange('lat', '')
      handleChange('lng', '')
      handleBlur('direccion')
    }
    handleChange('departamento', opcion)
    handleBlur('departamento')
    setDropdownOpen(false)
  }

  const handleAbrirMapa = () => {
    setPendingLocation(null)
    setDeptoEnMapa(values.departamento)
    setMapaAbierto(true)
  }

  const handleLocationChange = (data: LocationData) => {
    setPendingLocation(data)
    if (data.departamento && data.departamento !== deptoEnMapa) {
      setDeptoEnMapa(data.departamento)
    }
  }

  const handleConfirmar = () => {
    if (pendingLocation) {
      handleUbicacion(pendingLocation)
      if (pendingLocation.departamento && pendingLocation.departamento !== values.departamento) {
        handleChange('departamento', pendingLocation.departamento)
        handleBlur('departamento')
      }
    }
    setMapaAbierto(false)
  }

  const handleCerrar = () => {
    setPendingLocation(null)
    setMapaAbierto(false)
  }

  const zonaLen     = values.zona.length
  const zonaInvalid = touched.zona && !!errors.zona

  // ─── Modal via Portal ─────────────────────────────────────────────────────
  const modalContent = mapaAbierto ? (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center px-4 py-3 overflow-auto"
      style={{ backgroundColor: 'rgba(31,58,77,0.55)' }}
      onClick={handleCerrar}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-[620px] flex flex-col overflow-visible"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary rounded-t-2xl gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--primary-foreground)">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="m-0 text-base font-semibold text-primary-foreground whitespace-nowrap">
                Selecciona la ubicación
              </p>
              <p className="m-0 text-[11px] text-primary-foreground/65 whitespace-nowrap overflow-hidden text-ellipsis">
                Busca una calle o haz clic en el mapa
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCerrar}
            className="w-[26px] h-[26px] rounded-full border-none bg-white/15 text-primary-foreground cursor-pointer flex items-center justify-center text-sm font-semibold flex-shrink-0 hover:bg-white/25 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-3.5 py-3 overflow-visible">
          <LocationPicker deptoActual={deptoEnMapa} onChange={handleLocationChange} />
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-2 px-3.5 pb-3.5 pt-2.5 border-t border-border">
          <button
            type="button"
            onClick={handleCerrar}
            className="bg-background border-[1.5px] border-secondary text-secondary rounded-md px-[18px] py-1.5 text-sm font-semibold cursor-pointer hover:opacity-80 transition-opacity"
          >
            Regresar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={!pendingLocation}
            className={`border-[1.5px] text-secondary-foreground rounded-md px-[18px] py-1.5 text-sm font-semibold transition-all ${
              pendingLocation
                ? 'bg-secondary border-secondary cursor-pointer hover:opacity-90'
                : 'bg-muted border-border text-muted-foreground cursor-not-allowed'
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      {typeof window !== 'undefined' && createPortal(modalContent, document.body)}

      {/* ─── Formulario principal ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 h-full pt-3 min-w-0 w-full">

        {/* 1 — Departamento */}
        <div className="flex flex-col gap-1.5" ref={dropdownRef}>
          <Label className="text-base font-medium text-foreground break-words">
            ¿Cual es el departamento en el que se encuentra la propiedad?
          </Label>
          <button
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
            onClick={() => { setDropdownOpen(prev => !prev); setDropdownTouched(true) }}
            onKeyDown={e => {
              if (e.key === 'Tab' || e.key === 'Escape') {
                setDropdownOpen(false); handleBlur('departamento')
              }
            }}
            className={`w-full h-[40px] px-3 text-base bg-background rounded-md border outline-none flex items-center justify-between transition-colors
              ${touched.departamento && errors.departamento ? 'border-destructive' : dropdownOpen ? 'border-primary' : 'border-border'}
              ${values.departamento ? 'text-foreground' : 'text-muted-foreground'}
            `}
          >
            <span>{values.departamento || 'Seleccione una opción'}</span>
            <svg
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20" fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="relative z-50">
              <ul
                role="listbox"
                className="absolute top-1 left-0 w-full bg-background border border-border rounded-md shadow-md py-1 max-h-48 overflow-auto"
              >
                {DEPARTAMENTOS.map((depto: string) => (
                  <li
                    key={depto}
                    role="option"
                    aria-selected={depto === values.departamento}
                    onClick={() => handleSelectDepto(depto)}
                    className="flex items-center gap-2 px-3 py-2 text-base text-foreground hover:bg-muted cursor-pointer"
                  >
                    <span className="w-4 flex-shrink-0">
                      {depto === values.departamento && (
                        <svg className="w-4 h-4 text-foreground" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                    <span className={depto === values.departamento ? 'font-medium' : ''}>{depto}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <span className="text-destructive text-xs h-4 block">
            {touched.departamento && errors.departamento ? errors.departamento : ''}
          </span>
        </div>

        {/* 2 — Dirección */}
        <div className="flex flex-col gap-1.5 w-full max-w-full">
          <Label className="text-base font-medium text-foreground break-words">
            ¿Cual es la dirección de la propiedad?
          </Label>
          <button
            type="button"
            onClick={handleAbrirMapa}
            onBlur={() => handleBlur('direccion')}
            className={`h-[40px] px-3 text-base bg-background rounded-md border outline-none flex items-center justify-between w-full overflow-hidden transition-colors ${
              touched.direccion && errors.direccion ? 'border-destructive' : 'border-border hover:border-primary'
            }`}
          >
            <span className={`flex-1 min-w-0 overflow-hidden whitespace-nowrap text-ellipsis text-left ${
              values.direccion ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {values.direccion || 'Seleccione en el mapa'}
            </span>

            <div className={`w-[26px] h-[26px] rounded-md flex-shrink-0 ml-2 flex items-center justify-center transition-colors ${
              values.direccion ? 'bg-secondary' : 'bg-muted'
            }`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--secondary-foreground)">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          </button>

          <span className="text-destructive text-xs h-4 block">
            {touched.direccion && errors.direccion ? errors.direccion : ''}
          </span>
        </div>

        {/* 3 — Zona */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-base font-medium text-foreground">
            Especifique Zona
          </Label>
          <input
            type="text"
            value={values.zona}
            maxLength={MAX_ZONA}
            onChange={e => {
              handleChange('zona', e.target.value)
              if (!touched.zona && e.target.value.length > 0) handleBlur('zona')
            }}
            onBlur={() => handleBlur('zona')}
            placeholder="Escriba una zona"
            className={`w-full border rounded-md px-3 py-2 text-base outline-none bg-background text-foreground placeholder:text-muted-foreground focus:border-primary transition-colors ${
              zonaInvalid ? 'border-destructive' : 'border-border'
            }`}
          />
          <div className="flex items-center justify-between">
            <span className="text-destructive text-xs">
              {zonaInvalid ? errors.zona : ''}
            </span>
            <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-2">
              {zonaLen}/{MAX_ZONA}
            </span>
          </div>
        </div>

      </div>
    </>
  )
}