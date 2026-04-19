/**
 * Dev: Gabriel Paredes
 * Date: 17/04/2026
 * Funcionalidad: Paso Ubicación — dirección via mapa, departamento y zona.
 */
'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic                         from 'next/dynamic'
import { Label }                       from '@/components/ui/label'
import { useUbicacionForm }            from './useUbicacionForm'
import { DEPARTAMENTOS, MAX_ZONA }     from './useUbicacionTypes'
import type { LocationData }           from './LocationPicker'

const LocationPicker = dynamic(
  () => import('./LocationPicker'),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: 260, background: '#F4EFE6', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: '#6B7280', borderRadius: 8, fontSize: 13 }}>
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

// Paleta del proyecto
const C = {
  crema:          '#F4EFE6',
  terracota:      '#C26E5A',
  terracotaClaro: '#D4B8AE',
  marino:         '#1F3A4D',
  borde:          '#D4CFC6',
  texto:          '#2E2E2E',
  gris:           '#2E2E2E',
  grisClaro:      '#2E2E2E',
}

export function UbicacionForm({ onNext, onBack, submitRef }: UbicacionFormProps) {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleUbicacion,
    handleBlur,
    handleSubmit,
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
      }
    }
    setMapaAbierto(false)
  }

  const handleCerrar = () => {
    setPendingLocation(null)
    setMapaAbierto(false)
  }

  return (
    <>
      {/* ─── Modal del mapa ─────────────────────────────────────── */}
      {mapaAbierto && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(31,58,77,0.55)', overflow: 'visible' }}
          onClick={handleCerrar}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background:    C.crema,
              borderRadius:  16,
              boxShadow:     '0 8px 40px rgba(31,58,77,0.25)',
              width:         '100%',
              maxWidth:      680,
              margin:        '0 16px',
              overflow:      'visible',
              display:       'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header del modal */}
            <div style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              padding:        '16px 24px',
              background:     C.marino,
              borderRadius:   '16px 16px 0 0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  backgroundColor: C.terracota,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#ffffff' }}>
                    Selecciona la ubicación
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
                    Busca una calle o haz clic en el mapa
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCerrar}
                style={{
                  width: 28, height: 28, borderRadius: '50%', border: 'none',
                  background: 'rgba(255,255,255,0.15)', color: '#ffffff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 600, flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>

            {/* Body del modal */}
            <div style={{ padding: '16px 24px', overflow: 'visible' }}>
              <LocationPicker
                deptoActual={deptoEnMapa}
                onChange={handleLocationChange}
              />
            </div>

            {/* Footer — solo botones, sin texto de dirección */}
            <div style={{
              display:        'flex',
              justifyContent: 'flex-end',
              alignItems:     'center',
              gap:            10,
              padding:        '12px 24px 18px',
              borderTop:      `1.5px solid ${C.borde}`,
            }}>
              <button
                type="button"
                onClick={handleCerrar}
                style={{
                  backgroundColor: C.crema,
                  border:          `1.5px solid ${C.terracota}`,
                  color:           C.terracota,
                  borderRadius:    6,
                  padding:         '6px 20px',
                  fontSize:        14,
                  fontWeight:      600,
                  cursor:          'pointer',
                }}
              >
                Regresar
              </button>
              <button
                type="button"
                onClick={handleConfirmar}
                disabled={!pendingLocation}
                style={{
                  backgroundColor: pendingLocation ? C.terracota : C.terracotaClaro,
                  border:          `1.5px solid ${pendingLocation ? C.terracota : C.terracotaClaro}`,
                  color:           '#ffffff',
                  borderRadius:    6,
                  padding:         '6px 20px',
                  fontSize:        14,
                  fontWeight:      600,
                  cursor:          pendingLocation ? 'pointer' : 'not-allowed',
                  transition:      'background-color 0.2s',
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Formulario principal ────────────────────────────────── */}
      <div className="flex flex-col gap-5 h-full" style={{ paddingTop: '12px' }}>

        {/* 1 — Departamento (primero) */}
        <div className="flex flex-col gap-1.5" ref={dropdownRef}>
          <Label className="text-sm font-medium" style={{ color: '#2E2E2E' }}>
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
            className={`w-full h-[40px] px-3 text-sm bg-white rounded-md border outline-none flex items-center justify-between transition-colors ${
              touched.departamento && errors.departamento
                ? 'border-red-400' : dropdownOpen ? 'border-gray-500' : 'border-[#D4CFC6]'
            } ${values.departamento ? 'text-[#1A1714]' : 'text-gray-400'}`}
          >
            <span>{values.departamento || 'Seleccione una opción'}</span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20" fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
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

          <span className="text-red-500 text-xs h-4 block">
            {touched.departamento && errors.departamento ? errors.departamento : ''}
          </span>
        </div>

        {/* 2 — Dirección (segundo) */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium" style={{ color: '#2E2E2E' }}>
            ¿Cual es la dirección de la propiedad?
          </Label>
          <button
            type="button"
            onClick={handleAbrirMapa}
            onBlur={() => handleBlur('direccion')}
            className={`w-full h-[40px] px-3 text-sm bg-white rounded-md border outline-none flex items-center justify-between ${
              touched.direccion && errors.direccion ? 'border-red-400' : 'border-[#D4CFC6]'
            } ${values.direccion ? 'text-[#1A1714]' : 'text-gray-400'}`}
          >
            <span className="truncate">
              {values.direccion || 'Haz click para seleccionar en el mapa'}
            </span>

            {/* Icono pin a la derecha con gradiente */}
            <div style={{
              width:          26,
              height:         26,
              borderRadius:   6,
              background:     values.direccion
                ? 'linear-gradient(135deg, #C26E5A 0%, #A85543 100%)'
                : 'linear-gradient(135deg, #D4CFC6 0%, #BFB9B0 100%)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              flexShrink:     0,
              marginLeft:     8,
              transition:     'background 0.2s',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          </button>
          <span className="text-red-500 text-xs h-4 block">
            {touched.direccion && errors.direccion ? errors.direccion : ''}
          </span>
        </div>

        {/* 3 — Zona */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium" style={{ color: '#2E2E2E' }}>
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