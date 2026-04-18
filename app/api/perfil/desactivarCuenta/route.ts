/*  Dev: [Tu nombre] - HU-04
    Fecha: [fecha]
    Funcionalidad: PATCH /api/perfil/desactivarCuenta
      - Marca estado = 0 en la tabla Usuario (CA-2)
      - Registra fecha y hora de desactivación (CA-12)
      - Revoca la sesión de Supabase Auth para cerrar TODOS los dispositivos (CA-9)
      - El campo active (estado) pasa a false/0 en BD (CA-2)
    Body (JSON): { id_usuario: string }
*/

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

// Cliente admin de Supabase para poder revocar sesiones de cualquier usuario (CA-9)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_usuario } = body;

    if (!id_usuario) {
      return NextResponse.json(
        { error: "Falta el campo id_usuario" },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe y está activo antes de desactivar (CA-7/CA-8)
    const usuarioActual = await prisma.usuario.findUnique({
      where: { id_usuario },
      select: { estado: true },
    });

    if (!usuarioActual) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (usuarioActual.estado === 0) {
      return NextResponse.json(
        { error: "La cuenta ya está desactivada" },
        { status: 409 }
      );
    }

    // CA-2: estado pasa a 0 (false/inactivo)
    // CA-12: se registra fecha_desactivacion con la fecha y hora exactas
    const usuarioDesactivado = await prisma.usuario.update({
      where: { id_usuario },
      data: {
        estado: 0,
        fecha_desactivacion: new Date(), // CA-12: registrar fecha y hora exacta
      },
    });

    // CA-9: Revocar TODAS las sesiones activas del usuario en Supabase Auth
    // Esto invalida los tokens JWT en todos los dispositivos simultáneamente
    const { error: supabaseError } = await supabaseAdmin.auth.admin.signOut(
      id_usuario,
      "global" // "global" = cierra todas las sesiones, no solo la actual
    );

    if (supabaseError) {
      // Si falla la revocación de Supabase, hacemos rollback de la desactivación (CA-8)
      await prisma.usuario.update({
        where: { id_usuario },
        data: { estado: 1, fecha_desactivacion: null },
      });
      console.error("Error al revocar sesión Supabase:", supabaseError);
      return NextResponse.json(
        { error: "Error al cerrar sesiones. La cuenta permanece activa." },
        { status: 500 }
      );
    }

    // CA-17: Limpiar cookie auth_token del navegador actual
    const response = NextResponse.json(
      {
        message: "Cuenta desactivada correctamente",
        data: usuarioDesactivado,
      },
      { status: 200 }
    );

    // Eliminar el token de sesión del navegador actual (CA-17)
    response.cookies.delete("auth_token");

    return response;
  } catch (error) {
    console.error("Error al desactivar cuenta:", error);
    // CA-8: Si hay error del sistema, la cuenta permanece activa
    return NextResponse.json(
      { error: "Error interno del servidor. La cuenta permanece activa." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}