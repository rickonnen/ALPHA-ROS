import {
  DESC_MAX, DESC_MIN, FormData, FormErrors, FormField,
  PRECIO_MAXIMO, TITULO_MAX, TITULO_MIN,
} from "../InformacionComercial.types";
import { PRICE_FORMAT_REGEX, parseFormattedPrice } from "./useInformacionComercialPrecio";

export function validateField(name: keyof FormData, value: string): string | undefined {
  switch (name) {
    case "titulo":
      if (!value.trim()) return "El título es obligatorio.";
      if (value.trim().length < TITULO_MIN) return `Mínimo ${TITULO_MIN} caracteres.`;
      if (value.length > TITULO_MAX) return `Máximo ${TITULO_MAX} caracteres.`;
      return undefined;
    case "precio": {
      if (!value) return "El precio es obligatorio.";
      if (!PRICE_FORMAT_REGEX.test(value)) return "Ingrese un valor válido (ej: 1.234,56).";
      const intNum = parseFormattedPrice(value);
      if (intNum === null) return "El precio debe ser numérico.";
      if (intNum <= 99) return "El precio minimo debe ser mayor a 99 .";
      if (intNum > PRECIO_MAXIMO) return `No puede superar ${PRECIO_MAXIMO.toLocaleString("es-BO")} Bs.`;
      return undefined;
    }
    case "tipoPropiedad":
      return value ? undefined : "Seleccione un tipo de propiedad.";
    case "tipoOperacion":
      return value ? undefined : "Seleccione un tipo de operación.";
    case "descripcion":
      if (!value.trim()) return "La descripción es obligatoria.";
      if (value.trim().length < DESC_MIN) return `Mínimo ${DESC_MIN} caracteres.`;
      if (value.length > DESC_MAX) return `Máximo ${DESC_MAX} caracteres.`;
      return undefined;
  }
}

export function validateAll(form: FormData): FormErrors {
  const objFieldErrors: FormErrors = {};
  (Object.keys(form) as FormField[]).forEach((fieldName) => {
    const strErrorMessage = validateField(fieldName, form[fieldName]);
    if (strErrorMessage) objFieldErrors[fieldName] = strErrorMessage;
  });
  return objFieldErrors;
}