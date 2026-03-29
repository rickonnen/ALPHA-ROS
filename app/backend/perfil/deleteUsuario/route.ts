/*  Dev: David Chavez Totora - xdev/davidc
    Fecha: 27/03/2026
    Funcionalidad: DELETE /backend/perfil/delete
      - Elimina (o desactiva) la cuenta del usuario
      - Body (JSON): { id_usuario }
      - NOTA: No elimina el registro de auth.users directamente (eso lo maneja Supabase Auth).
              Aquí marcamos estado = 0 como "cuenta desactivada".
*/

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_usuario } = body;

    if (!id_usuario) {
      return NextResponse.json(
        { error: "Falta el campo id_usuario" },
        { status: 400 }
      );
    }

    // Opción suave: marcamos estado = 0 (desactivado) en lugar de borrar el registro
    const usuarioDesactivado = await prisma.usuario.update({
      where: { id_usuario },
      data: { estado: 0 },
    });

    return NextResponse.json(
      { message: "Cuenta desactivada correctamente", data: usuarioDesactivado },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al desactivar cuenta:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}