import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogState } from "@/types/blogType";

/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 23/04/2026
 * funcionalidad: recupera la lista de blogs publicados incluyendo datos del autor
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
        contenido: true,
        // Hacemos el JOIN con la tabla Usuario para el autor
        Usuario: {
          select: {
            nombres: true,
            apellidos: true, 
            url_foto_perfil: true,
          }
        }
      },
      orderBy: {
        fecha_creacion: "desc",
      },
    });

    const ArrFormattedBlogsBlo = ArrDbBlogsBlo.map((ObjRowBlo) => {
      const StrFormattedDateBlo = ObjRowBlo.fecha_publicacion
        ? new Date(ObjRowBlo.fecha_publicacion).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric"
          })
        : "fecha desconocida";

      // Concatenamos nombre y apellido del usuario, o ponemos un default
      const StrFullName = ObjRowBlo.Usuario 
        ? `${ObjRowBlo.Usuario.nombres || ''} ${ObjRowBlo.Usuario.apellidos || ''}`.trim() 
        : "Equipo PropBol";
        // Simulamos un tiempo de lectura basado en la longitud del contenido
        const StrCleanContentBlo = ObjRowBlo.contenido 
        ? ObjRowBlo.contenido.replace(/<[^>]*>?/gm, '') 
        : '';
      const IntWordCountBlo = StrCleanContentBlo.trim().split(/\s+/).filter(word => word.length > 0).length;
      const IntReadTimeBlo = Math.max(1, Math.ceil(IntWordCountBlo / 200));

      return {
        IntIdBlo: ObjRowBlo.id_blog,
        StrTitleBlo: ObjRowBlo.titulo || "",
        StrDateBlo: StrFormattedDateBlo,
        StrDescriptionBlo: ObjRowBlo.descripcion || "",
        StrImageUrlBlo: ObjRowBlo.imagen_url || "",
        ObjAuthorBlo: {
          name: StrFullName || "Usuario Anónimo",
          avatar: ObjRowBlo.Usuario?.url_foto_perfil || undefined
        },
        StrReadTimeBlo: `${IntReadTimeBlo} min`,
      };
    });

    return NextResponse.json(ArrFormattedBlogsBlo);
  } catch (ObjErrorBlo) {
    console.error("[BLOGS_GET_ERROR]", ObjErrorBlo);
    return NextResponse.json({ error: "error al obtener los blogs" }, { status: 500 });
  }
}