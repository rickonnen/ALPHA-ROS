/*  Dev: Luis - xdev/sow-luisc
    Fecha: 09/04/2026
    Funcionalidad: POST /api/perfil/addHistorial
      - Registra o actualiza una publicación en el historial del usuario
      - Body (JSON): { id_usuario, id_publicacion }
*/
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_usuario, id_publicacion } = body;

    if (!id_usuario || !id_publicacion) {
      return NextResponse.json(
        { error: "Faltan campos: id_usuario o id_publicacion" },
        { status: 400 }
      );
    }

    await prisma.historialVistos.upsert({
      where: {
        id_usuario_id_publicacion: {
          id_usuario,
          id_publicacion: Number(id_publicacion),
        },
      },
      update: { fecha: new Date() },
      create: {
        id_usuario,
        id_publicacion: Number(id_publicacion),
        fecha: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Historial actualizado" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al registrar historial:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}