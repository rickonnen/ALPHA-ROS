/*  Dev: Candy Camila Ordoñez Pinto
    Fecha: 27/03/2026
    Funcionalidad: Eliminar una publicación por ID validando que sea del usuario
      - @param {id_publicacion} - ID de la publicación a eliminar
      - @param {id_usuario} - ID del usuario dueño de la publicación
      - @return {200} - publicación eliminada correctamente
      - @return {400} - faltan parámetros
      - @return {403} - el usuario no es dueño de la publicación
      - @return {404} - publicación no encontrada
      - @return {500} - error interno del servidor
*/
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ID TEMPORAL: falta el id de los de sign in
const ID_USUARIO_HARDCODEADO = "a1b2c3d4-0003-0003-0003-000000000003";

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id_publicacion = searchParams.get("id_publicacion");

  if (!id_publicacion) {
    return NextResponse.json(
      { error: "Falta el parámetro id_publicacion" },
      { status: 400 },
    );
  }

  try {
    // Verificar que la publicación existe
    const publicacion = await prisma.publicacion.findUnique({
      where: { id_publicacion: parseInt(id_publicacion) },
    });

    if (!publicacion) {
      return NextResponse.json(
        { error: "Publicación no encontrada" },
        { status: 404 },
      );
    }

    // Verificar que el usuario es el dueño
    if (publicacion.id_usuario !== ID_USUARIO_HARDCODEADO) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar esta publicación" },
        { status: 403 },
      );
    }

    // Eliminar publicación
    await prisma.publicacion.delete({
      where: { id_publicacion: parseInt(id_publicacion) },
    });

    return NextResponse.json(
      { message: "Publicación eliminada correctamente" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error al eliminar publicación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
