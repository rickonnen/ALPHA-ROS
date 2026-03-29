/*  Dev: Candy Camila Ordoñez Pinto
    Fecha: 27/03/2026
    Funcionalidad: GET /backend/perfil/misPublicaciones
      - Retorna las publicaciones del usuario autenticado
      - @param {id_usuario} - ID del usuario
*/
/*  Dev: Candy Camila Ordoñez Pinto
    Fecha: 28/03/2026
    Funcionalidad: Paginación en GET misPublicaciones
      - Agrega soporte para parámetros page y limit en el GET
      - @param {page} - número de página (default: 1)
      - @param {limit} - cantidad de items por página (default: 10)
      - @return {data, total, page, limit} - lista paginada + metadatos
*/
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id_usuario = searchParams.get("id_usuario");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.max(1, parseInt(searchParams.get("limit") ?? "10"));
  const skip = (page - 1) * limit;

  if (!id_usuario) {
    return NextResponse.json(
      { error: "Falta el parámetro id_usuario" },
      { status: 400 },
    );
  }

  try {
    const [publicaciones, total] = await prisma.$transaction([
      prisma.publicacion.findMany({
        where: { id_usuario },
        skip,
        take: limit,
        orderBy: { id_publicacion: "desc" },
        select: {
          id_publicacion: true,
          titulo: true,
          Ubicacion: { select: { zona: true } },
          TipoOperacion: { select: { nombre_operacion: true } },
          Imagen: { select: { url_imagen: true }, take: 1 },
        },
      }),
      prisma.publicacion.count({ where: { id_usuario } }),
    ]);

    const data = publicaciones.map((pub: any) => ({
      id: String(pub.id_publicacion),
      titulo: pub.titulo,
      zona: pub.Ubicacion?.zona ?? "Sin zona",
      tipo: pub.TipoOperacion?.nombre_operacion ?? "Sin tipo",
      imagen: pub.Imagen?.[0]?.url_imagen ?? null,
    }));

    return NextResponse.json({ data, total, page, limit }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener publicaciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
