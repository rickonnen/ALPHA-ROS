/**
 * Dev: Gabriel Paredes Sipe
 * Date modification: 29/03/2026
 * Funcionalidad: Componente de formulario para ingresar dirección y superficie
 *                de un inmueble con validación y filtrado de caracteres.
 *                Corrección: ícono de geolocalización cambiado a SVG sólido negro.
 * @param {DireccionFormProps} props - Valores, errores, touched, onChange y onBlur
 * @return {JSX.Element} Inputs de dirección y superficie con validación
 */
import React from "react"

interface DireccionFormProps {
  addressValue:   string;
  areaValue:      string;
  addressError:   string | undefined;
  areaError:      string | undefined;
  addressTouched: boolean;
  areaTouched:    boolean;
  onChange: (field: string, value: string) => void;
  onBlur:   (field: string) => void;
}

export function DireccionForm({ addressValue, areaValue, addressError, areaError, addressTouched, areaTouched, onChange, onBlur }: DireccionFormProps) {

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9#\-. ]/g, '')
    onChange('direccion', filtered)
  }

  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const onlyNums = raw.replace(/[^0-9]/g, '')
    const formatted = onlyNums.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    onChange('superficie', formatted)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-4">

      {/* Dirección — ancho completo en móvil, flex-1 en desktop */}
      <div className="flex flex-col gap-1.5 flex-1">
        <label htmlFor="direccion" className="text-sm font-medium text-[#2E2E2E]">
          Dirección
        </label>
        <div className="relative">
          <input
            id="direccion"
            type="text"
            value={addressValue}
            onChange={handleAddressChange}
            onBlur={() => onBlur('direccion')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm outline-none focus:border-gray-500"
          />
          <button
            type="button"
            aria-label="geolocalización"
            className="absolute right-3 top-2 cursor-pointer bg-transparent border-none p-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#2E2E2E"
              className="h-5 w-5"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </button>
        </div>
        {addressTouched && addressError && (
          <span className="text-red-500 text-sm">{addressError}</span>
        )}
      </div>

      {/* Superficie — ancho completo en móvil, w-28 fijo en desktop */}
      <div className="flex flex-col gap-1.5 w-full sm:w-28">
        <label htmlFor="superficie" className="text-sm font-medium text-[#2E2E2E]">
          Superficie
        </label>
        <div className="relative">
          <input
            id="superficie"
            type="text"
            inputMode="decimal"
            value={areaValue}
            onChange={handleAreaChange}
            onBlur={() => onBlur('superficie')}
            placeholder="0"
            className="w-full border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm outline-none focus:border-gray-500"
          />
          <span className="absolute right-3 top-2 text-sm text-gray-400 pointer-events-none">
            m²
          </span>
        </div>
        {areaTouched && areaError && (
          <span className="text-red-500 text-sm">{areaError}</span>
        )}
      </div>

    </div>
  )
}