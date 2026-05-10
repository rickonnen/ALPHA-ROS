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
        include: {
          Imagen: { take: 1 },
          TipoInmueble: true,
          TipoOperacion: true,
          Ubicacion: true,
        },
      }),
      prisma.publicacion.count({ where: { id_usuario } }),
    ]);

    const data = publicaciones.map((pub) => ({
      id: String(pub.id_publicacion),
      titulo: pub.titulo ?? "Sin título",
      tipo: pub.TipoInmueble?.nombre_inmueble ?? "Sin tipo",
      tipoOperacion: pub.TipoOperacion?.nombre_operacion ?? null,
      imagen: pub.Imagen[0]?.url_imagen ?? null,
      precio: pub.precio ?? null,
      superficie: pub.superficie ?? null,
      habitaciones: pub.habitaciones ?? null,
      banos: pub.banos ?? null,
      //zona: pub.Ubicacion?.zona ?? null,
      direccion: pub.Ubicacion?.direccion ?? null,
      id_estado: pub.id_estado,
      gratuito: pub.gratuito,
      fechaPublicacion: pub.fecha_creacion
        ? new Date(pub.fecha_creacion).toLocaleDateString("es-BO", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "Reciente",
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