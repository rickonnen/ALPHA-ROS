import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificamos que la sesión exista
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado. El servidor no detectó tu sesión (401)." },
        { status: 401 }
      );
    }

    const strUserIdFromSession = session.user.id;
    
    // LECTURA DEL BODY
    const objBody = await request.json();
    const { StrTitleBlo, StrDescriptionBlo, StrImageUrlBlo, StrContentBlo } = objBody;

    // VALIDACIONES (Ajustadas a 128 para coincidir con tu BD @db.VarChar(128))
    if (!StrTitleBlo || StrTitleBlo.length > 128) {
      return NextResponse.json({ error: "Título inválido o excede 128 caracteres." }, { status: 400 });
    }
    if (!StrDescriptionBlo || StrDescriptionBlo.length > 128) {
      return NextResponse.json({ error: "Descripción excede 128 caracteres." }, { status: 400 });
    }
    if (!StrImageUrlBlo || StrImageUrlBlo.length > 128) {
      return NextResponse.json({ error: "URL de imagen excede 128 caracteres." }, { status: 400 });
    }
    if (!StrContentBlo) {
      return NextResponse.json({ error: "El contenido no puede estar vacío." }, { status: 400 });
    }

    // INSERCIÓN EN BASE DE DATOS
    const objNewBlog = await prisma.blogs.create({
      data: {
        id_user: strUserIdFromSession,
        titulo: StrTitleBlo,
        descripcion: StrDescriptionBlo,
        imagen_url: StrImageUrlBlo,
        contenido: StrContentBlo,
        estado: "PUBLICADO", // Enviamos el string directo para evitar errores de Types
        // No es necesario mandar fecha_creacion, en tu BD tiene @default(now())
      },
    });

    return NextResponse.json({
      success: true,
      message: "¡Blog publicado correctamente en la base de datos!",
      data: { IntIdBlo: objNewBlog.id_blog }
    });

  } catch (objError: any) {
    console.error("[CREATE_BLOG_ERROR]", objError);
    // Devolvemos el error REAL al frontend para saber qué pasó
    return NextResponse.json(
      { error: `Error del Servidor: ${objError.message || 'Fallo en BD'}` },
      { status: 500 }
    );
  }
}