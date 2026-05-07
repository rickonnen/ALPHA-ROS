import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogState } from "@/types/blogType";
/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 06/05/2026
 * funcionalidad: Obtiene la lista de blogs (PUBLICADOS y NOVISIBLES) con su respectivo contador de comentarios
 * (activos y eliminados softdelete)
 */
export async function GET() {
  try {
    const arrBlogsData = await prisma.blogs.findMany({
      where: {
        estado: {
          in: [blogState.PUBLICADO, blogState.NOVISIBLE],
        },
      },
      select: {
        id_blog: true,
        titulo: true,
        estado: true,
        _count: {
          select: {
            ComentariosBlog: true,
          },
        },
      },
      orderBy: {
        fecha_creacion: "desc",
      },
    });

    const arrFormattedBlogs = arrBlogsData.map((objBlog) => ({
      id: objBlog.id_blog.toString(),
      strTitle: objBlog.titulo || "Sin título",
      numComments: objBlog._count.ComentariosBlog,
      enumState: objBlog.estado as blogState,
    }));

    return NextResponse.json(arrFormattedBlogs, { status: 200 });

  } catch (error) {
    console.error("[COMMENT_MANAGEMENT_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno al obtener los blogs para moderación" },
      { status: 500 }
    );
  }
}