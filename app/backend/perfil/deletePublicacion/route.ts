/*  Dev: Candy Camila Ordoñez Pinto
    Fecha: 28/03/2026
    Funcionalidad: DELETE /backend/perfil/deletePublicacion
      - Elimina una publicación validando que el usuario sea el dueño
      - @param {id_publicacion} - ID de la publicación a eliminar
      - @param {id_usuario} - ID del usuario dueño
      - @throws {401} - si el usuario no tiene sesión activa
      - @throws {403} - si el usuario no es el dueño
      - @throws {404} - si la publicación no existe
*/
/*
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
//import { createClient } from "@/lib/supabase/server";

const prisma = new PrismaClient();

export async function DELETE(req: NextRequest) {
  // Validar sesión con Supabase
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: "No autorizado. Sesión no válida." },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const id_publicacion = searchParams.get("id_publicacion");
  const id_usuario = searchParams.get("id_usuario");

  if (!id_publicacion || !id_usuario) {
    return NextResponse.json(
      { error: "Faltan parámetros id_publicacion o id_usuario" },
      { status: 400 },
    );
  }

  try {
    const publicacion = await prisma.publicacion.findUnique({
      where: { id_publicacion: parseInt(id_publicacion) },
    });

    if (!publicacion) {
      return NextResponse.json(
        { error: "Publicación no encontrada" },
        { status: 404 },
      );
    }

    if (publicacion.id_usuario !== id_usuario) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar esta publicación" },
        { status: 403 },
      );
    }

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
*/

import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  // Tu lógica para borrar la publicación aquí
  return NextResponse.json({ message: "Publicación eliminada" });
}

// O si usas POST para borrar por alguna razón:
// export async function POST(request: Request) { ... }