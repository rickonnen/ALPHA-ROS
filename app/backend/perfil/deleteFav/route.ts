/*  Dev: David Chavez Totora - xdev/davidc
    Fecha: 28/03/2026
    Funcionalidad: DELETE /backend/perfil/deleteFav
      - Elimina una publicación de los favoritos del usuario
      - Query params: ?id_usuario=...&id_publicacion=...
*/

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id_usuario = searchParams.get("id_usuario");
  const id_publicacion = searchParams.get("id_publicacion");

  if (!id_usuario || !id_publicacion) {
    return NextResponse.json(
      { error: "Faltan parámetros: id_usuario o id_publicacion" },
      { status: 400 }
    );
  }

  try {
    await prisma.favorito.delete({
      where: {
        id_usuario_id_publicacion: {
          id_usuario,
          id_publicacion: Number(id_publicacion),
        },
      },
    });

    return NextResponse.json(
      { message: "Publicación eliminada de favoritos" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar favorito:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}