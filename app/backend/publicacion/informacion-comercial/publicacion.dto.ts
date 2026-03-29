/**
 * @Dev: [BenjaminA]
 * @Fecha: 28/03/2026
 * @Funcionalidad: DTO del formulario de Información Comercial (Paso 1).
 * Valida los datos recibidos del frontend y los mapea a los IDs de FK
 * que usa la tabla Publicacion en la base de datos.
 */

// Mapeo de strings del frontend a IDs de la BD
// Verificar con: SELECT * FROM "TipoInmueble";
export const TIPO_INMUEBLE_IDS: Record<string, number> = {
  Casa:          1,
  Departamento:  2,
  Terreno:       3,
  Oficina:       4,
};

// Verificar con: SELECT * FROM "TipoOperacion";
export const TIPO_OPERACION_IDS: Record<string, number> = {
  Venta:         1,
  Alquiler:      2,
  "Anticretico": 3,
};

// ID del estado BORRADOR en la tabla EstadoPublicacion
// Verificar con: SELECT * FROM "EstadoPublicacion";
export const ESTADO_BORRADOR_ID = 1;

// Límites de validación sincronizados con el frontend
export const TITULO_MIN = 10;
export const TITULO_MAX = 150;
export const DESC_MIN   = 10;
export const DESC_MAX   = 1500;
export const PRECIO_MAX = 9_999_999;

// DTO mapeado listo para Prisma
export interface PublicacionCreateInput {
  titulo:            string;
  precio:            number;
  id_tipo_inmueble:  number;
  id_tipo_operacion: number;
  descripcion:       string;
  id_estado:         number;
  id_usuario:        string;
}

// Resultado de la validación del body
export interface ValidationResult {
  valid:  boolean;
  errors: Record<string, string>;
}

/**
 * @Funcionalidad: Valida el body del request contra las reglas de negocio del formulario
 * @param {unknown} body - Cuerpo del request recibido del frontend
 * @return {ValidationResult} Resultado con indicador de validez y errores por campo
 */
export function validarInformacionComercial(body: unknown): ValidationResult {
  const objErrors: Record<string, string> = {};

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { valid: false, errors: { general: "El cuerpo de la petición es inválido." } };
  }

  const objData = body as Record<string, unknown>;

  // Validación del campo título
  if (!objData.titulo || typeof objData.titulo !== "string") {
    objErrors.titulo = "El título es obligatorio.";
  } else {
    const strT = objData.titulo.trim();
    if (strT.length === 0)             objErrors.titulo = "El título no puede ser solo espacios.";
    else if (strT.length < TITULO_MIN) objErrors.titulo = `Mínimo ${TITULO_MIN} caracteres.`;
    else if (strT.length > TITULO_MAX) objErrors.titulo = `Máximo ${TITULO_MAX} caracteres.`;
  }

  // Validación del campo precio
  if (objData.precio === undefined || objData.precio === null || objData.precio === "") {
    objErrors.precio = "El precio es obligatorio.";
  } else {
    const intN = Number(objData.precio);
    if (isNaN(intN))              objErrors.precio = "El precio debe ser numérico.";
    else if (intN <= 0)           objErrors.precio = "El precio debe ser mayor a 0.";
    else if (intN > PRECIO_MAX)   objErrors.precio = `No puede superar ${PRECIO_MAX.toLocaleString("es-BO")} Bs.`;
  }

  // Validación del tipo de propiedad
  if (!objData.tipoPropiedad || typeof objData.tipoPropiedad !== "string") {
    objErrors.tipoPropiedad = "El tipo de propiedad es obligatorio.";
  } else if (!(objData.tipoPropiedad in TIPO_INMUEBLE_IDS)) {
    objErrors.tipoPropiedad = `Tipo inválido. Opciones: ${Object.keys(TIPO_INMUEBLE_IDS).join(", ")}.`;
  }

  // Validación del tipo de operación
  if (!objData.tipoOperacion || typeof objData.tipoOperacion !== "string") {
    objErrors.tipoOperacion = "El tipo de operación es obligatorio.";
  } else if (!(objData.tipoOperacion in TIPO_OPERACION_IDS)) {
    objErrors.tipoOperacion = `Tipo inválido. Opciones: ${Object.keys(TIPO_OPERACION_IDS).join(", ")}.`;
  }

  // Validación del campo descripción
  if (!objData.descripcion || typeof objData.descripcion !== "string") {
    objErrors.descripcion = "La descripción es obligatoria.";
  } else {
    const strD = objData.descripcion.trim();
    if (strD.length === 0)           objErrors.descripcion = "La descripción no puede ser solo espacios.";
    else if (strD.length < DESC_MIN) objErrors.descripcion = `Mínimo ${DESC_MIN} caracteres.`;
    else if (strD.length > DESC_MAX) objErrors.descripcion = `Máximo ${DESC_MAX} caracteres.`;
  }

  return { valid: Object.keys(objErrors).length === 0, errors: objErrors };
}

/**
 * @Funcionalidad: Convierte el body validado al formato que espera Prisma para crear el registro
 * @param {Record<string, unknown>} body - Body ya validado del request
 * @param {string} strUsuarioId - ID del usuario autenticado
 * @return {PublicacionCreateInput} Objeto listo para prisma.publicacion.create()
 */
export function parsearAPublicacionInput(
  body: Record<string, unknown>,
  strUsuarioId: string
): PublicacionCreateInput {
  return {
    titulo:            (body.titulo as string).trim(),
    precio:            Number(body.precio),
    id_tipo_inmueble:  TIPO_INMUEBLE_IDS[body.tipoPropiedad as string],
    id_tipo_operacion: TIPO_OPERACION_IDS[body.tipoOperacion as string],
    descripcion:       (body.descripcion as string).trim(),
    id_estado:         ESTADO_BORRADOR_ID,
    id_usuario:        strUsuarioId,
  };
}