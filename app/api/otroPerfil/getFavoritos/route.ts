import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id_usuario = searchParams.get("id_usuario");

  if (!id_usuario)
    return NextResponse.json({ error: "Falta id_usuario" }, { status: 400 });

  // Verificar que el usuario tiene favoritos públicos
  const priv = await prisma.privacidad.findUnique({ where: { id_usuario } });
  if (!priv?.favorito)
    return NextResponse.json({ error: "Favoritos privados" }, { status: 403 });

  try {
    const favoritos = await prisma.favorito.findMany({
      where: { id_usuario },
      orderBy: { fecha_add: "desc" },
      include: {
        Publicacion: {
          include: {
            Imagen: { take: 1 },
            TipoInmueble: true,
            TipoOperacion: true,
            Ubicacion: true,
          },
        },
      },
    });

    const data = favoritos.map((fav) => ({
      id: String(fav.Publicacion.id_publicacion),
      titulo: fav.Publicacion.titulo ?? "Sin título",
      tipo: fav.Publicacion.TipoInmueble?.nombre_inmueble ?? "Sin tipo",
      tipo_operacion: fav.Publicacion.TipoOperacion?.nombre_operacion ?? "",
      imagen: fav.Publicacion.Imagen[0]?.url_imagen ?? null,
      precio: fav.Publicacion.precio ?? null,
      superficie: fav.Publicacion.superficie ?? null,
      habitaciones: fav.Publicacion.habitaciones ?? null,
      banos: fav.Publicacion.banos ?? null,
      direccion: fav.Publicacion.Ubicacion?.direccion ?? null,
      fechaPublicacion: fav.Publicacion.fecha_creacion
        ? new Date(fav.Publicacion.fecha_creacion).toLocaleDateString("es-BO", {
            day: "2-digit", month: "short", year: "numeric",
          })
        : "Reciente",
    }));

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}