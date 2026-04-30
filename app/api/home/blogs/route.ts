import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogState, blogData } from "@/types/blogType";

/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 23/04/2026
 * funcionalidad: recupera la lista de blogs publicados y los formatea
 * @return {NextResponse} json con los blogs formateados o estado 500 en caso de error
 */
export async function GET() {
  try {
    const ArrDbBlogsBlo = await prisma.blogs.findMany({
      where: {
        estado: blogState.PUBLICADO,
        deleted_at: null
      },
      select: {
        id_blog: true,
        titulo: true,
        fecha_publicacion: true,
        descripcion: true,
        imagen_url: true,
      },
      orderBy: {
        fecha_creacion: "desc",
      },
    });

    // formateo de datos y transformacion de la fecha
    const ArrFormattedBlogsBlo: blogData[] = ArrDbBlogsBlo.map((ObjRowBlo) => {
      const StrFormattedDateBlo = ObjRowBlo.fecha_publicacion
        ? new Date(ObjRowBlo.fecha_publicacion).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric"
          })
        : "fecha desconocida";

      return {
        IntIdBlo: ObjRowBlo.id_blog,
        StrTitleBlo: ObjRowBlo.titulo || "",
        StrDateBlo: StrFormattedDateBlo,
        StrDescriptionBlo: ObjRowBlo.descripcion || "",
        StrImageUrlBlo: ObjRowBlo.imagen_url || "",
      };
    });

    return NextResponse.json(ArrFormattedBlogsBlo);
  } catch (ObjErrorBlo) {
    console.error("[BLOGS_GET_ERROR]", ObjErrorBlo);
    return NextResponse.json({ error: "error al obtener los blogs" }, { status: 500 });
  }
}