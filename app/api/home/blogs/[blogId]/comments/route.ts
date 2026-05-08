import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 05/05/2026
 * funcionalidad: gestiona la recuperación de hilos de comentarios y la creación optimista 
 * con lógica de aplanamiento estilo TikTok.
 */
async function getUserIdFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;
    if (!authToken) return null;
    const decoded = verify(authToken, process.env.JWT_SECRET!) as { userId: string };
    return decoded?.userId || null;
  } catch (error) {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const currentUserId = await getUserIdFromCookies();
    const ResolvedParams = await params;
    const IntBlogId = parseInt(ResolvedParams.blogId);

    if (isNaN(IntBlogId)) return NextResponse.json({ error: "id invalido" }, { status: 400 });

    const { searchParams } = new URL(request.url);
    const StrSort = searchParams.get("sort") || "reciente";
    const strParentId = searchParams.get("parentId");
    const IntParentId = strParentId ? parseInt(strParentId) : null;

    let ObjOrderBy: any = StrSort === "relevante" 
      ? [{ LikesComentarios: { _count: "desc" } }, { fecha_creacion: "desc" }]
      : { fecha_creacion: StrSort === "antiguo" ? "asc" : "desc" };

    const ArrDbComments = await prisma.comentariosBlog.findMany({
      where: { id_blog: IntBlogId, id_padre: IntParentId, deleted_at: null },
      orderBy: ObjOrderBy,
      select: {
        id_comentario: true,
        id_usuario: true,
        contenido: true,
        fecha_creacion: true,
        Usuario: { select: { nombres: true, apellidos: true, url_foto_perfil: true } },
        ComentariosBlog: { select: { Usuario: { select: { nombres: true } } } },
        _count: { select: { LikesComentarios: true, other_ComentariosBlog: { where: { deleted_at: null } } } },
        LikesComentarios: currentUserId ? { where: { id_usuario: currentUserId } } : false,
      }
    });

    const ArrFormattedComments = ArrDbComments.map((com) => ({
      IntIdCom: com.id_comentario,
      StrContentCom: com.contenido,
      StrDateCom: com.fecha_creacion ? new Date(com.fecha_creacion).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "Hoy",
      ObjAuthorCom: { 
        name: `${com.Usuario?.nombres || ''} ${com.Usuario?.apellidos || ''}`.trim(), 
        avatar: com.Usuario?.url_foto_perfil 
      },
      IntLikesCount: com._count.LikesComentarios, 
      IntRepliesCount: com._count.other_ComentariosBlog, 
      StrRepliedToName: com.ComentariosBlog?.Usuario?.nombres,
      BolIsOwner: currentUserId === com.id_usuario,
      BolCurrentUserLiked: currentUserId && com.LikesComentarios && com.LikesComentarios.length > 0 ? true : false
    }));

    return NextResponse.json(ArrFormattedComments);
  } catch (error) {
    return NextResponse.json({ error: "error al obtener comentarios" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const id_usuario = await getUserIdFromCookies();
    if (!id_usuario) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { blogId } = await params;
    const { contenido, id_padre } = await request.json();
    const destino = id_padre ? await prisma.comentariosBlog.findUnique({ where: { id_comentario: id_padre } }) : null;
    const idPadreReal = (destino && destino.id_padre) ? destino.id_padre : id_padre;

    const nuevo = await prisma.comentariosBlog.create({
      data: { id_blog: parseInt(blogId), id_usuario, contenido, id_padre: idPadreReal || null }
    });

    const created = await prisma.comentariosBlog.findUnique({
      where: { id_comentario: nuevo.id_comentario },
      select: {
        id_comentario: true, id_usuario: true, contenido: true, fecha_creacion: true,
        Usuario: { select: { nombres: true, apellidos: true, url_foto_perfil: true } },
        ComentariosBlog: { select: { Usuario: { select: { nombres: true } } } },
        _count: { select: { LikesComentarios: true, other_ComentariosBlog: { where: { deleted_at: null } } } }
      }
    });

    if (!created) throw new Error("Error al recuperar");

    return NextResponse.json({
      IntIdCom: created.id_comentario,
      StrContentCom: created.contenido,
      StrDateCom: "Ahora",
      ObjAuthorCom: { name: created.Usuario?.nombres, avatar: created.Usuario?.url_foto_perfil },
      IntLikesCount: 0, IntRepliesCount: 0,
      StrRepliedToName: created.ComentariosBlog?.Usuario?.nombres,
      BolIsOwner: true, BolCurrentUserLiked: false
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "error al crear" }, { status: 500 });
  }
}