// app/api/perfil/checkFav/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id_usuario     = searchParams.get("id_usuario");
  const id_publicacion = searchParams.get("id_publicacion");

  if (!id_usuario || !id_publicacion) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  const favorito = await prisma.favorito.findFirst({
    where: {
      id_usuario,
      id_publicacion: Number(id_publicacion),
    },
    select: { id_usuario: true },
  });

  return NextResponse.json({ esFavorito: !!favorito });
}