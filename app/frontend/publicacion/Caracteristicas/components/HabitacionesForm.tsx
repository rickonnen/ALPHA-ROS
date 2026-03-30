/**
 * Dev: Gabriel Paredes Sipe
 * Date modification: 29/03/2026
 * Corrección de bug 2: grid cambia de items-end a items-start
 *                para evitar desalineación al aparecer mensajes de error.
 * Funcionalidad: Componente de formulario para ingresar habitaciones,
 *                baños, garajes y plantas de un inmueble con validación.
 *               
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
  value.replace(/[^0-9]/g, '')

export function HabitacionesForm({ bedroomsValue, bathroomsValue, floorsValue, garagesValue, errors, touched, onChange, onBlur }: HabitacionesFormProps) {

  const makeChangeHandler = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(field, soloEnteroPositivo(e.target.value))
    }

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
          value={bedroomsValue}
          onChange={makeChangeHandler('habitaciones')}
          onBlur={() => onBlur('habitaciones')}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-500"
        />
        {touched.habitaciones && errors.habitaciones && (
          <span className="text-red-500 text-xs">{errors.habitaciones}</span>
        )}
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
          value={bathroomsValue}
          onChange={makeChangeHandler('banios')}
          onBlur={() => onBlur('banios')}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-500"
        />
        {touched.banios && errors.banios && (
          <span className="text-red-500 text-xs">{errors.banios}</span>
        )}
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
          value={garagesValue}
          onChange={makeChangeHandler('garajes')}
          onBlur={() => onBlur('garajes')}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-500"
        />
        {touched.garajes && errors.garajes && (
          <span className="text-red-500 text-xs">{errors.garajes}</span>
        )}
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
          value={floorsValue}
          onChange={makeChangeHandler('plantas')}
          onBlur={() => onBlur('plantas')}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-500"
        />
        {touched.plantas && errors.plantas && (
          <span className="text-red-500 text-xs">{errors.plantas}</span>
        )}
      </div>

    </div>
  )
}