import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Obtiene suscripciones que vencen en exactamente 7 días
 * y no han sido notificadas (notificado_7d = false)
 */
export async function POST(req: NextRequest) {
  try {
    const hoy = new Date();
    
    // Calcular fecha de vencimiento en 7 días
    const fechaDestino = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Rango del día: 00:00 a 23:59 del día 7
    const inicio = new Date(
      fechaDestino.getFullYear(),
      fechaDestino.getMonth(),
      fechaDestino.getDate(),
      0,
      0,
      0,
      0
    );
    const fin = new Date(inicio.getTime() + 24 * 60 * 60 * 1000);

    const suscripciones = await prisma.suscripcion.findMany({
      where: {
        fecha_fin: {
          gte: inicio,
          lt: fin,
        },
        notificado_7d: false, // Evitar duplicados
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

    console.log(
      `[RECORDATORIOS] Suscripciones a recordar (7 días): ${suscripciones.length}`
    );

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
    console.error("[ERROR] obtener-7-dias:", error);
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
