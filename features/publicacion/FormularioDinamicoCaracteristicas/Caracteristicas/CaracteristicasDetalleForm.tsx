'use client'

import React from 'react'
import { BedDouble, Bath, Car, Building2, LayoutTemplate } from 'lucide-react'
import {
  CaracteristicasDetalleFormValues,
  CaracteristicasDetalleFormErrors,
  MAX_SUPERFICIE,
} from './useCaracteristicasDetalleTypes'

interface CaracteristicasDetalleFormProps {
  values:  CaracteristicasDetalleFormValues
  errors:  CaracteristicasDetalleFormErrors
  touched: Partial<Record<keyof CaracteristicasDetalleFormValues, boolean>>
  onChange: (field: keyof CaracteristicasDetalleFormValues, value: string) => void
  onBlur:   (field: keyof CaracteristicasDetalleFormValues) => void
}

const soloEnteroPositivo = (value: string): string =>
  value.replace(/[^0-9]/g, '').slice(0, 2)

const ErrorMsg = ({ visible, message }: { visible: boolean; message?: string }) => (
  <span className="text-red-500 text-xs h-4 block">
    {visible ? message : ''}
  </span>
)

const IconBox = ({ icon }: { icon: React.ReactNode }) => (
  <div style={{
    width: '42px', height: '42px', borderRadius: '8px',
    border: '1px solid #D4CFC6', backgroundColor: '#ffffff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }}>
    {icon}
  </div>
)

const inputClass = (error: boolean) =>
  `w-full border rounded-md px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white ${
    error ? 'border-red-400' : 'border-[#D4CFC6]'
  }`

export function CaracteristicasDetalleForm({
  values, errors, touched, onChange, onBlur,
}: CaracteristicasDetalleFormProps) {

  const [superficieError, setSuperficieError] = React.useState<string | null>(null)

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
    <div className="flex flex-col gap-4">

      <p className="text-sm font-medium text-[#1A1714]">
        Detalle las Características de su propiedad
      </p>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3">

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#2E2E2E]">Nro de Habitaciones</label>
          <div className="flex items-center gap-2">
            <input type="text" inputMode="numeric" maxLength={2} value={values.habitaciones}
              onChange={makeChangeHandler('habitaciones')} onBlur={() => onBlur('habitaciones')}
              className={inputClass(hasError('habitaciones'))} />
            <IconBox icon={<BedDouble size={20} strokeWidth={1.5} color="#5A5A5A" />} />
          </div>
          <ErrorMsg visible={hasError('habitaciones')} message={errors.habitaciones} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#2E2E2E]">Nro de Baños</label>
          <div className="flex items-center gap-2">
            <input type="text" inputMode="numeric" maxLength={2} value={values.banios}
              onChange={makeChangeHandler('banios')} onBlur={() => onBlur('banios')}
              className={inputClass(hasError('banios'))} />
            <IconBox icon={<Bath size={20} strokeWidth={1.5} color="#5A5A5A" />} />
          </div>
          <ErrorMsg visible={hasError('banios')} message={errors.banios} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#2E2E2E]">Nro de Garajes</label>
          <div className="flex items-center gap-2">
            <input type="text" inputMode="numeric" maxLength={2} value={values.garajes}
              onChange={makeChangeHandler('garajes')} onBlur={() => onBlur('garajes')}
              className={inputClass(hasError('garajes'))} />
            <IconBox icon={<Car size={20} strokeWidth={1.5} color="#5A5A5A" />} />
          </div>
          <ErrorMsg visible={hasError('garajes')} message={errors.garajes} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#2E2E2E]">Nro de Plantas</label>
          <div className="flex items-center gap-2">
            <input type="text" inputMode="numeric" maxLength={2} value={values.plantas}
              onChange={makeChangeHandler('plantas')} onBlur={() => onBlur('plantas')}
              className={inputClass(hasError('plantas'))} />
            <IconBox icon={<Building2 size={20} strokeWidth={1.5} color="#5A5A5A" />} />
          </div>
          <ErrorMsg visible={hasError('plantas')} message={errors.plantas} />
        </div>

      </div>

      <div className="flex flex-col gap-1.5" style={{ maxWidth: '50%' }}>
        <label className="text-sm font-medium text-[#2E2E2E]">Superficie</label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input type="text" inputMode="decimal" value={values.superficie}
              onChange={handleAreaChange}
              onBlur={() => { setSuperficieError(null); onBlur('superficie') }}
              placeholder="0"
              className={inputClass(!!(superficieError ?? (touched.superficie && errors.superficie)))} />
            <span className="absolute right-3 top-2 text-sm text-gray-400 pointer-events-none">m²</span>
          </div>
          <IconBox icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5A5A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="6" width="18" height="14" rx="1" />
            <path d="M3 6l3-3h12l3 3" />
            <path d="M8 3h8" />
        </svg>
} />
        </div>
        <ErrorMsg
          visible={!!(superficieError ?? (touched.superficie && errors.superficie))}
          message={superficieError ?? errors.superficie}
        />
      </div>

    </div>
  )
}