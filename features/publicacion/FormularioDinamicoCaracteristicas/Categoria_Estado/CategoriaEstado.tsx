'use client'

import DropdownSelect from '@/features/publicacion/componentDrop/Components/Dropdown.Select'
import { TIPOS_PROPIEDAD_VALIDOS, ESTADOS_PROPIEDAD_VALIDOS, CategoriaFormValues, CategoriaFormErrors } from './useCategoriaTypes'

interface CategoriaYEstadoFormProps {
  values:  CategoriaFormValues
  errors:  CategoriaFormErrors
  touched: Partial<Record<keyof CategoriaFormValues, boolean>>
  onChange: (field: keyof CategoriaFormValues, value: string) => void
  onBlur:   (field: keyof CategoriaFormValues) => void
}

export function CategoriaYEstadoForm({
  values,
  errors,
  touched,
  onChange,
  onBlur,
}: CategoriaYEstadoFormProps) {
  return (
    <div className="flex flex-col">

      <div style={{ marginTop: '20px', marginBottom: '-14px' }}>
       <p className="text-sm font-medium text-[#1A1714]">
        ¿Qué tipo de propiedad desea publicar?
      </p>
        <DropdownSelect
          id="tipoPropiedad"
          label=""
          options={TIPOS_PROPIEDAD_VALIDOS}
          value={values.tipoPropiedad}
          hasError={!!(errors.tipoPropiedad && touched.tipoPropiedad)}
          errorMsg={errors.tipoPropiedad}
          onSelect={(val) => onChange('tipoPropiedad', val)}
          onClose={() => onBlur('tipoPropiedad')}
          
        />
      </div>

      <div style={{ marginTop: '30px' }}>
        <p className="text-sm font-medium text-[#1A1714]">
          ¿En qué estado se encuentra tu propiedad?
        </p>
        <DropdownSelect
          id="estadoPropiedad"
          label=""
          options={ESTADOS_PROPIEDAD_VALIDOS}
          value={values.estadoPropiedad}
          hasError={!!(errors.estadoPropiedad && touched.estadoPropiedad)}
          errorMsg={errors.estadoPropiedad}
          onSelect={(val) => onChange('estadoPropiedad', val)}
          onClose={() => onBlur('estadoPropiedad')}
        />
      </div>

    </div>
  )
}