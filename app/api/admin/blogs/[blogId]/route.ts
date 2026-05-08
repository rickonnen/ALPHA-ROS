import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogState } from "@/types/blogType";

interface updateActionRequest {
  action: string;
}
/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 25/04/2026
 * funcionalidad: recupera un blog específico con toda su información para el panel de administración
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const ResolvedParamsBlo = await params;
    const IntIdBlo = parseInt(ResolvedParamsBlo.blogId);

    if (isNaN(IntIdBlo)) {
      return NextResponse.json({ error: "id invalido" }, { status: 400 });
    }

    // Buscamos el blog por ID incluyendo el nombre del autor
    const ObjDbBlogBlo = await prisma.blogs.findUnique({
      where: { id_blog: IntIdBlo },
      include: {
        Usuario: {
          select: { nombres: true } 
        }
      }
    });

    if (!ObjDbBlogBlo) {
      return NextResponse.json({ error: "blog no encontrado" }, { status: 404 });
    }

    // Formateamos la fecha
    const StrDateBlo = ObjDbBlogBlo.fecha_creacion
      ? new Date(ObjDbBlogBlo.fecha_creacion).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric"
        })
      : "fecha desconocida";

    // Validamos el estado
    const StrRawState = ObjDbBlogBlo.estado ? String(ObjDbBlogBlo.estado).toUpperCase() : "";
    const StrStateValueBlo = Object.values(blogState).includes(StrRawState as blogState)
      ? (StrRawState as blogState)
      : blogState.NOPUBLICADO;

    const ObjFormattedBlogBlo = {
      IntIdBlo: ObjDbBlogBlo.id_blog,
      StrTitleBlo: ObjDbBlogBlo.titulo || "Sin título",
      StrDescriptionBlo: ObjDbBlogBlo.descripcion || "Sin descripción",
      StrContentBlo: ObjDbBlogBlo.contenido || "No hay contenido para mostrar.",
      StrImageUrlBlo: ObjDbBlogBlo.imagen_url || "",
      StrDateBlo: StrDateBlo,
      StrAuthorBlo: ObjDbBlogBlo.Usuario?.nombres || "Anónimo",
      StrStateBlo: StrStateValueBlo,
      BolIsDeletedBlo: ObjDbBlogBlo.deleted_at !== null,
    };

    return NextResponse.json(ObjFormattedBlogBlo);

  } catch (ObjErrorBlo) {
    console.error("[ADMIN_SINGLE_BLOG_GET_ERROR]", ObjErrorBlo);
    return NextResponse.json({ error: "error al obtener el blog" }, { status: 500 });
  }
}

// funcionalidad: permite al administrador cambiar el estado de un blog o aplicar soft-delete
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

    const ObjBodyBlo: updateActionRequest = await request.json();
    const { action } = ObjBodyBlo;

    let ObjUpdateDataBlo: any = {};

    switch (action) {
      case "ACEPTAR":
      case "PUBLICAR":
        ObjUpdateDataBlo = { 
          estado: blogState.PUBLICADO,
          deleted_at: null, // Restauramos si estaba en soft-delete
          fecha_publicacion: new Date()
        };
        break;
      case "RECHAZAR":
        ObjUpdateDataBlo = { 
          estado: blogState.RECHAZADO,
          deleted_at: null
        };
        break;
      case "ELIMINAR":
        ObjUpdateDataBlo = { 
          estado: blogState.NOVISIBLE,
          deleted_at: new Date()
        };
        break;
      default:
        return NextResponse.json({ error: "acción no permitida" }, { status: 400 });
    }

    const ObjUpdatedBlogBlo = await prisma.blogs.update({
      where: { id_blog: IntIdBlo },
      data: ObjUpdateDataBlo,
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

// funcionalidad: elimina un blog de la base de datos permanentemente
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const ResolvedParamsBlo = await params;
    const IntIdBlo = parseInt(ResolvedParamsBlo.blogId);

    if (isNaN(IntIdBlo)) {
      return NextResponse.json({ error: "id invalido" }, { status: 400 });
    }

    // Borrado duro (Hard Delete)
    await prisma.blogs.delete({
      where: { id_blog: IntIdBlo },
    });

    return NextResponse.json({ success: true, message: "blog eliminado permanentemente" });
  } catch (ObjErrorBlo) {
    console.error("[ADMIN_BLOG_DELETE_ERROR]", ObjErrorBlo);
    return NextResponse.json({ error: "error al eliminar blog permanentemente" }, { status: 500 });
  }
}