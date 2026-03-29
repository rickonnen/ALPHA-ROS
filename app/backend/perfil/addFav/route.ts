/*  Dev: David Chavez Totora - xdev/davidc
    Fecha: 28/03/2026
    Funcionalidad: POST /backend/perfil/addFav
      - Agrega una publicación a los favoritos del usuario
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

    const favorito = await prisma.favorito.create({
      data: {
        id_usuario,
        id_publicacion: Number(id_publicacion),
        fecha_add: new Date(), // now()
      },
    });

    return NextResponse.json(
      { message: "Publicación agregada a favoritos", data: favorito },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Esta publicación ya está en tus favoritos" },
        { status: 409 }
      );
    }
    console.error("Error al agregar favorito:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}