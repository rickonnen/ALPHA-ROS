/*  Dev: David Chavez Totora - xdev/davidc
    Fecha: 05/04/2026
    Funcionalidad: GET /api/perfil/getFoto?id_usuario=...
      - Retorna solo la url_foto_perfil del usuario
      - Si no existe o está vacía, retorna la imagen por defecto de shadcn
*/
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const STR_DEFAULT_PHOTO = "https://github.com/shadcn.png";

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
      select: { url_foto_perfil: true },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const strFoto = usuario.url_foto_perfil?.trim() || STR_DEFAULT_PHOTO;

    return NextResponse.json({ url_foto_perfil: strFoto }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener foto de perfil:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}