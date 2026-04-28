import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogState } from "@/types/blogType";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    // Verificamos que la sesión exista y que el ID del usuario esté presente
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado. Sesión inválida o expirada." },
        { status: 401 }
      );
    }

    const strUserIdFromSession = session.user.id;
    // LECTURA DEL BODY Y VALIDACIONES
    const objBody = await request.json();
    const { StrTitleBlo, StrDescriptionBlo, StrImageUrlBlo, StrContentBlo } = objBody;

    if (!StrTitleBlo || StrTitleBlo.length > 100) return NextResponse.json({ error: "Título inválido o excede 100 caracteres." }, { status: 400 });
    if (!StrDescriptionBlo || StrDescriptionBlo.length > 120) return NextResponse.json({ error: "Descripción excede 120 caracteres." }, { status: 400 });
    if (!StrImageUrlBlo || StrImageUrlBlo.length > 120) return NextResponse.json({ error: "URL de imagen excede 120 caracteres." }, { status: 400 });
    if (!StrContentBlo || StrContentBlo.length > 400) return NextResponse.json({ error: "Contenido excede 400 caracteres." }, { status: 400 });

    // INSERCIÓN EN BASE DE DATOS
    const objNewBlog = await prisma.blogs.create({
      data: {
        id_user: strUserIdFromSession,
        titulo: StrTitleBlo,
        descripcion: StrDescriptionBlo,
        imagen_url: StrImageUrlBlo,
        contenido: StrContentBlo,
        // este es solo para probar despues lo descomentas cuando verifiques que todo funcione
        estado: blogState.PUBLICADO,
        //estado: blogState.NOPUBLICADO,
        fecha_creacion: new Date(),
        // fecha de publicaion despues se quitara
        fecha_publicacion: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Borrador de blog creado correctamente.",
      data: { IntIdBlo: objNewBlog.id_blog }
    });

  } catch (objError) {
    console.error("[CREATE_BLOG_ERROR]", objError);
    return NextResponse.json(
      { error: "Error interno al procesar la solicitud." },
      { status: 500 }
    );
  }
}