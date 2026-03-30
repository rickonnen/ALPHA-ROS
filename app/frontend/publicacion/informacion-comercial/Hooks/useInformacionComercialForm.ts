/**
 * @Dev: [OliverG]
 * @Fecha: 28/03/2026
 * @Funcionalidad: Hook personalizado que centraliza toda la lógica del formulario
 * de Información Comercial. Maneja estados, validaciones, formato de precio,
 * interacción con los dropdowns y el guardado temporal de datos para el paso 2.
 * @return {object} Estados y handlers necesarios para el formulario
 */

import { useState, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DESC_MAX,
  DESC_MIN,
  FormData,
  FormErrors,
  FormField,
  FORM_INICIAL,
  PRECIO_MAXIMO,
  TITULO_MAX,
  TITULO_MIN,
  toTipoOperacionBackend,
} from "../InformacionComercial.types";

// Lista de campos del formulario para iterar en validaciones
const FORM_FIELDS: FormField[] = [
  "titulo",
  "precio",
  "tipoPropiedad",
  "tipoOperacion",
  "descripcion",
];

// Regex para validar formato de precio boliviano (ej: 1.234,56)
const PRICE_FORMAT_REGEX = /^\d{1,3}(\.\d{3})*(,\d{1,2})?$/;

// Key del borrador en sessionStorage
const DRAFT_KEY = "informacionComercialDraft";

/**
 * @Funcionalidad: Verifica si un nombre de campo pertenece al formulario
 * @param {string} fieldName - Nombre del campo a verificar
 * @return {boolean} True si es un campo válido del formulario
 */
function isFormField(fieldName: string): fieldName is FormField {
  return FORM_FIELDS.includes(fieldName as FormField);
}

/**
 * @Funcionalidad: Formatea el input de precio al estándar boliviano con puntos de miles
 * @param {string} inputValue - Valor crudo ingresado por el usuario
 * @return {string} Valor formateado (ej: "1.234,56")
 */
function formatPriceInput(inputValue: string): string {
  // Eliminar caracteres no permitidos, solo dígitos y coma decimal
  const sanitized = inputValue.replace(/[^\d,]/g, "");
  if (!sanitized) return "";

  const [rawInteger = "", ...rest] = sanitized.split(",");
  const hasComma = sanitized.includes(",");
  const integerDigits = rawInteger.replace(/^0+(?=\d)/, "");
  const normalizedInteger = integerDigits === "" ? (hasComma ? "0" : "") : integerDigits;
  // Agregar puntos de miles al entero
  const integerWithThousands = normalizedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  // Limitar decimales a 2 dígitos
  const decimalDigits = rest.join("").slice(0, 2);

  if (!hasComma) return integerWithThousands;
  return `${integerWithThousands},${decimalDigits}`;
}

/**
 * @Funcionalidad: Convierte el precio formateado a número para validaciones
 * @param {string} priceValue - Precio en formato boliviano (ej: "1.234,56")
 * @return {number | null} Número parseado o null si no es válido
 */
function parseFormattedPrice(priceValue: string): number | null {
  if (!priceValue) return null;
  // Normalizar de formato boliviano a formato JS
  const normalized = priceValue.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * @Funcionalidad: Convierte el precio formateado al formato que espera el backend
 * @param {string} priceValue - Precio en formato boliviano (ej: "1.234,56")
 * @return {string} Precio en formato numérico estándar (ej: "1234.56")
 */
function toBackendPrice(priceValue: string): string {
  return priceValue.replace(/\./g, "").replace(",", ".");
}

export function useInformacionComercialForm() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>(FORM_INICIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [submitMessage, setSubmitMessage] = useState("");
  // Indica si el componente ya está montado en el cliente
  // Evita el error de hydration al mostrar datos del sessionStorage
  const [bolMounted, setBolMounted] = useState(false);

  // Recuperar borrador del sessionStorage solo en el cliente tras el montaje
  // Usa startTransition igual que el hook del paso 2 para evitar hydration error
  useEffect(() => {
    const strSaved = sessionStorage.getItem(DRAFT_KEY);
    if (strSaved) {
      try {
        const objSaved = JSON.parse(strSaved) as FormData;
        startTransition(() => {
          setForm({ ...FORM_INICIAL, ...objSaved });
        });
      } catch {
        sessionStorage.removeItem(DRAFT_KEY);
      }
    }
    setTimeout(() => {
    setBolMounted(true);
  },0);
  }, []);

  // Guardar borrador automáticamente cada vez que el form cambia
  useEffect(() => {
    if (!bolMounted) return;
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form, bolMounted]);

  /**
   * @Funcionalidad: Valida un campo individual según las reglas de negocio
   * @param {keyof FormData} name - Nombre del campo a validar
   * @param {string} value - Valor actual del campo
   * @return {string | undefined} Mensaje de error o undefined si es válido
   */
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
        const intNum = parseFormattedPrice(value);
        if (intNum === null) return "El precio debe ser numérico.";
        if (intNum <= 0) return "El precio debe ser mayor a 0.";
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

  /**
   * @Funcionalidad: Valida todos los campos del formulario de una sola vez
   * @return {FormErrors} Objeto con los errores encontrados por campo
   */
  function validateAll(): FormErrors {
    const objFieldErrors: FormErrors = {};
    (Object.keys(form) as FormField[]).forEach((fieldName) => {
      const strErrorMessage = validateField(fieldName, form[fieldName]);
      if (strErrorMessage) objFieldErrors[fieldName] = strErrorMessage;
    });
    return objFieldErrors;
  }

  /**
   * @Funcionalidad: Maneja cambios en inputs de texto y textarea
   * @param {React.ChangeEvent} e - Evento de cambio del input
   */
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSubmitStatus(null);
    setSubmitMessage("");
    // Revalidar en tiempo real solo si el campo ya fue tocado
    if (touched[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name as keyof FormData, value),
        general: undefined,
      }));
    }
  }

  /**
   * @Funcionalidad: Maneja cambios en el campo precio con formato boliviano
   * @param {React.ChangeEvent<HTMLInputElement>} e - Evento de cambio del input precio
   */
  function handlePrecioChange(e: React.ChangeEvent<HTMLInputElement>) {
    const strFormatted = formatPriceInput(e.target.value);
    // Bloquear si supera el límite máximo permitido
    if (strFormatted) {
      const intNum = parseFormattedPrice(strFormatted);
      if (intNum !== null && intNum > PRECIO_MAXIMO) {
        setTouched((prev) => ({ ...prev, precio: true }));
        setErrors((prev) => ({
          ...prev,
          precio: `No puede superar ${PRECIO_MAXIMO.toLocaleString("es-BO")} Bs.`,
        }));
        return;
      }
    }
    setForm((prev) => ({ ...prev, precio: strFormatted }));
    setSubmitStatus(null);
    setSubmitMessage("");
    if (touched.precio) {
      setErrors((prev) => ({
        ...prev,
        precio: validateField("precio", strFormatted),
        general: undefined,
      }));
    }
  }

  /**
   * @Funcionalidad: Marca el campo como tocado y valida al perder el foco
   * @param {React.FocusEvent} e - Evento de blur del input
   */
  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name as keyof FormData, value) }));
  }

  /**
   * @Funcionalidad: Valida dropdown al cerrarse sin seleccionar una opción
   * @param {"tipoPropiedad" | "tipoOperacion"} name - Nombre del campo dropdown
   */
  function handleDropdownBlur(name: "tipoPropiedad" | "tipoOperacion") {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, form[name]) }));
  }

  /**
   * @Funcionalidad: Registra la opción seleccionada en Tipo de Propiedad
   * @param {string} strOption - Opción seleccionada por el usuario
   */
  function handleSelectPropiedad(strOption: string) {
    setForm((prev) => ({ ...prev, tipoPropiedad: strOption }));
    setErrors((prev) => ({ ...prev, tipoPropiedad: undefined, general: undefined }));
    setTouched((prev) => ({ ...prev, tipoPropiedad: true }));
    setSubmitStatus(null);
    setSubmitMessage("");
  }

  /**
   * @Funcionalidad: Registra la opción seleccionada en Tipo de Operación
   * @param {string} strOption - Opción seleccionada por el usuario
   */
  function handleSelectOperacion(strOption: string) {
    setForm((prev) => ({ ...prev, tipoOperacion: strOption }));
    setErrors((prev) => ({ ...prev, tipoOperacion: undefined, general: undefined }));
    setTouched((prev) => ({ ...prev, tipoOperacion: true }));
    setSubmitStatus(null);
    setSubmitMessage("");
  }

  /**
   * @Funcionalidad: Cancela el formulario con confirmación si hay datos ingresados.
   * Limpia también el borrador guardado en sessionStorage.
   */
function handleCancelar() {
  if (isSubmitting) return;
  const bolHasData = Object.values(form).some((value) => value.trim() !== "");
  if (bolHasData) {
    if (!window.confirm("Los datos ingresados se eliminarán. ¿Deseas salir del formulario?")) return;
  }
  sessionStorage.removeItem(DRAFT_KEY);
  setForm(FORM_INICIAL);
  setErrors({});
  setTouched({});
  setSubmitStatus(null);
  setSubmitMessage("");
  // Redirigir al home
  router.push("/");
}

  /**
   * @Funcionalidad: Valida el formulario, guarda los datos temporalmente en sessionStorage
   * y navega al paso 2. Los datos NO se envían al backend hasta que el usuario
   * presione Publicar en el formulario de Características del Inmueble.
   */
  function handleSiguiente() {
    if (isSubmitting) return;

    // Marcar todos los campos como tocados para mostrar errores
    const objAllTouched: Partial<Record<FormField, boolean>> = {};
    FORM_FIELDS.forEach((fieldName) => {
      objAllTouched[fieldName] = true;
    });
    setTouched(objAllTouched);

    const objLocalErrors = validateAll();
    setErrors(objLocalErrors);
    if (Object.keys(objLocalErrors).length > 0) return;

    // Guardar datos finales validados del paso 1 para que el paso 2 los lea al publicar
    sessionStorage.setItem("informacionComercial", JSON.stringify({
      titulo:        form.titulo,
      precio:        toBackendPrice(form.precio),
      tipoPropiedad: form.tipoPropiedad,
      tipoOperacion: toTipoOperacionBackend(form.tipoOperacion),
      descripcion:   form.descripcion,
    }));

    // Limpiar el borrador ya que los datos finales están guardados
    
    router.push("/frontend/publicacion/Caracteristicas");
  }

  // Retorna true si el campo fue tocado y tiene error
  const hasErr = (fieldName: keyof FormData) => touched[fieldName] && !!errors[fieldName];

  return {
    form,
    errors,
    touched,
    hasErr,
    bolMounted,
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