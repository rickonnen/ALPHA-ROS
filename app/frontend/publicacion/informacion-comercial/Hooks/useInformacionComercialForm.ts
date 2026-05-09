"use client";
import { useState, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { FormData, FormErrors, FormField, FORM_INICIAL } from "../InformacionComercial.types";
import { validateField, validateAll } from "./useInformacionComercialValidacion";
import { formatPriceInput, parseFormattedPrice, PRICE_FORMAT_REGEX } from "./useInformacionComercialPrecio";
import { leerBorrador, guardarBorrador, limpiarBorrador, guardarPaso1 } from "./useInformacionComercialStorage";

const FORM_FIELDS: FormField[] = ["titulo", "precio", "tipoPropiedad", "tipoOperacion", "descripcion"];

export function useInformacionComercialForm() {
  const router = useRouter();

  const [form, setForm]                   = useState<FormData>(FORM_INICIAL);
  const [errors, setErrors]               = useState<FormErrors>({});
  const [touched, setTouched]             = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [submitStatus, setSubmitStatus]   = useState<"success" | "error" | null>(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [bolMounted, setBolMounted]       = useState(false);

  useEffect(() => {
    const objSaved = leerBorrador();
    if (objSaved) {
      startTransition(() => {
        setForm({ ...FORM_INICIAL, ...objSaved });
      });
    }
    setTimeout(() => setBolMounted(true), 0);
  }, []);

  useEffect(() => {
    if (!bolMounted) return;
    guardarBorrador(form);
  }, [form, bolMounted]);

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
    const strFormatted = formatPriceInput(e.target.value);
    if (strFormatted) {
      const intNum = parseFormattedPrice(strFormatted);
      if (intNum !== null && intNum > 999999999) {
        setTouched((prev) => ({ ...prev, precio: true }));
        setErrors((prev) => ({ ...prev, precio: `No puede superar ese valor.` }));
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

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name as keyof FormData, value) }));
  }

  function handleDropdownBlur(name: "tipoPropiedad" | "tipoOperacion") {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, form[name]) }));
  }

  function handleSelectPropiedad(strOption: string) {
    setForm((prev) => ({ ...prev, tipoPropiedad: strOption }));
    setErrors((prev) => ({ ...prev, tipoPropiedad: undefined, general: undefined }));
    setTouched((prev) => ({ ...prev, tipoPropiedad: true }));
    setSubmitStatus(null);
    setSubmitMessage("");
  }

  function handleSelectOperacion(strOption: string) {
    setForm((prev) => ({ ...prev, tipoOperacion: strOption }));
    setErrors((prev) => ({ ...prev, tipoOperacion: undefined, general: undefined }));
    setTouched((prev) => ({ ...prev, tipoOperacion: true }));
    setSubmitStatus(null);
    setSubmitMessage("");
  }

  function handleCancelar() {
    if (isSubmitting) return;
    const bolHasData = Object.values(form).some((value) => value.trim() !== "");
    if (bolHasData) {
      if (!window.confirm("Los datos ingresados se eliminarán. ¿Deseas salir del formulario?")) return;
    }
    limpiarBorrador();
    setForm(FORM_INICIAL);
    setErrors({});
    setTouched({});
    setSubmitStatus(null);
    setSubmitMessage("");
    router.push("/");
  }

  function handleSiguiente() {
    if (isSubmitting) return;
    const objAllTouched: Partial<Record<FormField, boolean>> = {};
    FORM_FIELDS.forEach((fieldName) => { objAllTouched[fieldName] = true; });
    setTouched(objAllTouched);
    const objLocalErrors = validateAll(form);
    setErrors(objLocalErrors);
    if (Object.keys(objLocalErrors).length > 0) return;
    guardarPaso1(form);
    router.push("/frontend/publicacion/Caracteristicas");
  }

  const hasErr = (fieldName: keyof FormData) => touched[fieldName] && !!errors[fieldName];

  return {
    form, errors, touched, hasErr, bolMounted,
    validateField, handleChange, handlePrecioChange,
    handleBlur, handleDropdownBlur, handleSelectPropiedad,
    handleSelectOperacion, handleCancelar, handleSiguiente,
    isSubmitting, submitStatus, submitMessage,
  };
}