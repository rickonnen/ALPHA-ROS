import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 18/04/2026
 * funcionalidad: recupera el historial completo de la BD para el usuario autenticado
 */
export const dynamic = 'force-dynamic';

async function getUserIdFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    if (!authToken) {
      return null;
    }

    // Descifra el token
    const decoded = verify(authToken, process.env.JWT_SECRET!) as {
      userId: string;
    };

    return decoded?.userId || null;
  } catch (error) {
    console.error("[AUTH_ERROR] Error al descifrar token en historial:", error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const id_usuario = await getUserIdFromCookies();

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
  } catch (error: any) {
    console.error("[HISTORIAL_GET_ERROR]", error.message || error);
    return NextResponse.json({ error: "Error al obtener historial" }, { status: 500 });
  }
}

// funcionalidad: guarda una nueva búsqueda o actualiza la fecha si ya existe (Upsert)
export async function POST(request: Request) {
  try {
    const id_usuario = await getUserIdFromCookies();
    const objData = await request.json();

    if (!id_usuario) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

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
    return GET(request);
  } catch (error: any) {
    console.error("[HISTORIAL_POST_ERROR] Código Prisma:", error.code);
    return NextResponse.json({ error: "Error al guardar historial", detalle: error.message }, { status: 500 });
  }
}

// funcionalidad: elimina una búsqueda específica del historial
export async function DELETE(request: Request) {
  try {
    const id_usuario = await getUserIdFromCookies();
    const { searchParams } = new URL(request.url);
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

    return GET(request);
  } catch (error: any) {
    console.error("[HISTORIAL_DELETE_ERROR]", error.message || error);
    return NextResponse.json({ error: "Error al eliminar historial" }, { status: 500 });
  }
}