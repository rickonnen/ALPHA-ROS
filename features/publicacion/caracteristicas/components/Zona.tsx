/**
 * Dev: Gabriel Paredes Sipe
 * Date modification: 02/04/2026
 * Funcionalidad: Componente input para ingresar la zona del inmueble
 *                con validación de borde rojo y mensaje de error
 *                Corrección RM2-14: se bloquea escritura al llegar a 100
 *                caracteres mediante slice y se valida mínimo de 5 caracteres
 * @param {ZonaInputProps} props - value, error, touched, onChange y onBlur
 * @return {JSX.Element} Input de texto accesible para zona con validación
 */

interface ZonaInputProps {
  value:    string;
  error:    string | undefined;
  touched:  boolean;
  onChange: (field: string, value: string) => void;
  onBlur:   (field: string) => void;
}

export function ZonaInput({ value, error, touched, onChange, onBlur }: ZonaInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="zona" className="text-sm font-medium text-[#2E2E2E]">
        Zona <span className="font-normal text-muted-foreground">*</span>
      </label>
      <input
        id="zona"
        type="text"
        value={value}
        onChange={(e) => onChange('zona', e.target.value.slice(0, 100))}
        onBlur={() => onBlur('zona')}
        className={`w-full border rounded-md px-3 py-2 text-sm outline-none focus:border-gray-500 ${
          touched && error
            ? 'border-red-400'
            : 'border-gray-300'
        }`}
      />
      {touched && error && (
        <span className="text-red-500 text-sm">{error}</span>
      )}
    </div>
  )
}