import { useState } from "react";
import {
  DESC_MAX,
  DESC_MIN,
  FormData,
  FormErrors,
  FormField,
  FORM_INICIAL,
  InformacionComercialApiResponse,
  PRECIO_MAXIMO,
  TITULO_MAX,
  TITULO_MIN,
  toTipoOperacionBackend,
} from "../InformacionComercial.types";

const FORM_FIELDS: FormField[] = [
  "titulo",
  "precio",
  "tipoPropiedad",
  "tipoOperacion",
  "descripcion",
];

const PRICE_FORMAT_REGEX = /^\d{1,3}(\.\d{3})*(,\d{1,2})?$/;

function isFormField(fieldName: string): fieldName is FormField {
  return FORM_FIELDS.includes(fieldName as FormField);
}

function formatPriceInput(inputValue: string): string {
  const sanitized = inputValue.replace(/[^\d,]/g, "");
  if (!sanitized) return "";

  const [rawInteger = "", ...rest] = sanitized.split(",");
  const hasComma = sanitized.includes(",");
  const integerDigits = rawInteger.replace(/^0+(?=\d)/, "");
  const normalizedInteger = integerDigits === "" ? (hasComma ? "0" : "") : integerDigits;
  const integerWithThousands = normalizedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decimalDigits = rest.join("").slice(0, 2);

  if (!hasComma) return integerWithThousands;
  return `${integerWithThousands},${decimalDigits}`;
}

function parseFormattedPrice(priceValue: string): number | null {
  if (!priceValue) return null;

  const normalized = priceValue.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function toBackendPrice(priceValue: string): string {
  return priceValue.replace(/\./g, "").replace(",", ".");
}

export function useInformacionComercialForm() {
  const [form, setForm] = useState<FormData>(FORM_INICIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [submitMessage, setSubmitMessage] = useState("");

  function validateField(name: keyof FormData, value: string): string | undefined {
    switch (name) {
      case "titulo":
        if (!value.trim()) return "El título es obligatorio.";
        if (value.trim().length < TITULO_MIN) return `Mínimo ${TITULO_MIN} caracteres.`;
        if (value.length > TITULO_MAX) return `Máximo ${TITULO_MAX} caracteres.`;
        return undefined;

      case "precio": {
        if (!value) return "El precio es obligatorio.";
        if (!PRICE_FORMAT_REGEX.test(value)) {
          return "Ingrese un valor válido (ej: 1.234,56).";
        }

        const num = parseFormattedPrice(value);
        if (num === null) return "El precio debe ser numérico.";
        if (num <= 0) return "El precio debe ser mayor a 0.";
        if (num > PRECIO_MAXIMO) return `No puede superar ${PRECIO_MAXIMO.toLocaleString("es-BO")} Bs.`;

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

  function validateAll(): FormErrors {
    const fieldErrors: FormErrors = {};
    (Object.keys(form) as FormField[]).forEach((fieldName) => {
      const errorMessage = validateField(fieldName, form[fieldName]);
      if (errorMessage) fieldErrors[fieldName] = errorMessage;
    });
    return fieldErrors;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSubmitStatus(null);
    setSubmitMessage("");

    if (touched[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name as keyof FormData, value),
        general: undefined,
      }));
    }
  }

  function handlePrecioChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatPriceInput(e.target.value);

    if (formatted) {
      const num = parseFormattedPrice(formatted);
      if (num !== null && num > PRECIO_MAXIMO) {
        setTouched((prev) => ({ ...prev, precio: true }));
        setErrors((prev) => ({
          ...prev,
          precio: `No puede superar ${PRECIO_MAXIMO.toLocaleString("es-BO")} Bs.`,
        }));
        return;
      }
    }

    setForm((prev) => ({ ...prev, precio: formatted }));
    setSubmitStatus(null);
    setSubmitMessage("");

    if (touched.precio) {
      setErrors((prev) => ({
        ...prev,
        precio: validateField("precio", formatted),
        general: undefined,
      }));
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name as keyof FormData, value) }));
  }

  function handleDropdownBlur(name: "tipoPropiedad" | "tipoOperacion") {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, form[name]) }));
  }

  function handleSelectPropiedad(option: string) {
    setForm((prev) => ({ ...prev, tipoPropiedad: option }));
    setErrors((prev) => ({ ...prev, tipoPropiedad: undefined, general: undefined }));
    setTouched((prev) => ({ ...prev, tipoPropiedad: true }));
    setSubmitStatus(null);
    setSubmitMessage("");
  }

  function handleSelectOperacion(option: string) {
    setForm((prev) => ({ ...prev, tipoOperacion: option }));
    setErrors((prev) => ({ ...prev, tipoOperacion: undefined, general: undefined }));
    setTouched((prev) => ({ ...prev, tipoOperacion: true }));
    setSubmitStatus(null);
    setSubmitMessage("");
  }

  function handleCancelar() {
    if (isSubmitting) return;

    const hasData = Object.values(form).some((value) => value.trim() !== "");
    if (hasData) {
      if (!window.confirm("Los datos ingresados se eliminarán. ¿Deseas salir del formulario?")) return;
    }

    setForm(FORM_INICIAL);
    setErrors({});
    setTouched({});
    setSubmitStatus(null);
    setSubmitMessage("");
  }

  function buildFieldErrorsFromBackend(
    backendErrors: InformacionComercialApiResponse["errores"]
  ): FormErrors {
    if (!backendErrors || typeof backendErrors !== "object") {
      return {};
    }

    const fieldErrors: FormErrors = {};
    for (const [fieldName, message] of Object.entries(backendErrors)) {
      if (isFormField(fieldName) && typeof message === "string") {
        fieldErrors[fieldName] = message;
      }
    }

    return fieldErrors;
  }

  async function handleSiguiente() {
    if (isSubmitting) return;

    const allTouched: Partial<Record<FormField, boolean>> = {};
    FORM_FIELDS.forEach((fieldName) => {
      allTouched[fieldName] = true;
    });
    setTouched(allTouched);

    const localErrors = validateAll();
    setErrors(localErrors);
    if (Object.keys(localErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage("");

    try {
      const response = await fetch("/backend/publicacion/informacion-comercial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo: form.titulo,
          precio: toBackendPrice(form.precio),
          tipoPropiedad: form.tipoPropiedad,
          tipoOperacion: toTipoOperacionBackend(form.tipoOperacion),
          descripcion: form.descripcion,
        }),
      });

      let responseBody: InformacionComercialApiResponse | null = null;
      try {
        responseBody = (await response.json()) as InformacionComercialApiResponse;
      } catch {
        responseBody = null;
      }

      if (!response.ok || !responseBody?.ok) {
        const backendErrors = buildFieldErrorsFromBackend(responseBody?.errores);
        const backendMessage =
          responseBody?.mensaje ?? "No se pudo guardar la información comercial.";

        setErrors((prev) => ({
          ...prev,
          ...backendErrors,
          general: Object.keys(backendErrors).length === 0 ? backendMessage : undefined,
        }));
        setSubmitStatus("error");
        setSubmitMessage(backendMessage);
        return;
      }

      setErrors({});
      setSubmitStatus("success");
      setSubmitMessage(responseBody.mensaje);
    } catch {
      const fallbackMessage = "No se pudo conectar con el servidor.";
      setErrors((prev) => ({ ...prev, general: fallbackMessage }));
      setSubmitStatus("error");
      setSubmitMessage(fallbackMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasErr = (fieldName: keyof FormData) => touched[fieldName] && !!errors[fieldName];

  return {
    form,
    errors,
    touched,
    hasErr,
    validateField,
    handleChange,
    handlePrecioChange,
    handleBlur,
    handleDropdownBlur,
    handleSelectPropiedad,
    handleSelectOperacion,
    handleCancelar,
    handleSiguiente,
    isSubmitting,
    submitStatus,
    submitMessage,
  };
}
