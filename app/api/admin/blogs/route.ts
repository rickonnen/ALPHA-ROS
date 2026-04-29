import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminBlogListResponse } from "@/types/blogType";
/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 25/04/2026
 * funcionalidad: recupera todos los blogs sin filtros de estado o borrado para gestion admin
 * @return {NextResponse} lista completa de blogs con metadata de borrado
 */
export async function GET() {
  try {
    // deleted_at para el admin
    const ArrDbBlogsBlo = await prisma.blogs.findMany({
      include: {
        Usuario: {
          select: { nombres: true } 
        }
      },
      orderBy: {
        fecha_creacion: "desc",
      },
    });

    const ArrFormattedBlogsBlo: adminBlogListResponse[] = ArrDbBlogsBlo.map((ObjRowBlo) => {
      const StrDateBlo = ObjRowBlo.fecha_creacion
        ? new Date(ObjRowBlo.fecha_creacion).toLocaleDateString("es-ES")
        : "sin fecha";

      return {
        IntIdBlo: ObjRowBlo.id_blog,
        StrTitleBlo: ObjRowBlo.titulo,
        StrStateBlo: ObjRowBlo.estado,
        StrAuthorNameBlo: ObjRowBlo.Usuario?.nombres || "Anónimo",
        StrDateBlo: StrDateBlo,
        BolIsDeletedBlo: ObjRowBlo.deleted_at !== null,
      };
    });

    return NextResponse.json(ArrFormattedBlogsBlo);
  } catch (ObjErrorBlo) {
    console.error("[ADMIN_BLOGS_GET_ERROR]", ObjErrorBlo);
    return NextResponse.json({ error: "error al obtener lista administrativa" }, { status: 500 });
  }
}