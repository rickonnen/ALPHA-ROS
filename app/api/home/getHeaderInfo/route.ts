import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
/**
 * Dev: Rodrigo Saul Zarate Villarroel       Fecha: 15/05/2026
 * funcionalidad: obtiene la información básica del usuario (nombres y foto) 
 * unificada para el header y menú móvil en una sola petición.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const strIdUsuario = searchParams.get("id_usuario");

    if (!strIdUsuario) {
      return NextResponse.json({ error: "id_usuario es requerido" }, { status: 400 });
    }

    const ObjDbUser = await prisma.usuario.findUnique({
      where: { id_usuario: strIdUsuario },
      select: {
        nombres: true,
        apellidos: true,
        username: true,
        url_foto_perfil: true,
      }
    });

    if (!ObjDbUser) {
      return NextResponse.json({ error: "usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        nombres: ObjDbUser.nombres,
        apellidos: ObjDbUser.apellidos,
        username: ObjDbUser.username,
        url_foto_perfil: ObjDbUser.url_foto_perfil
      }
    });
  } catch (ObjError) {
    console.error("[HEADER_INFO_GET_ERROR]", ObjError);
    return NextResponse.json({ error: "error al obtener la información del usuario" }, { status: 500 });
  }
}