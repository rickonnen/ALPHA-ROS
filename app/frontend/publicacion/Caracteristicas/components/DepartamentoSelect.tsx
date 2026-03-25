import { Departamento, DEPARTAMENTOS } from '../Hooks/useCaracteristicasForm';

interface DepartamentoSelectProps {
  value:    Departamento;
  error:    string | undefined;
  touched:  boolean;
  onChange: (field: string, value: string) => void;
  onBlur:   (field: string) => void;
}

export function DepartamentoSelect({ value, error, touched, onChange, onBlur }: DepartamentoSelectProps) {
  return (
    <div>
      <label htmlFor="departamento">Departamento</label>
      <select
        id="departamento"
        value={value}
        onChange={(e) => onChange('departamento', e.target.value)}
        onBlur={() => onBlur('departamento')}
      >
        <option value="">Seleccione una opción</option>
        {DEPARTAMENTOS.map(({ label, value }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {touched && error && <span>{error}</span>}
    </div>
  );
}
