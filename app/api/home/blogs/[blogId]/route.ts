import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 25/04/2026
 * funcionalidad: recupera un blog especifico por su id, verifica su estado y formatea sus datos detallados
 * @param {Request} request peticion entrante
 * @param {{ params: Promise<{ blogId: string }> }} params parametros de la ruta con el id del blog
 * @return {NextResponse} json con los datos del blog, o estado de error (400, 404, 500) segun corresponda
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

    // formateo estricto utilizando la fecha de creacion segun requerimiento
    const strFormattedDate = objDbBlog.fecha_creacion
      ? new Date(objDbBlog.fecha_creacion).toLocaleDateString("es-ES", {
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