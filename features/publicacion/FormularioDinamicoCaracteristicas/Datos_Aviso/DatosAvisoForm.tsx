'use client'

import { useState, useRef, useEffect } from 'react'
import { Label }                       from '@/components/ui/label'
import { useDatosAvisoForm }           from './useDatosAvisoForm'
import { TIPOS_OPERACION, MAX_TITULO, MAX_PRECIO } from './useDatosAvisoTypes'

interface DatosAvisoFormProps {
  onNext:    () => void
  onBack:    () => void
  submitRef?: React.MutableRefObject<(() => void) | null>
}

export function DatosAvisoForm({ onNext, onBack, submitRef }: DatosAvisoFormProps) {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleMoneda,
    handleBlur,
    handleSubmit,
  } = useDatosAvisoForm()

  useEffect(() => {
    if (!submitRef) return
    submitRef.current = () => handleSubmit(() => onNext())
  })
  useEffect(() => {
    if (!submitRef) return
    return () => { submitRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitRef])

  const [dropdownOpen,    setDropdownOpen]    = useState(false)
  const [dropdownTouched, setDropdownTouched] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
        if (dropdownTouched) handleBlur('tipoOperacion')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownTouched, handleBlur])

  const handleSelectOperacion = (opcion: string) => {
    handleChange('tipoOperacion', opcion)
    handleBlur('tipoOperacion')
    setDropdownOpen(false)
  }

  const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw   = e.target.value.replace(/[^0-9.]/g, '')
    const parts = raw.split('.')
    const clean = parts.length > 2
      ? parts[0] + '.' + parts.slice(1).join('')
      : raw
    if (parseFloat(clean) > MAX_PRECIO) return
    handleChange('precio', clean)
  }

  return (
    <div className="flex flex-col gap-5 h-full" style={{ paddingTop: '12px' }}>

      {/* Título del aviso */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="titulo" className="text-sm font-medium text-foreground">
          ¿Qué título de aviso desea colocar?
        </Label>
        <input
          id="titulo"
          type="text"
          value={values.titulo}
          maxLength={MAX_TITULO}
          onChange={e => handleChange('titulo', e.target.value)}
          onBlur={() => handleBlur('titulo')}
          placeholder="Escribe un título"
          className={`w-full border rounded-md px-3 py-2 text-sm outline-none bg-card-bg focus:border-primary ${
            touched.titulo && errors.titulo ? 'border-destructive' : 'border-card-border'
          }`}
        />
        <div className="flex justify-between items-center">
          {touched.titulo && errors.titulo
            ? <span className="text-destructive text-xs">{errors.titulo}</span>
            : <span />
          }
          <span className="text-xs ml-auto text-foreground">
            {values.titulo.length}/{MAX_TITULO}
          </span>
        </div>
      </div>

      {/* Tipo de operación */}
      <div className="flex flex-col gap-1.5" ref={dropdownRef}>
        <Label htmlFor="tipoOperacion" className="text-sm font-medium text-foreground">
          ¿Qué tipo de operación desea realizar?
        </Label>

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            id="tipoOperacion"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
            aria-controls="tipoOperacion-listbox"
            onClick={() => { setDropdownOpen(prev => !prev); setDropdownTouched(true) }}
            onKeyDown={e => {
              if (e.key === 'Tab' || e.key === 'Escape') {
                setDropdownOpen(false)
                handleBlur('tipoOperacion')
              }
            }}
            className={`w-full h-[40px] px-3 text-sm bg-card-bg rounded-md border outline-none flex items-center justify-between transition-colors ${
              touched.tipoOperacion && errors.tipoOperacion
                ? 'border-destructive'
                : dropdownOpen ? 'border-primary' : 'border-card-border'
            } ${values.tipoOperacion ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            <span>{values.tipoOperacion || 'Seleccione una opción'}</span>
            <svg
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20" fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>

          {dropdownOpen && (
            <ul
              id="tipoOperacion-listbox"
              role="listbox"
              style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50 }}
              className="bg-card-bg border border-card-border rounded-md shadow-md py-1 max-h-60 overflow-auto"
            >
              {TIPOS_OPERACION.map((opcion: string) => (
                <li key={opcion} role="option" aria-selected={opcion === values.tipoOperacion}
                  onClick={() => handleSelectOperacion(opcion)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted cursor-pointer"
                >
                  <span className="w-4 flex-shrink-0">
                    {opcion === values.tipoOperacion && (
                      <svg className="w-4 h-4 text-foreground" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>
                  <span className={opcion === values.tipoOperacion ? 'font-medium' : ''}>{opcion}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <span className="text-destructive text-xs h-4 block">
          {touched.tipoOperacion && errors.tipoOperacion ? errors.tipoOperacion : ''}
        </span>
      </div>

      {/* Precio + Tipo de moneda */}
      <div className="flex flex-row items-start gap-3">

        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <Label htmlFor="precio" className="text-sm font-medium text-foreground">
            Precio
          </Label>
          <input
            id="precio" type="text" inputMode="decimal"
            value={values.precio}
            onChange={handlePrecioChange}
            onBlur={() => handleBlur('precio')}
            placeholder="0.00"
            className={`w-full border rounded-md px-3 py-2 text-sm outline-none bg-card-bg focus:border-primary ${
              touched.precio && errors.precio ? 'border-destructive' : 'border-card-border'
            }`}
          />
          <span className="text-destructive text-xs h-4 block">
            {touched.precio && errors.precio ? errors.precio : ''}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <Label className="text-sm font-medium text-foreground">Tipo de moneda</Label>
          <div className="relative flex items-center rounded-md"
            style={{ height: '38px', width: '110px', backgroundColor: 'var(--card-bg)' }}
          >
            <div style={{
              position: 'absolute', top: '0px', bottom: '0px', width: '50%',
              borderRadius: '6px', backgroundColor: 'var(--secondary)',
              transition: mounted ? 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
              left: values.tipoMoneda === 'USD' ? '0px' : '50%',
            }} />
            <button type="button" onClick={() => handleMoneda('USD')}
              style={{ position: 'relative', zIndex: 1,
                color: values.tipoMoneda === 'USD' ? 'var(--secondary-foreground)' : 'var(--foreground)',
                flex: 1, height: '100%', border: 'none', background: 'transparent',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            >USD</button>
            <button type="button" onClick={() => handleMoneda('Bs')}
              style={{ position: 'relative', zIndex: 1,
                color: values.tipoMoneda === 'Bs' ? 'var(--secondary-foreground)' : 'var(--foreground)',
                flex: 1, height: '100%', border: 'none', background: 'transparent',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            >Bs</button>
          </div>
          <span className="h-4 block" />
        </div>

      </div>

    </div>
  )
}