/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 04/05/2026
 * funcionalidad: recupera la información pública de un blog específico
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogState, singleBlogData } from "@/types/blogType";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ blogId: string }> } 
) {
  try {
    const ResolvedParamsBlo = await params;
    const IntBlogIdBlo = parseInt(ResolvedParamsBlo.blogId);

    if (isNaN(IntBlogIdBlo)) {
      return NextResponse.json({ error: "id invalido" }, { status: 400 });
    }

    // Consulta a Prisma
    const ObjDbBlogBlo = await prisma.blogs.findFirst({
      where: {
        id_blog: IntBlogIdBlo,
        estado: blogState.PUBLICADO,
        deleted_at: null,
      },
      include: {
        Usuario: true 
      }
    });

    if (!ObjDbBlogBlo) {
      return NextResponse.json({ error: "blog no encontrado" }, { status: 404 });
    }

    // Formateo de fecha
    const StrFormattedDateBlo = ObjDbBlogBlo.fecha_publicacion
      ? new Date(ObjDbBlogBlo.fecha_publicacion).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "fecha desconocida";

    // Mapeo de datos
    const ObjFormattedBlogBlo: singleBlogData = {
      IntIdBlo: ObjDbBlogBlo.id_blog,
      StrTitleBlo: ObjDbBlogBlo.titulo || "",
      StrDescriptionBlo: ObjDbBlogBlo.descripcion || "",
      StrContentBlo: ObjDbBlogBlo.contenido || "",
      StrImageUrlBlo: ObjDbBlogBlo.imagen_url || "",
      StrDateBlo: StrFormattedDateBlo,
      StrAuthorBlo: ObjDbBlogBlo.Usuario?.nombres || "Autor Desconocido", 
    };

    return NextResponse.json(ObjFormattedBlogBlo);
  } catch (ObjErrorBlo) {
    console.error("[BLOG_SINGLE_GET_ERROR]", ObjErrorBlo);
    return NextResponse.json({ error: "error al obtener el blog" }, { status: 500 });
  }
}