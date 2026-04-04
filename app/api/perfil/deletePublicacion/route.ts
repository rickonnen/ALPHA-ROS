/*  Dev: Candy Camila Ordoñez Pinto
    Fecha: 28/03/2026
    Funcionalidad: DELETE /backend/perfil/deletePublicacion
      - Elimina una publicación validando que el usuario sea el dueño
      - @param {id_publicacion} - ID de la publicación a eliminar
      - @param {id_usuario} - ID del usuario dueño
      - @throws {404} - si la publicación no existe
*/
/*  Dev: Candy Camila Ordoñez Pinto
    Fecha: 03/04/2026
    Funcionalidad: DELETE /backend/perfil/deletePublicacion
      - Elimina una publicación del usuario autenticado
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

  const idPub = Number(id_publicacion);

  try {
    const publicacion = await prisma.publicacion.findUnique({
      where: { id_publicacion: idPub },
    });

    if (!publicacion) {
      return NextResponse.json(
        { error: "Publicación no encontrada" },
        { status: 404 }
      );
    }

    if (publicacion.id_usuario !== id_usuario) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar esta publicación" },
        { status: 403 }
      );
    }

    await prisma.$transaction([
      prisma.imagen.deleteMany({ where: { id_publicacion: idPub } }),
      prisma.favorito.deleteMany({ where: { id_publicacion: idPub } }),
      prisma.publicacion.delete({ where: { id_publicacion: idPub } }),
    ]);

    return NextResponse.json(
      { message: "Publicación eliminada correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar publicación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}