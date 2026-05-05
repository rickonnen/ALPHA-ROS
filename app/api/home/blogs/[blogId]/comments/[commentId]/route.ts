/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 04/05/2026
 * funcionalidad: elimina un comentario (soft-delete) validando que el usuario autenticado sea el dueño real del mismo
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

async function getUserIdFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;
    if (!authToken) return null;
    const decoded = verify(authToken, process.env.JWT_SECRET!) as { userId: string };
    return decoded?.userId || null;
  } catch (error) {
    return null;
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ blogId: string, commentId: string }> }
) {
  try {
    const id_usuario = await getUserIdFromCookies();
    if (!id_usuario) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const ResolvedParams = await params;
    const IntComentarioId = parseInt(ResolvedParams.commentId);

    if (isNaN(IntComentarioId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    // Verificamos que el comentario exista y sea del usuario
    const comentario = await prisma.comentariosBlog.findUnique({
      where: { id_comentario: IntComentarioId }
    });

    if (!comentario) {
      return NextResponse.json({ error: "Comentario no encontrado" }, { status: 404 });
    }

    if (comentario.id_usuario !== id_usuario) {
      return NextResponse.json({ error: "No tienes permiso para borrar este comentario" }, { status: 403 });
    }

    // hacemos un "Soft Delete"
    await prisma.comentariosBlog.update({
      where: { id_comentario: IntComentarioId },
      data: { deleted_at: new Date() }
    });

    return NextResponse.json({ message: "Comentario eliminado correctamente" }, { status: 200 });

  } catch (error) {
    console.error("[DELETE_COMMENT_ERROR]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}