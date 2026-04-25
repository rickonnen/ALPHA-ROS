import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 24/04/2026
 * funcionalidad: renderiza la vista completa de un blog especifico
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ blogId: string }> } 
) {
  try {
    const resolvedParams = await params;
    const intBlogId = parseInt(resolvedParams.blogId);

    if (isNaN(intBlogId)) {
      return NextResponse.json({ error: "id invalido" }, { status: 400 });
    }

    // consulta a prisma filtrando por id, estado y que no este eliminado
    const objDbBlog = await prisma.blogs.findFirst({
      where: {
        id_blog: intBlogId,
        estado: "PUBLICADO",
        deleted_at: null,
      },
    });

    if (!objDbBlog) {
      return NextResponse.json({ error: "blog no encontrado" }, { status: 404 });
    }

    const strFormattedDate = objDbBlog.fecha_publicacion
      ? new Date(objDbBlog.fecha_publicacion).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "fecha desconocida";

    const objFormattedBlog = {
      intId: objDbBlog.id_blog,
      strTitle: objDbBlog.titulo,
      strDescription: objDbBlog.descripcion,
      strContent: objDbBlog.contenido,
      strImageUrl: objDbBlog.imagen_url || "",
      strDate: strFormattedDate,
    };

    return NextResponse.json(objFormattedBlog);
  } catch (objError) {
    console.error("[BLOG_SINGLE_GET_ERROR]", objError);
    return NextResponse.json({ error: "error al obtener el blog" }, { status: 500 });
  }
}