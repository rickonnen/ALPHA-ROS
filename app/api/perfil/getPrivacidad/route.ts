import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const id_usuario = new URL(req.url).searchParams.get("id_usuario");
  if (!id_usuario) return NextResponse.json({ error: "Falta id_usuario" }, { status: 400 });

  try {
    const priv = await prisma.privacidad.findUnique({ where: { id_usuario } });
    // Si no existe aún, devolvemos todo privado (false)
    return NextResponse.json({
      data: priv ?? {
        favorito: false, direccion: false, genero: false,
        fecha_nacimiento: false, estado_civil: false,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_usuario, ...campos } = body;
    if (!id_usuario) return NextResponse.json({ error: "Falta id_usuario" }, { status: 400 });

    const resultado = await prisma.privacidad.upsert({
      where: { id_usuario },
      update: campos,
      create: { id_usuario, ...campos },
    });
    return NextResponse.json({ data: resultado });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}