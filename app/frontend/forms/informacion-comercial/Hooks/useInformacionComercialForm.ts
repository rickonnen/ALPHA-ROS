import { useState } from "react";
import {
  FormData,
  FormErrors,
  FORM_INICIAL,
  PRECIO_MAXIMO,
  TITULO_MIN,
  TITULO_MAX,
  DESC_MIN,
  DESC_MAX,
} from "../InformacionComercial.types";

export function useInformacionComercialForm() {
  const [form, setForm]       = useState<FormData>(FORM_INICIAL);
  const [errors, setErrors]   = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});

  function validateField(name: keyof FormData, value: string): string | undefined {
    switch (name) {
      case "titulo":
        if (!value.trim())                    return "El título es obligatorio.";
        if (value.trim().length < TITULO_MIN) return `Mínimo ${TITULO_MIN} caracteres.`;
        if (value.length > TITULO_MAX)        return `Máximo ${TITULO_MAX} caracteres.`;
        return undefined;

      case "precio": {
        if (!value)                           return "El precio es obligatorio.";
        const num = parseFloat(value);
        if (isNaN(num) || !/^\d+(\.\d{1,2})?$/.test(value))
                                              return "Ingrese un valor válido (ej: 1000.50).";
        if (num <= 0)                         return "El precio debe ser mayor a 0.";
        if (num > PRECIO_MAXIMO)              return `No puede superar ${PRECIO_MAXIMO.toLocaleString("es-BO")} Bs.`;
        return undefined;
      }

      case "tipoPropiedad":
        return value ? undefined : "Seleccione un tipo de propiedad.";

      case "tipoOperacion":
        return value ? undefined : "Seleccione un tipo de operación.";

      case "descripcion":
        if (!value.trim())                   return "La descripción es obligatoria.";
        if (value.trim().length < DESC_MIN)  return `Mínimo ${DESC_MIN} caracteres.`;
        if (value.length > DESC_MAX)         return `Máximo ${DESC_MAX} caracteres.`;
        return undefined;
    }
  }

  function validateAll(): FormErrors {
    const errs: FormErrors = {};
    (Object.keys(form) as (keyof FormData)[]).forEach((k) => {
      const e = validateField(k, form[k]);
      if (e) errs[k] = e;
    });
    return errs;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name as keyof FormData, value) }));
    }
  }

  function handlePrecioChange(e: React.ChangeEvent<HTMLInputElement>) {
  const raw = e.target.value.replace(/[^\d.]/g, "");
  const parts = raw.split(".");
  const clean = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : raw;

  // Bloquear más de 2 decimales
  if (parts.length === 2 && parts[1].length > 2) return;

  // Bloquear más de 7 dígitos enteros
  const entero = clean.split(".")[0];
  if (entero.length > 7) {
  setTouched((prev) => ({ ...prev, precio: true }));
  setErrors((prev) => ({ ...prev, precio: `No puede superar ${PRECIO_MAXIMO.toLocaleString("es-BO")} Bs.` }));
  return;
}

  // Bloquear si supera el límite máximo
  const num = parseFloat(clean);
  if (!isNaN(num) && num > PRECIO_MAXIMO) {
  setTouched((prev) => ({ ...prev, precio: true }));
  setErrors((prev) => ({ ...prev, precio: `No puede superar ${PRECIO_MAXIMO.toLocaleString("es-BO")} Bs.` }));
  return;
}

  setForm((prev) => ({ ...prev, precio: clean }));
  if (touched.precio) {
    setErrors((prev) => ({ ...prev, precio: validateField("precio", clean) }));
  }
}
  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name as keyof FormData, value) }));
  }

  // Muestra error al cerrar dropdown sin seleccionar
  function handleDropdownBlur(name: "tipoPropiedad" | "tipoOperacion") {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, form[name]) }));
  }

  function handleSelectPropiedad(opt: string) {
    setForm((prev)    => ({ ...prev, tipoPropiedad: opt }));
    setErrors((prev)  => ({ ...prev, tipoPropiedad: undefined }));
    setTouched((prev) => ({ ...prev, tipoPropiedad: true }));
  }

  function handleSelectOperacion(opt: string) {
    setForm((prev)    => ({ ...prev, tipoOperacion: opt }));
    setErrors((prev)  => ({ ...prev, tipoOperacion: undefined }));
    setTouched((prev) => ({ ...prev, tipoOperacion: true }));
  }

  function handleCancelar() {
    const hasData = Object.values(form).some((v) => v.trim() !== "");
    if (hasData) {
      if (!window.confirm("Los datos ingresados se eliminarán. ¿Deseas salir del formulario?")) return;
    }
    setForm(FORM_INICIAL);
    setErrors({});
    setTouched({});
  }

  function handleSiguiente() {
    const allTouched: Partial<Record<keyof FormData, boolean>> = {};
    (Object.keys(form) as (keyof FormData)[]).forEach((k) => (allTouched[k] = true));
    setTouched(allTouched);
    const newErrors = validateAll();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    console.log("Avanzar a Características del Inmueble", form);
  }

  const hasErr = (n: keyof FormData) => touched[n] && !!errors[n];

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
  };
}