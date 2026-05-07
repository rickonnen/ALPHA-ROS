import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 04/05/2026
 * funcionalidad: gestiona la acción de dar o quitar like a un comentario (toggle) validando la sesión del usuario
 */
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ blogId: string, commentId: string }> }
) {
  try {
    const id_usuario = await getUserIdFromCookies();
    if (!id_usuario) {
      return NextResponse.json({ error: "Debes iniciar sesión para dar like" }, { status: 401 });
    }

    const ResolvedParams = await params;
    const IntComentarioId = parseInt(ResolvedParams.commentId);

    if (isNaN(IntComentarioId)) {
      return NextResponse.json({ error: "ID de comentario inválido" }, { status: 400 });
    }

    // buscamos si este usuario dio like a este comentario específico
    const likeExistente = await prisma.likesComentarios.findFirst({
      where: {
        id_comentario: IntComentarioId,
        id_usuario: id_usuario,
      }
    });

    if (likeExistente) {
      // si ya existe quitar like
      await prisma.likesComentarios.delete({
        where: { id_like: likeExistente.id_like }
      });
      return NextResponse.json({ message: "Like removido", isLiked: false }, { status: 200 });
    } else {
      // si no existe, agregar like
      await prisma.likesComentarios.create({
        data: {
          id_comentario: IntComentarioId,
          id_usuario: id_usuario,
        }
      });
      return NextResponse.json({ message: "Like agregado", isLiked: true }, { status: 201 });
    }

  } catch (error) {
    console.error("[TOGGLE_LIKE_ERROR]", error);
    return NextResponse.json({ error: "Error al procesar el like" }, { status: 500 });
  }
}