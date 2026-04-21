import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const ahora = new Date();
    const hace48h = new Date(ahora.getTime() - 48 * 60 * 60 * 1000);
    const hace24h = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);

    const suscripciones = await prisma.suscripcion.findMany({
      where: {
        fecha_fin: {
          gte: hace48h,
          lt: hace24h,
        },
        notificado_48h: false,
      },
      include: {
        Usuario: {
          select: {
            id_usuario: true,
            email: true,
            nombre: true,
          },
        },
        PlanPublicacion: {
          select: {
            id_plan: true,
            nombre_plan: true,
            precio_plan: true,
          },
        },
      },
    });

    console.log(`[RECORDATORIOS] Encontradas ${suscripciones.length} suscripciones (48h)`);

    return NextResponse.json(
      {
        ok: true,
        data: suscripciones,
        cantidad: suscripciones.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ERROR] obtener-48h:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Error al obtener suscripciones",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
