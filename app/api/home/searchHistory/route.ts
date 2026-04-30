import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 18/04/2026
 * funcionalidad: recupera el historial completo de la BD para el usuario autenticado
 */
export async function GET(req: Request) {
  try {
    const id_usuario = "fbea52b7-78c7-44a2-a3c7-703f52010a2d"; 

    if (!id_usuario) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

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
 * funcionalidad: guarda una nueva búsqueda o actualiza la fecha si ya existe (Upsert)
 */
export async function POST(req: Request) {
  try {
    const id_usuario = "fbea52b7-78c7-44a2-a3c7-703f52010a2d";
    const objData = await req.json();

    if (!id_usuario) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // El superpoderoso UPSERT
    await prisma.historialBusqueda.upsert({
      where: {
        id_usuario_mapbox_id: {
          id_usuario: id_usuario,
          mapbox_id: objData.strId,
        },
      },
      update: {
        // SI EXISTE: Actualiza la fecha a la hora exacta en que se hace la petición
        created_at: new Date(),
        name: objData.strName,
        full_name: objData.strFullName,
        icon_url: objData.strIcon,
        place_type: objData.strTypePlace,
      },
      create: {
        // SI NO EXISTE: Crea el registro nuevo
        id_usuario,
        mapbox_id: objData.strId,
        name: objData.strName,
        full_name: objData.strFullName,
        icon_url: objData.strIcon,
        place_type: objData.strTypePlace,
        created_at: new Date(),
      },
    });

    // Retorna el historial ya ordenado con la nueva fecha de primera
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