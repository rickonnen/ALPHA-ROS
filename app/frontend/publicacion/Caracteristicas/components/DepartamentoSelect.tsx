import { Departamento, DEPARTAMENTOS } from '../Hooks/useCaracteristicasForm'

interface DepartamentoSelectProps {
  value:    Departamento;
  error:    string | undefined;
  touched:  boolean;
  onChange: (field: string, value: string) => void;
  onBlur:   (field: string) => void;
}

export function DepartamentoSelect({ value, error, touched, onChange, onBlur }: DepartamentoSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="departamento" className="text-sm font-medium text-[#2E2E2E]">
        Departamento
      </label>
      <select
        id="departamento"
        value={value}
        onChange={(e) => onChange('departamento', e.target.value)}
        onBlur={() => onBlur('departamento')}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white"
      >
        <option value="">Seleccione una opción</option>
        {DEPARTAMENTOS.map(({ label, value }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      {touched && error && (
        <span className="text-red-500 text-xs">{error}</span>
      )}
    </div>
  )
}