/*  Dev: Luis - xdev/sow-luisc
    Fecha: 29/03/2026
    Funcionalidad: GET /backend/perfil/historial?id_usuario
      - Retorna las publicaciones vistas por el usuario
      - Incluye: título, precio, moneda, tipo operación, primera imagen
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
    const historial = await prisma.historialVistos.findMany({
      where: { id_usuario },
      orderBy: { fecha: "desc" },
      include: {
        Publicacion: {
          include: {
            Imagen:        { take: 1 },
            Moneda:        true,
            TipoOperacion: true,
          },
        },
      },
    });

    const data = historial.map((item) => ({
      id_publicacion: item.Publicacion.id_publicacion,
      fecha:          item.fecha,
      Publicacion: {
        titulo:        item.Publicacion.titulo ?? "Sin título",
        precio:        item.Publicacion.precio ?? null,
        Moneda:        item.Publicacion.Moneda
                         ? { simbolo: item.Publicacion.Moneda.simbolo }
                         : null,
        TipoOperacion: item.Publicacion.TipoOperacion
                         ? { nombre_operacion: item.Publicacion.TipoOperacion.nombre_operacion }
                         : null,
        Imagen:        item.Publicacion.Imagen.map((img) => ({
                         url_imagen: img.url_imagen,
                       })),
      },
    }));

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error al obtener historial:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id_usuario     = searchParams.get("id_usuario");
  const id_publicacion = searchParams.get("id_publicacion");

  if (!id_usuario || !id_publicacion) {
    return NextResponse.json(
      { error: "Faltan parámetros: id_usuario o id_publicacion" },
      { status: 400 }
    );
  }

  try {
    await prisma.historialVistos.delete({
      where: {
        id_usuario_id_publicacion: {
          id_usuario,
          id_publicacion: Number(id_publicacion),
        },
      },
    });

    return NextResponse.json(
      { message: "Publicación eliminada del historial" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar del historial:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}