/*  Dev:
    Fecha:
    Funcionalidad: PUT /backend/perfil/update
      - Actualiza nombres, apellidos, direccion, username, url_foto_perfil
      - Body (JSON): { id_usuario, nombres, apellidos, direccion, username, url_foto_perfil }
*/

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_usuario, nombres, apellidos, direccion, username, url_foto_perfil } = body;

    if (!id_usuario) {
      return NextResponse.json(
        { error: "Falta el campo id_usuario" },
        { status: 400 }
      );
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id_usuario },
      data: {
        nombres,
        apellidos,
        direccion,
        username,
        url_foto_perfil,
      },
    });

    return NextResponse.json(
      { message: "Perfil actualizado correctamente", data: usuarioActualizado },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}