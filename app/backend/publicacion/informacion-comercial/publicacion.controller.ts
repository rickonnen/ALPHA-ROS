// ─── Controlador: Publicación ─────────────────────────────────────────────────
// Lee el request, valida, llama al servicio y devuelve la respuesta.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import {
  validarInformacionComercial,
  parsearAPublicacionInput,
} from "./publicacion.dto";
import { crearInformacionComercial } from "./publicacion.service";

// ─── POST /api/publicacion/informacion-comercial ──────────────────────────────
export async function crearInformacionComercialController(
  req: NextRequest
): Promise<NextResponse> {

  // 1. Parsear body JSON
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, mensaje: "El cuerpo de la petición no es JSON válido." },
      { status: 400 }
    );
  }

  // 2. Validar campos
  const { valid, errors } = validarInformacionComercial(body);
  if (!valid) {
    return NextResponse.json(
      { ok: false, mensaje: "Los datos enviados no son válidos.", errores: errors },
      { status: 422 }
    );
  }

  // 3. Obtener usuarioId
  /*
   * TODO (auth): Cuando el equipo de auth entregue el middleware,
   * reemplazar USUARIO_TEMPORAL por el ID real del header:
   *
   *   const usuarioId = req.headers.get("x-usuario-id") ?? "";
   *   if (!usuarioId) {
   *     return NextResponse.json(
   *       { ok: false, mensaje: "No autenticado." },
   *       { status: 401 }
   *     );
   *   }
   */
  const USUARIO_TEMPORAL = "00000000-0000-0000-0000-000000000000";

  // 4. Mapear al input de Prisma
  const input = parsearAPublicacionInput(
    body as Record<string, unknown>,
    USUARIO_TEMPORAL
  );

  // 5. Llamar al servicio
  try {
    const resultado = await crearInformacionComercial(input);

    return NextResponse.json(
      {
        ok: true,
        mensaje: "Información comercial guardada correctamente.",
        data: {
          id_publicacion: resultado.id_publicacion,
          //id_estado:      resultado.id_estado,
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