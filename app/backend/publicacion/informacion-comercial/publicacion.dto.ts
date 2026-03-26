// ─── DTO: Información Comercial (Paso 1) ─────────────────────────────────────
// Valida los datos del formulario y los mapea a los IDs de FK
// que usa la tabla Publicacion en la BD real.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Mapeo de strings del frontend a IDs de la BD ────────────────────────────
// Estos IDs deben coincidir con los registros en las tablas TipoInmueble
// y TipoOperacion de tu base de datos.
// Verificar con: SELECT * FROM "TipoInmueble"; SELECT * FROM "TipoOperacion";

export const TIPO_INMUEBLE_IDS: Record<string, number> = {
  Casa:          1,
  Departamento:  2,
  Terreno:       3,
  Oficina:       4,
};

export const TIPO_OPERACION_IDS: Record<string, number> = {
  Venta:         1,
  Alquiler:      2,
  "Anticretico": 3,
};

// ID del estado BORRADOR en la tabla EstadoPublicacion
// Verificar con: SELECT * FROM "EstadoPublicacion";
export const ESTADO_BORRADOR_ID = 1;

// ─── Constantes de validación (deben coincidir con el frontend) ───────────────
export const TITULO_MIN = 10;
export const TITULO_MAX = 150;
export const DESC_MIN   = 10;
export const DESC_MAX   = 1500;
export const PRECIO_MAX = 9_999_999;

// ─── DTO mapeado listo para Prisma ────────────────────────────────────────────
export interface PublicacionCreateInput {
  titulo:             string;
  precio:             number;
  id_tipo_inmueble:   number;
  id_tipo_operacion:  number;
  descripcion:        string;
  id_estado:          number;
  id_usuario:         string;
}

// ─── Resultado de validación ──────────────────────────────────────────────────
export interface ValidationResult {
  valid:  boolean;
  errors: Record<string, string>;
}

// ─── Función de validación ────────────────────────────────────────────────────
export function validarInformacionComercial(body: unknown): ValidationResult {
  const errors: Record<string, string> = {};

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { valid: false, errors: { general: "El cuerpo de la petición es inválido." } };
  }

  const data = body as Record<string, unknown>;

  // titulo
  if (!data.titulo || typeof data.titulo !== "string") {
    errors.titulo = "El título es obligatorio.";
  } else {
    const t = data.titulo.trim();
    if (t.length === 0)             errors.titulo = "El título no puede ser solo espacios.";
    else if (t.length < TITULO_MIN) errors.titulo = `Mínimo ${TITULO_MIN} caracteres.`;
    else if (t.length > TITULO_MAX) errors.titulo = `Máximo ${TITULO_MAX} caracteres.`;
  }

  // precio
  if (data.precio === undefined || data.precio === null || data.precio === "") {
    errors.precio = "El precio es obligatorio.";
  } else {
    const n = Number(data.precio);
    if (isNaN(n))            errors.precio = "El precio debe ser numérico.";
    else if (n <= 0)         errors.precio = "El precio debe ser mayor a 0.";
    else if (n > PRECIO_MAX) errors.precio = `No puede superar ${PRECIO_MAX.toLocaleString("es-BO")} Bs.`;
  }

  // tipoPropiedad
  if (!data.tipoPropiedad || typeof data.tipoPropiedad !== "string") {
    errors.tipoPropiedad = "El tipo de propiedad es obligatorio.";
  } else if (!(data.tipoPropiedad in TIPO_INMUEBLE_IDS)) {
    errors.tipoPropiedad = `Tipo inválido. Opciones: ${Object.keys(TIPO_INMUEBLE_IDS).join(", ")}.`;
  }

  // tipoOperacion
  if (!data.tipoOperacion || typeof data.tipoOperacion !== "string") {
    errors.tipoOperacion = "El tipo de operación es obligatorio.";
  } else if (!(data.tipoOperacion in TIPO_OPERACION_IDS)) {
    errors.tipoOperacion = `Tipo inválido. Opciones: ${Object.keys(TIPO_OPERACION_IDS).join(", ")}.`;
  }

  // descripcion
  if (!data.descripcion || typeof data.descripcion !== "string") {
    errors.descripcion = "La descripción es obligatoria.";
  } else {
    const d = data.descripcion.trim();
    if (d.length === 0)           errors.descripcion = "La descripción no puede ser solo espacios.";
    else if (d.length < DESC_MIN) errors.descripcion = `Mínimo ${DESC_MIN} caracteres.`;
    else if (d.length > DESC_MAX) errors.descripcion = `Máximo ${DESC_MAX} caracteres.`;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// ─── Convierte el body validado al input de Prisma ────────────────────────────
export function parsearAPublicacionInput(
  body: Record<string, unknown>,
  usuarioId: string
): PublicacionCreateInput {
  return {
    titulo:            (body.titulo as string).trim(),
    precio:            Number(body.precio),
    id_tipo_inmueble:  TIPO_INMUEBLE_IDS[body.tipoPropiedad as string],
    id_tipo_operacion: TIPO_OPERACION_IDS[body.tipoOperacion as string],
    descripcion:       (body.descripcion as string).trim(),
    id_estado:         ESTADO_BORRADOR_ID,
    id_usuario:        usuarioId,
  };
}