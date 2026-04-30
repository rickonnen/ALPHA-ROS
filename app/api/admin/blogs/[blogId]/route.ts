import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogState } from "@/types/blogType";

interface updateStateRequest {
  StrNewStateBlo: blogState;
}
/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 25/04/2026
 * funcionalidad: permite al administrador cambiar el estado de un blog (Aceptar/Rechazar)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const ResolvedParamsBlo = await params;
    const IntIdBlo = parseInt(ResolvedParamsBlo.blogId);

    if (isNaN(IntIdBlo)) {
      return NextResponse.json({ error: "id invalido" }, { status: 400 });
    }

    const ObjBodyBlo: updateStateRequest = await request.json();
    const { StrNewStateBlo } = ObjBodyBlo;

    // validacion estricta usando los valores del enum directamente
    const ArrValidStatesBlo = Object.values(blogState);
    if (!ArrValidStatesBlo.includes(StrNewStateBlo)) {
      return NextResponse.json({ error: "estado no permitido" }, { status: 400 });
    }

    const ObjUpdatedBlogBlo = await prisma.blogs.update({
      where: { id_blog: IntIdBlo },
      data: {
        estado: StrNewStateBlo,
        // si se publica, actualizamos la fecha de publicacion automaticamente
        fecha_publicacion: StrNewStateBlo === blogState.PUBLICADO ? new Date() : undefined
      },
    });

    return NextResponse.json({ 
      success: true, 
      StrCurrentStateBlo: ObjUpdatedBlogBlo.estado 
    });
  } catch (ObjErrorBlo) {
    console.error("[ADMIN_BLOG_PATCH_ERROR]", ObjErrorBlo);
    return NextResponse.json({ error: "error al actualizar blog" }, { status: 500 });
  }
}