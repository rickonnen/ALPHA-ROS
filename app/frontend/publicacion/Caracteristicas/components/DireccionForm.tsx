import { MapPin } from "lucide-react"

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
  return (
    <div className="flex gap-4 items-start">

      <div className="flex flex-col gap-1.5 flex-1">
        <label htmlFor="direccion" className="text-sm font-medium text-[#2E2E2E]">
          Dirección
        </label>
        <div className="relative">
          <input
            id="direccion"
            type="text"
            value={addressValue}
            onChange={(e) => onChange('direccion', e.target.value)}
            onBlur={() => onBlur('direccion')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm outline-none focus:border-gray-500"
          />
          <span
            aria-label="geolocalización"
            role="button"
            className="absolute right-3 top-2 cursor-pointer"
          >
            <MapPin className="h-5 w-5 text-[#2E2E2E]" />
          </span>
        </div>
        {addressTouched && addressError && (
          <span className="text-red-500 text-xs">{addressError}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 w-28">
        <label htmlFor="superficie" className="text-sm font-medium text-[#2E2E2E]">
          Superficie
        </label>
        <div className="relative">
          <input
            id="superficie"
            type="number"
            value={areaValue}
            onChange={(e) => onChange('superficie', e.target.value)}
            onBlur={() => onBlur('superficie')}
            placeholder="0.00 m²"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-500"
          />
        </div>
        {areaTouched && areaError && (
          <span className="text-red-500 text-xs">{areaError}</span>
        )}
      </div>

    </div>
  )
}