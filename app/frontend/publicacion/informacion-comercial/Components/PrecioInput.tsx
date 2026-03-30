"use client";

/**
 * @Dev: [OliverG]
 * @Fecha: 28/03/2026
 * @Funcionalidad: Componente de input para el campo Precio del formulario
 * de Información Comercial. Maneja el ingreso numérico en formato boliviano
 * y muestra mensajes de error inline.
 * @param {string} value - Valor actual del precio ingresado
 * @param {boolean} hasError - Indica si el campo tiene un error de validación
 * @param {string} errorMsg - Mensaje de error a mostrar cuando hasError es true
 * @param {function} onChange - Callback para eventos de cambio en el input
 * @param {function} onBlur - Callback para eventos de blur en el input
 * @return {JSX.Element} Campo de precio con etiqueta y manejo de errores inline
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PrecioInputProps {
  value:     string;
  hasError:  boolean;
  errorMsg?: string;
  onChange:  (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur:    (e: React.FocusEvent<HTMLInputElement>) => void;
}

export default function PrecioInput({
  value,
  hasError,
  errorMsg,
  onChange,
  onBlur,
}: PrecioInputProps) {
  return (
    // En mobile ocupa todo el ancho, en desktop se fija a 110px
    <div className="flex flex-col gap-1.5 mb-4 w-full sm:w-[130px] flex-1 sm:flex-initial">
      <Label htmlFor="precio" className="text-[0.875rem] font-medium text-[#1A1714]">
        Precio
      </Label>
      <Input
        id="precio"
        name="precio"
        type="text"
        inputMode="decimal"
        placeholder="0,00 Bs."
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete="off"
        className={`h-10 text-[0.88rem] text-[#1A1714] focus-visible:ring-0 ${
          // Borde rojo en error, gris por defecto
          hasError ? "border-[#C0503A]" : "border-[#D4CFC6]"
        }`}
      />
      {/* Mensaje de error inline debajo del campo */}
      {hasError && errorMsg && (
        <span className="text-[0.74rem] text-[#C0503A] leading-snug">
          {errorMsg}
        </span>
      )}
    </div>
  );
}