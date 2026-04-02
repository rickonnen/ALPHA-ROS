/**
 * Dev: Gabriel Paredes Sipe
 * Date modification: 02/04/2026
 * Funcionalidad: Componente de formulario para ingresar habitaciones,
 *                baños, garajes y plantas de un inmueble con validación.
 *                Corrección de bug: el span de error se renderiza en ambas
 *                celdas de la fila solo cuando al menos una celda de esa
 *                fila tiene error, evitando espacio extra innecesario.
 *                Corrección: borde rojo en inputs cuando touched && error.
 *                Corrección: máximo 2 dígitos permitidos y rango 1–50
 *                validado desde el hook con mensaje de error visible.
 * @param {HabitacionesFormProps} props - Valores, errores, touched, onChange y onBlur
 * @return {JSX.Element} Grid de inputs numéricos para características del inmueble
 */

interface HabitacionesFormProps {
  bedroomsValue:  string;
  bathroomsValue: string;
  floorsValue:    string;
  garagesValue:   string;
  errors: {
    habitaciones?: string;
    banios?:       string;
    plantas?:      string;
    garajes?:      string;
  };
  touched: {
    habitaciones: boolean;
    banios:       boolean;
    plantas:      boolean;
    garajes:      boolean;
  };
  onChange: (field: string, value: string) => void;
  onBlur:   (field: string) => void;
}

const soloEnteroPositivo = (value: string): string =>
  value.replace(/[^0-9]/g, '').slice(0, 2)

const ErrorMsg = ({ visible, message }: { visible: boolean; message?: string }) => (
  <span
    className="text-red-500 text-xs"
    style={{ visibility: visible ? 'visible' : 'hidden' }}
  >
    {message || 'x'}
  </span>
)

export function HabitacionesForm({ bedroomsValue, bathroomsValue, floorsValue, garagesValue, errors, touched, onChange, onBlur }: HabitacionesFormProps) {

  const makeChangeHandler = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(field, soloEnteroPositivo(e.target.value))
    }

  const hasError = (field: 'habitaciones' | 'banios' | 'plantas' | 'garajes') =>
    !!(touched[field] && errors[field])

  const row1Error = hasError('habitaciones') || hasError('banios')
  const row2Error = hasError('garajes')      || hasError('plantas')

  const inputClass = (field: 'habitaciones' | 'banios' | 'plantas' | 'garajes') =>
    `w-full border rounded-md px-3 py-2 text-sm outline-none focus:border-gray-500 ${
      hasError(field) ? 'border-red-400' : 'border-gray-300'
    }`

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3 items-end">

      <div className="flex flex-col gap-1.5">
        <label htmlFor="habitaciones" className="text-sm font-medium text-[#2E2E2E]">
          Nro de Habitaciones
        </label>
        <input
          id="habitaciones"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          value={bedroomsValue}
          onChange={makeChangeHandler('habitaciones')}
          onBlur={() => onBlur('habitaciones')}
          className={inputClass('habitaciones')}
        />
        {row1Error && <ErrorMsg visible={hasError('habitaciones')} message={errors.habitaciones} />}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="banios" className="text-sm font-medium text-[#2E2E2E]">
          Nro de Baños
        </label>
        <input
          id="banios"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          value={bathroomsValue}
          onChange={makeChangeHandler('banios')}
          onBlur={() => onBlur('banios')}
          className={inputClass('banios')}
        />
        {row1Error && <ErrorMsg visible={hasError('banios')} message={errors.banios} />}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="garajes" className="text-sm font-medium text-[#2E2E2E]">
          Nro de Garajes
        </label>
        <input
          id="garajes"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          value={garagesValue}
          onChange={makeChangeHandler('garajes')}
          onBlur={() => onBlur('garajes')}
          className={inputClass('garajes')}
        />
        {row2Error && <ErrorMsg visible={hasError('garajes')} message={errors.garajes} />}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="plantas" className="text-sm font-medium text-[#2E2E2E]">
          Nro de Plantas
        </label>
        <input
          id="plantas"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          value={floorsValue}
          onChange={makeChangeHandler('plantas')}
          onBlur={() => onBlur('plantas')}
          className={inputClass('plantas')}
        />
        {row2Error && <ErrorMsg visible={hasError('plantas')} message={errors.plantas} />}
      </div>

    </div>
  )
}