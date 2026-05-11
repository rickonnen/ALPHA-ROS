import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 06/05/2026
 * funcionalidad: Endpoint para la gestión detallada de comentarios de un blog específico.
 * Soporta obtención de lista completa, borrado lógico (PATCH) y borrado permanente (DELETE).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const resolvedParams = await params;
    const IntBlogId = parseInt(resolvedParams.commentId);

    if (isNaN(IntBlogId)) {
      return NextResponse.json({ error: "ID de blog no válido" }, { status: 400 });
    }

    const objBlogData = await prisma.blogs.findUnique({
      where: { id_blog: IntBlogId },
      select: {
        titulo: true,
        ComentariosBlog: {
          include: {
            Usuario: {
              select: {
                username: true,
                nombres: true,
                apellidos: true,
              },
            },
          },
          orderBy: {
            fecha_creacion: "desc",
          },
        },
      },
    });

    if (!objBlogData) {
      return NextResponse.json({ error: "Blog no encontrado" }, { status: 404 });
    }

    const resData = {
      strBlogTitle: objBlogData.titulo || "Sin título",
      arrComments: objBlogData.ComentariosBlog.map((c) => {
        let displayUsername = "Usuario Anónimo";
        if (c.Usuario?.username) {
          displayUsername = c.Usuario.username;
        } else if (c.Usuario?.nombres) {
          displayUsername = `${c.Usuario.nombres} ${c.Usuario.apellidos || ""}`.trim();
        }

        return {
          id: c.id_comentario,
          username: displayUsername,
          content: c.contenido || "",
          createdAt: c.fecha_creacion,
          deletedAt: c.deleted_at,
          parentId: c.id_padre,
        };
      }),
    };

    return NextResponse.json(resData, { status: 200 });
  } catch (error) {
    console.error("[GET_COMMENT_DETAIL_ERROR]", error);
    return NextResponse.json({ error: "Error al obtener comentarios" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    await params;
    const { id_comentario } = await request.json();

    if (!id_comentario) {
      return NextResponse.json({ error: "ID de comentario requerido" }, { status: 400 });
    }

    const updatedComment = await prisma.comentariosBlog.update({
      where: { id_comentario: parseInt(id_comentario) },
      data: {
        deleted_at: new Date(),
      },
    });

    return NextResponse.json(updatedComment, { status: 200 });
  } catch (error) {
    console.error("[PATCH_COMMENT_ERROR]", error);
    return NextResponse.json({ error: "Error al realizar soft delete" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    await params;
    const { id_comentario } = await request.json();

    if (!id_comentario) {
      return NextResponse.json({ error: "ID de comentario requerido" }, { status: 400 });
    }

    await prisma.comentariosBlog.delete({
      where: { id_comentario: parseInt(id_comentario) },
    });

    return NextResponse.json({ message: "Comentario eliminado permanentemente" }, { status: 200 });
  } catch (error) {
    console.error("[DELETE_COMMENT_ERROR]", error);
    return NextResponse.json({ error: "Error al eliminar permanentemente" }, { status: 500 });
  }
}