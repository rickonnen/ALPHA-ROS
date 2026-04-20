/* Dev: Rene Gabriel Vera Portanda
    Fecha: 17/04/2026
    Funcionalidad: PATCH /api/perfil/updateEstadoPublicacion
      - Cambia el estado de una publicación (ej. 1 Activa, 4 Suspendida)
      - Valida que el usuario sea el dueño de la publicación
      - Query params: ?id_usuario=...&id_publicacion=...&id_estado=...
*/

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id_usuario = searchParams.get("id_usuario");
  const id_publicacion = searchParams.get("id_publicacion");
  const id_estado = searchParams.get("id_estado");

  // 1. Validar que lleguen todos los datos
  if (!id_usuario || !id_publicacion || !id_estado) {
    return NextResponse.json(
      { error: "Faltan parámetros: id_usuario, id_publicacion o id_estado" },
      { status: 400 }
    );
  }

  const idPub = Number(id_publicacion);
  const idEst = Number(id_estado);

  try {
    // 2. Buscar la publicación para verificar que existe
    const publicacion = await prisma.publicacion.findUnique({
      where: { id_publicacion: idPub },
    });

    if (!publicacion) {
      return NextResponse.json(
        { error: "Publicación no encontrada" },
        { status: 404 }
      );
    }

    // 3. Verificamos que el usuario sea el dueño (Seguridad)
    if (publicacion.id_usuario !== id_usuario) {
      return NextResponse.json(
        { error: "No tienes permiso para modificar esta publicación" },
        { status: 403 }
      );
    }

    // 4. Actualizamos el estado
    await prisma.publicacion.update({
      where: { id_publicacion: idPub },
      data: {
        id_estado: idEst,
      },
    });

    return NextResponse.json(
      { message: "Estado de la publicación actualizado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar el estado de la publicación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}