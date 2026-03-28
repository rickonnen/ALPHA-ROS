/*  Dev: David Chavez Totora - xdev/davidc
    Fecha: 28/03/2026
    Funcionalidad: GET /backend/perfil/getFavoritos?id_usuario=...
      - Retorna las publicaciones marcadas como favoritas por el usuario
      - Incluye: título, zona, tipo de inmueble, primera imagen
*/

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id_usuario = searchParams.get("id_usuario");

  if (!id_usuario) {
    return NextResponse.json(
      { error: "Falta el parámetro id_usuario" },
      { status: 400 }
    );
  }

  try {
    const favoritos = await prisma.favorito.findMany({
      where: { id_usuario },
      orderBy: { fecha_add: "desc" },
      include: {
        Publicacion: {
          include: {
            Imagen: { take: 1 },
            Zona: true,
            TipoInmueble: true,
          },
        },
      },
    });

    const data = favoritos.map((fav) => ({
      id: String(fav.Publicacion.id_publicacion),
      titulo: fav.Publicacion.titulo ?? "Sin título",
      zona: fav.Publicacion.Zona?.nombre_zona ?? "Sin zona",
      tipo: fav.Publicacion.TipoInmueble?.nombre_inmueble ?? "Sin tipo",
      imagen: fav.Publicacion.Imagen[0]?.url_imagen ?? null,
      fecha_add: fav.fecha_add,
    }));

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}