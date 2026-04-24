import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 23/04/2026
 * funcionalidad: recupera la lista de blogs publicados y los formatea
 * @return {NextResponse} json con los blogs formateados o estado 500 en caso de error
 */
export async function GET() {
  try {
    // consulta a prisma para obtener blogs publicados
    const arrDbBlogs = await prisma.blogs.findMany({
      where: {
        estado: "PUBLICADO",
        deleted_at: null
      },
      orderBy: {
        fecha_creacion: "desc",
      },
    });

    // formateo de datos y transformacion de la fecha
    const arrFormattedBlogs = arrDbBlogs.map((objRow) => {
      const strFormattedDate = objRow.fecha_publicacion
        ? new Date(objRow.fecha_publicacion).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric"
          })
        : "fecha desconocida";

      return {
        intId: objRow.id_blog,
        strTitle: objRow.titulo,
        strDate: strFormattedDate,
        strDescription: objRow.descripcion,
        strImageUrl: objRow.imagen_url || "",
      };
    });

    return NextResponse.json(arrFormattedBlogs);
  } catch (objError) {
    console.error("[BLOGS_GET_ERROR]", objError);
    return NextResponse.json({ error: "error al obtener los blogs" }, { status: 500 });
  }
}