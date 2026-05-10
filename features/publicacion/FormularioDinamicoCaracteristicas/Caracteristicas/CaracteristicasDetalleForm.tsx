'use client'

import React from 'react'
import { BedDouble, Bath, Car, Building2 } from 'lucide-react'
import {
  CaracteristicasDetalleFormValues,
  CaracteristicasDetalleFormErrors,
  MAX_SUPERFICIE,
} from './useCaracteristicasDetalleTypes'

interface CaracteristicasDetalleFormProps {
  values:       CaracteristicasDetalleFormValues
  errors:       CaracteristicasDetalleFormErrors
  touched:      Partial<Record<keyof CaracteristicasDetalleFormValues, boolean>>
  tipoPropiedad?: string
  onChange:     (field: keyof CaracteristicasDetalleFormValues, value: string) => void
  onBlur:       (field: keyof CaracteristicasDetalleFormValues) => void
}

const soloEnteroPositivo = (value: string): string =>
  value.replace(/[^0-9]/g, '').slice(0, 2)

const ErrorMsg = ({ visible, message }: { visible: boolean; message?: string }) => (
  <span className="text-destructive text-xs h-4 block">
    {visible ? message : ''}
  </span>
)

const IconBox = ({ icon, disabled }: { icon: React.ReactNode; disabled?: boolean }) => (
  <div
    className={`w-[42px] h-[42px] flex items-center justify-center flex-shrink-0 ${disabled ? 'opacity-50' : ''}`}
  >
    {icon}
  </div>
)

const inputBase =
  'w-full border rounded-md px-3 py-2 text-base outline-none transition-colors bg-background text-foreground placeholder:text-muted-foreground'

const inputClass = (error: boolean) =>
  `${inputBase} border-border focus:border-primary ${error ? 'border-destructive' : ''}`

const inputDisabledClass =
  `${inputBase} bg-muted text-muted-foreground border-border cursor-not-allowed`

export function CaracteristicasDetalleForm({
  values,
  errors,
  touched,
  tipoPropiedad,
  onChange,
  onBlur,
}: CaracteristicasDetalleFormProps) {

  const [superficieError, setSuperficieError] = React.useState<string | null>(null)

  const isTerreno = tipoPropiedad === 'Terreno'

  const hasError = (field: keyof CaracteristicasDetalleFormValues) =>
    !!(touched[field] && errors[field])

  const makeChangeHandler = (field: keyof CaracteristicasDetalleFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange(field, soloEnteroPositivo(e.target.value))

  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNums = e.target.value.replace(/[^0-9]/g, '')
    if (onlyNums === '') { setSuperficieError(null); onChange('superficie', ''); return }
    if (parseInt(onlyNums, 10) > MAX_SUPERFICIE) { setSuperficieError('Máximo 1.000.000 m²'); return }
    setSuperficieError(null)
    onChange('superficie', onlyNums.replace(/\B(?=(\d{3})+(?!\d))/g, '.'))
  }

  // Color del ícono según estado
  const iconColor = (disabled?: boolean) =>
    disabled ? 'var(--muted-foreground)' : 'var(--foreground)'

  const fields = [
    { key: 'habitaciones', label: 'Nro de Habitaciones', icon: <BedDouble size={20} strokeWidth={1.5} color={iconColor(isTerreno)} /> },
    { key: 'banios',       label: 'Nro de Baños',        icon: <Bath      size={20} strokeWidth={1.5} color={iconColor(isTerreno)} /> },
    { key: 'garajes',      label: 'Nro de Garajes',      icon: <Car       size={20} strokeWidth={1.5} color={iconColor(isTerreno)} /> },
    { key: 'plantas',      label: 'Nro de Plantas',      icon: <Building2 size={20} strokeWidth={1.5} color={iconColor(isTerreno)} /> },
  ] as const

  return (
    <div className="flex flex-col gap-5 pt-3">

      <p className="text-base font-semibold text-foreground">
        Detalle las Características de su propiedad
      </p>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2">

        {/* Campos numéricos (habitaciones, baños, garajes, plantas) */}
        {fields.map(({ key, label, icon }) => (
          <div key={key} className="flex flex-col gap-1">
            <label className={`text-base font-medium min-h-[40px] md:min-h-0 flex items-end md:block ${isTerreno ? 'text-muted-foreground' : 'text-foreground'}`}>
              {label}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={values[key]}
                disabled={isTerreno}
                onChange={makeChangeHandler(key)}
                onBlur={() => onBlur(key)}
                className={isTerreno ? inputDisabledClass : inputClass(hasError(key))}
              />
              <IconBox disabled={isTerreno} icon={icon} />
            </div>
            <ErrorMsg visible={!isTerreno && hasError(key)} message={errors[key]} />
          </div>
        ))}

        {/* Superficie */}
        <div className="flex flex-col gap-1 col-span-2">
          <label className="text-base font-medium min-h-[40px] md:min-h-0 flex items-end md:block text-foreground">
            Superficie
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                inputMode="decimal"
                value={values.superficie}
                onChange={handleAreaChange}
                onBlur={() => { setSuperficieError(null); onBlur('superficie') }}
                placeholder="0"
                className={inputClass(!!(superficieError ?? (touched.superficie && errors.superficie)))}
                style={{ paddingRight: '36px' }}
              />
              <span className="absolute right-3 top-2 text-base text-muted-foreground pointer-events-none">
                m²
              </span>
            </div>
            <IconBox
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="var(--foreground)" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <rect x="3" y="6" width="18" height="14" rx="1" />
                  <path d="M3 6l3-3h12l3 3" />
                  <path d="M8 3h8" />
                </svg>
              }
            />
          </div>
          <ErrorMsg
            visible={!!(superficieError ?? (touched.superficie && errors.superficie))}
            message={superficieError ?? errors.superficie}
          />
        </div>

      </div>
    </div>
  )
}