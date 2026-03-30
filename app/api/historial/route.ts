/*  Dev: Luis - xdev/sow-luisc
    Fecha: 29/03/2026
    Funcionalidad: /api/historial
      - GET    ?id_usuario=...                          → Lista el historial del usuario
      - DELETE ?id_usuario=...&id_publicacion=...       → Elimina un item del historial
*/

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── GET /api/historial?id_usuario=... ───────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id_usuario = searchParams.get("id_usuario");

  if (!id_usuario) {
    return NextResponse.json(
      { error: "Falta el parámetro: id_usuario" },
      { status: 400 }
    );
  }

  try {
    const historial = await prisma.historialVistos.findMany({
      where: { id_usuario },
      orderBy: { fecha: "desc" },
      include: {
        Publicacion: {
          include: {
            Moneda:        { select: { simbolo: true } },
            TipoOperacion: { select: { nombre_operacion: true } },
            Imagen:        { select: { url_imagen: true }, take: 1 },
          },
        },
      },
    });

    return NextResponse.json(historial, { status: 200 });
  } catch (error) {
    console.error("Error al obtener historial:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/historial?id_usuario=...&id_publicacion=... ─────────────────
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id_usuario    = searchParams.get("id_usuario");
  const id_publicacion = searchParams.get("id_publicacion");

  if (!id_usuario || !id_publicacion) {
    return NextResponse.json(
      { error: "Faltan parámetros: id_usuario o id_publicacion" },
      { status: 400 }
    );
  }

  try {
    await prisma.historialVistos.delete({
      where: {
        id_usuario_id_publicacion: {
          id_usuario,
          id_publicacion: Number(id_publicacion),
        },
      },
    });

    return NextResponse.json(
      { message: "Publicación eliminada del historial" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar del historial:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}