/*  Dev: David Chavez Totora - xdev/davidc
    Fecha: 27/03/2026
    Funcionalidad: GET /backend/perfil/get?id_usuario=...
      - Retorna los datos del usuario + sus teléfonos
*/

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id_usuario = searchParams.get("id_usuario");

  if (!id_usuario) {
    return NextResponse.json(
      { error: "Falta el parámetro id_usuario" },
      { status: 400 }
    );
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario },
      include: {
        UsuarioTelefono: {
          include: {
            Telefono: true,
          },
        },
        Rol: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: usuario }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}