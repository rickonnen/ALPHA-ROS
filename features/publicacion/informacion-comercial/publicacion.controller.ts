/**
 * @Dev: [BenjaminA]
 * @Fecha: 28/03/2026
 * @Funcionalidad: Controlador del endpoint de Información Comercial.
 * Lee el request, valida los datos, llama al servicio y devuelve la respuesta HTTP.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  validarInformacionComercial,
  parsearAPublicacionInput,
} from "./publicacion.dto";
import { crearInformacionComercial } from "./publicacion.service";

/**
 * @Funcionalidad: Maneja el POST /api/publicacion/informacion-comercial
 * Procesa la creación de la información comercial de una nueva publicación
 * @param {NextRequest} req - Request de Next.js con el body JSON del formulario
 * @return {NextResponse} Respuesta JSON con el resultado de la operación
 */
export async function crearInformacionComercialController(
  req: NextRequest
): Promise<NextResponse> {

  // Parsear el body como JSON
  let objBody: unknown;
  try {
    objBody = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, mensaje: "El cuerpo de la petición no es JSON válido." },
      { status: 400 }
    );
  }

  // Validar campos del formulario con las reglas de negocio
  const { valid: bolValid, errors: objErrors } = validarInformacionComercial(objBody);
  if (!bolValid) {
    return NextResponse.json(
      { ok: false, mensaje: "Los datos enviados no son válidos.", errores: objErrors },
      { status: 422 }
    );
  }

  /*
   * TODO (auth): Cuando el equipo de auth entregue el middleware,
   * reemplazar USUARIO_TEMPORAL por el ID real del header:
   *
   *   const strUsuarioId = req.headers.get("x-usuario-id") ?? "";
   *   if (!strUsuarioId) {
   *     return NextResponse.json(
   *       { ok: false, mensaje: "No autenticado." },
   *       { status: 401 }
   *     );
   *   }
   */
  const USUARIO_TEMPORAL = "00000000-0000-0000-0000-000000000000";

  // Mapear los datos validados al formato que espera Prisma
  const objInput = parsearAPublicacionInput(
    objBody as Record<string, unknown>,
    USUARIO_TEMPORAL
  );

  // Llamar al servicio para guardar en la BD
  try {
    const objResultado = await crearInformacionComercial(objInput);

    return NextResponse.json(
      {
        ok: true,
        mensaje: "Información comercial guardada correctamente.",
        data: {
          id_publicacion: objResultado.id_publicacion,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("[publicacion] Error al guardar información comercial:", error);
    return NextResponse.json(
      { ok: false, mensaje: "Error interno del servidor. Intente nuevamente." },
      { status: 500 }
    );
  }
}