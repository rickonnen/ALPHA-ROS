import { FormData, FormField, toTipoOperacionBackend } from "../InformacionComercial.types";
import { toBackendPrice } from "./useInformacionComercialPrecio";

const DRAFT_KEY      = "informacionComercialDraft";
const DRAFT_USER_KEY = "informacionComercialDraftUsuario";

export function getIdUsuarioActual(): string {
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw)?.id ?? "") : "";
  } catch {
    return "";
  }
}

export function leerBorrador(): FormData | null {
  try {
    const idUsuarioActual = getIdUsuarioActual();
    const idUsuarioDraft  = sessionStorage.getItem(DRAFT_USER_KEY) ?? "";
    if (idUsuarioDraft && idUsuarioDraft !== idUsuarioActual) {
      sessionStorage.removeItem(DRAFT_KEY);
      sessionStorage.removeItem(DRAFT_USER_KEY);
      return null;
    }
    const strSaved = sessionStorage.getItem(DRAFT_KEY);
    if (!strSaved) return null;
    return JSON.parse(strSaved) as FormData;
  } catch {
    return null;
  }
}

export function guardarBorrador(form: FormData): void {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  sessionStorage.setItem(DRAFT_USER_KEY, getIdUsuarioActual());
}

export function limpiarBorrador(): void {
  sessionStorage.removeItem(DRAFT_KEY);
  sessionStorage.removeItem(DRAFT_USER_KEY);
  sessionStorage.removeItem("informacionComercial");
}

export function guardarPaso1(form: FormData): void {
  const strIdUsuario = getIdUsuarioActual();
  sessionStorage.setItem("informacionComercial", JSON.stringify({
    titulo:        form.titulo,
    precio:        toBackendPrice(form.precio),
    tipoPropiedad: form.tipoPropiedad,
    tipoOperacion: toTipoOperacionBackend(form.tipoOperacion),
    descripcion:   form.descripcion,
    id_usuario:    strIdUsuario,
  }));
}