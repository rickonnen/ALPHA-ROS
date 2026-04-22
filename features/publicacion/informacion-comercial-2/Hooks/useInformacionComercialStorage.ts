import { FormData, FormField, toTipoOperacionBackend } from "../InformacionComercial.types";
import { toBackendPrice } from "./useInformacionComercialPrecio";

const DRAFT_KEY      = "informacionComercialDraft";
const DRAFT_USER_KEY = "informacionComercialDraftUsuario";

export function leerBorrador(): FormData | null {
  try {
    const strSaved = sessionStorage.getItem(DRAFT_KEY);
    if (!strSaved) return null;
    return JSON.parse(strSaved) as FormData;
  } catch {
    return null;
  }
}

export function guardarBorrador(form: FormData): void {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
}

export function limpiarBorrador(): void {
  sessionStorage.removeItem(DRAFT_KEY);
  sessionStorage.removeItem(DRAFT_USER_KEY);
  sessionStorage.removeItem("informacionComercial");
}

/**
 * @Funcionalidad: Guarda los datos validados del paso 1 en sessionStorage.
 * Recibe el id_usuario desde el contexto de autenticación (no desde localStorage).
 * @param {FormData} form - Datos del formulario validados
 * @param {string} strIdUsuario - ID del usuario autenticado desde useAuth
 */
export function guardarPaso1(form: FormData, strIdUsuario: string): void {
  sessionStorage.setItem("informacionComercial", JSON.stringify({
    titulo:        form.titulo,
    precio:        toBackendPrice(form.precio),
    tipoPropiedad: form.tipoPropiedad,
    tipoOperacion: toTipoOperacionBackend(form.tipoOperacion),
    descripcion:   form.descripcion,
    id_usuario:    strIdUsuario,
  }));
}