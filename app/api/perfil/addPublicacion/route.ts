/*  Dev: Candy Camila Ordoñez Pinto
    Fecha: 03/04/2026
    Funcionalidad: POST /backend/perfil/addPublicacion
      - Crea una nueva publicación para el usuario autenticado
      - Body (JSON): { id_usuario, titulo, id_tipo_inmueble, imagenes[] }
*/

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_usuario, titulo, id_tipo_inmueble, imagenes } = body;

    if (!id_usuario || !titulo || !id_tipo_inmueble) {
      return NextResponse.json(
        { error: "Faltan campos: id_usuario, titulo o id_tipo_inmueble" },
        { status: 400 }
      );
    }

    const publicacion = await prisma.publicacion.create({
      data: {
        id_usuario,
        titulo,
        id_tipo_inmueble: Number(id_tipo_inmueble),
        Imagen: {
          create: Array.isArray(imagenes)
            ? imagenes.map((url: string) => ({ url_imagen: url }))
            : [],
        },
      },
      include: {
        TipoInmueble: true,
        Imagen: true,
      },
    });

    return NextResponse.json(
      { message: "Publicación creada exitosamente", data: publicacion },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.code === "P2003") {
      return NextResponse.json(
        { error: "El id_tipo_inmueble no existe" },
        { status: 404 }
      );
    }
    console.error("Error al crear publicación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}