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
  <span className="text-red-500 text-xs h-4 block">
    {visible ? message : ''}
  </span>
)

const IconBox = ({ icon, disabled }: { icon: React.ReactNode; disabled?: boolean }) => (
  <div
    style={{
      width: '42px',
      height: '42px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      opacity: disabled ? 0.5 : 1,
    }}
  >
    {icon}
  </div>
)

const inputClass = (error: boolean) =>
  `w-full border rounded-md px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white ${
    error ? 'border-red-400' : 'border-[#D4CFC6]'
  }`

const inputDisabledClass =
  'w-full border rounded-md px-3 py-2 text-sm outline-none bg-[#F1EFE8] text-[#B4B2A9] border-[#E0DDD6] cursor-not-allowed'

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

  return (
    <div className="flex flex-col gap-5" style={{ paddingTop: '12px' }}>

      <p className="text-sm font-semibold text-[#1A1714]">
        Detalle las Características de su propiedad
      </p>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2">

        {/* Habitaciones */}
        <div className="flex flex-col gap-1">
          <label className={`text-sm font-medium min-h-[40px] md:min-h-0 flex items-end md:block ${isTerreno ? 'text-[#B4B2A9]' : 'text-[#2E2E2E]'}`}>
            Nro de Habitaciones
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={values.habitaciones}
              disabled={isTerreno}
              onChange={makeChangeHandler('habitaciones')}
              onBlur={() => onBlur('habitaciones')}
              className={isTerreno ? inputDisabledClass : inputClass(hasError('habitaciones'))}
            />
            <IconBox
              disabled={isTerreno}
              icon={<BedDouble size={20} strokeWidth={1.5} color={isTerreno ? '#B4B2A9' : '#5A5A5A'} />}
            />
          </div>
          <ErrorMsg visible={!isTerreno && hasError('habitaciones')} message={errors.habitaciones} />
        </div>

        {/* Baños */}
        <div className="flex flex-col gap-1">
          <label className={`text-sm font-medium min-h-[40px] md:min-h-0 flex items-end md:block ${isTerreno ? 'text-[#B4B2A9]' : 'text-[#2E2E2E]'}`}>
            Nro de Baños
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={values.banios}
              disabled={isTerreno}
              onChange={makeChangeHandler('banios')}
              onBlur={() => onBlur('banios')}
              className={isTerreno ? inputDisabledClass : inputClass(hasError('banios'))}
            />
            <IconBox
              disabled={isTerreno}
              icon={<Bath size={20} strokeWidth={1.5} color={isTerreno ? '#B4B2A9' : '#5A5A5A'} />}
            />
          </div>
          <ErrorMsg visible={!isTerreno && hasError('banios')} message={errors.banios} />
        </div>

        {/* Garajes */}
        <div className="flex flex-col gap-1">
          <label className={`text-sm font-medium min-h-[40px] md:min-h-0 flex items-end md:block ${isTerreno ? 'text-[#B4B2A9]' : 'text-[#2E2E2E]'}`}>
            Nro de Garajes
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={values.garajes}
              disabled={isTerreno}
              onChange={makeChangeHandler('garajes')}
              onBlur={() => onBlur('garajes')}
              className={isTerreno ? inputDisabledClass : inputClass(hasError('garajes'))}
            />
            <IconBox
              disabled={isTerreno}
              icon={<Car size={20} strokeWidth={1.5} color={isTerreno ? '#B4B2A9' : '#5A5A5A'} />}
            />
          </div>
          <ErrorMsg visible={!isTerreno && hasError('garajes')} message={errors.garajes} />
        </div>

        {/* Plantas */}
        <div className="flex flex-col gap-1">
          <label className={`text-sm font-medium min-h-[40px] md:min-h-0 flex items-end md:block ${isTerreno ? 'text-[#B4B2A9]' : 'text-[#2E2E2E]'}`}>
            Nro de Plantas
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={values.plantas}
              disabled={isTerreno}
              onChange={makeChangeHandler('plantas')}
              onBlur={() => onBlur('plantas')}
              className={isTerreno ? inputDisabledClass : inputClass(hasError('plantas'))}
            />
            <IconBox
              disabled={isTerreno}
              icon={<Building2 size={20} strokeWidth={1.5} color={isTerreno ? '#B4B2A9' : '#5A5A5A'} />}
            />
          </div>
          <ErrorMsg visible={!isTerreno && hasError('plantas')} message={errors.plantas} />
        </div>

        {/* Superficie */}
        <div className="flex flex-col gap-1 col-span-2">
          <label className="text-sm font-medium min-h-[40px] md:min-h-0 flex items-end md:block text-[#2E2E2E]">
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
              <span className="absolute right-3 top-2 text-sm text-gray-400 pointer-events-none">m²</span>
            </div>
            <IconBox
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5A5A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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