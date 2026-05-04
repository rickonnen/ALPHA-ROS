import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminBlogListResponse, blogState } from "@/types/blogType";

/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 25/04/2026
 * funcionalidad: recupera todos los blogs y los formatea con select optimizado para admin
 * @return {NextResponse} lista completa de blogs con metadata de borrado
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const ArrDbBlogsBlo = await prisma.blogs.findMany({
      skip,
      take: limit,
      select: {
        id_blog: true,
        titulo: true,
        estado: true,
        descripcion: true,
        imagen_url: true,
        fecha_creacion: true,
        deleted_at: true,
        contenido: true,
        Usuario: {
          select: { 
            nombres: true,
            apellidos: true,
            url_foto_perfil: true
          } 
        }
      },
      orderBy: {
        fecha_creacion: "desc",
      },
    });

    const ArrFormattedBlogsBlo: adminBlogListResponse[] = ArrDbBlogsBlo.map((ObjRowBlo) => {
      const StrDateBlo = ObjRowBlo.fecha_creacion
        ? new Date(ObjRowBlo.fecha_creacion).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric"
          })
        : "fecha desconocida";

      const StrRawState = ObjRowBlo.estado ? String(ObjRowBlo.estado).toUpperCase() : "";
      
      const StrStateValueBlo = Object.values(blogState).includes(StrRawState as blogState)
        ? (StrRawState as blogState)
        : blogState.NOPUBLICADO;
      const StrFullName = ObjRowBlo.Usuario 
        ? `${ObjRowBlo.Usuario.nombres || ''} ${ObjRowBlo.Usuario.apellidos || ''}`.trim() 
        : "Equipo PropBol";

      // calculamos el tiempo de lectura desde el contenido
      const StrCleanContentBlo = ObjRowBlo.contenido 
        ? String(ObjRowBlo.contenido).replace(/<[^>]*>?/gm, '') 
        : '';
      const IntWordCountBlo = StrCleanContentBlo.trim().split(/\s+/).filter(word => word.length > 0).length;
      const IntReadTimeBlo = Math.max(1, Math.ceil(IntWordCountBlo / 200));

      return {
        IntIdBlo: ObjRowBlo.id_blog,
        StrTitleBlo: ObjRowBlo.titulo || "Sin título",
        StrStateBlo: StrStateValueBlo,
        StrAuthorNameBlo: StrFullName || "Anónimo",
        StrDescriptionBlo: ObjRowBlo.descripcion || "Sin descripción",
        StrImageUrlBlo: ObjRowBlo.imagen_url || "",
        StrDateBlo: StrDateBlo,
        BolIsDeletedBlo: ObjRowBlo.deleted_at !== null,
        ObjAuthorBlo: {
          name: StrFullName || "Anónimo",
          avatar: ObjRowBlo.Usuario?.url_foto_perfil || undefined
        },
        StrReadTimeBlo: `${IntReadTimeBlo} min`,
      };
    });

    return NextResponse.json(ArrFormattedBlogsBlo);
  } catch (ObjErrorBlo) {
    console.error("[ADMIN_BLOGS_GET_ERROR]", ObjErrorBlo);
    return NextResponse.json(
      { error: "Error interno al obtener lista administrativa" }, 
      { status: 500 }
    );
  }
}