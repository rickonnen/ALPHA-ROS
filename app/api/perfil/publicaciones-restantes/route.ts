import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id_usuario = searchParams.get("id_usuario");

  if (!id_usuario) {
    return NextResponse.json(
      { error: "Falta el parámetro id_usuario" },
      { status: 400 },
    );
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario },
      select: { cant_publicaciones_restantes: true },
    });

    return NextResponse.json(
      {
        cant_publicaciones_restantes:
          usuario?.cant_publicaciones_restantes ?? 0,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error al obtener publicaciones restantes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
