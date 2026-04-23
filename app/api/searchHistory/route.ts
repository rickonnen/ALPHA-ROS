import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 18/04/2026
 * funcionalidad: recupera el historial completo de la BD para el usuario autenticado
 */
export async function GET(req: Request) {
  try {
    // ID extraído de tus logs de sesión activa
    const id_usuario = "fbea52b7-78c7-44a2-a3c7-703f52010a2d"; 

    if (!id_usuario) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Acceso correcto al modelo generado por Prisma
    const arrDbHistory = await prisma.historialBusqueda.findMany({
      where: { id_usuario },
      orderBy: { created_at: "desc" },
    });

    const arrFormattedHistory = arrDbHistory.map((objRow) => ({
      strId: objRow.mapbox_id || "",
      strName: objRow.name || "",
      strFullName: objRow.full_name || "",
      strIcon: objRow.icon_url || "",
      strTypePlace: objRow.place_type || "",
    }));

    return NextResponse.json(arrFormattedHistory);
  } catch (error) {
    console.error("[HISTORIAL_GET_ERROR]", error);
    return NextResponse.json({ error: "Error al obtener historial" }, { status: 500 });
  }
}

/**
 * funcionalidad: guarda una nueva búsqueda eliminando duplicados previos
 */
export async function POST(req: Request) {
  try {
    const id_usuario = "fbea52b7-78c7-44a2-a3c7-703f52010a2d";
    const objData = await req.json();

    if (!id_usuario) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 1. Eliminamos el registro previo de esta misma ciudad para evitar duplicados
    await prisma.historialBusqueda.deleteMany({
      where: {
        id_usuario,
        mapbox_id: objData.strId,
      },
    });

    // 2. Insertamos la nueva búsqueda
    await prisma.historialBusqueda.create({
      data: {
        id_usuario,
        mapbox_id: objData.strId,
        name: objData.strName,
        full_name: objData.strFullName,
        icon_url: objData.strIcon,
        place_type: objData.strTypePlace,
      },
    });

    return GET(req);
  } catch (error) {
    console.error("[HISTORIAL_POST_ERROR]", error);
    return NextResponse.json({ error: "Error al guardar historial" }, { status: 500 });
  }
}

/**
 * funcionalidad: elimina una búsqueda específica del historial
 */
export async function DELETE(req: Request) {
  try {
    const id_usuario = "fbea52b7-78c7-44a2-a3c7-703f52010a2d";
    const { searchParams } = new URL(req.url);
    const strId = searchParams.get("strId");

    if (!strId || !id_usuario) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    await prisma.historialBusqueda.deleteMany({
      where: {
        id_usuario,
        mapbox_id: strId,
      },
    });

    return GET(req);
  } catch (error) {
    console.error("[HISTORIAL_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Error al eliminar historial" }, { status: 500 });
  }
}