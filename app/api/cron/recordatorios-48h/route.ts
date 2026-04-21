import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const cronSecret = req.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || cronSecret !== expectedSecret) {
      console.warn("[CRON] Acceso denegado: secret inválido");
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("[CRON] Iniciando: Recordatorios 48h");
    const respObtener = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/recordatorios/obtener-48h`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!respObtener.ok) {
      throw new Error("No se pudo obtener suscripciones");
    }

    const dataObtener = await respObtener.json();
    const suscripciones = dataObtener.data || [];

    const resultados = {
      procesadas: 0,
      actualizadas: 0,
      errores: 0,
      detalles: [] as Array<{
        id_suscripcion: string;
        email: string;
        estado: "OK" | "ERROR";
        mensaje?: string;
      }>,
    };

    // Procesar cada suscripción
    for (const suscripcion of suscripciones) {
      resultados.procesadas++;

      try {
        await prisma.suscripcion.update({
          where: { id_suscripcion: suscripcion.id_suscripcion },
          data: { notificado_48h: true },
        });

        resultados.actualizadas++;
        resultados.detalles.push({
          id_suscripcion: suscripcion.id_suscripcion,
          email: suscripcion.Usuario.email,
          estado: "OK",
          mensaje: "Suscripción marcada como notificada",
        });

        console.log(
          `[CRON] ✓ Suscripción ${suscripcion.id_suscripcion} procesada`
        );
      } catch (error) {
        resultados.errores++;
        resultados.detalles.push({
          id_suscripcion: suscripcion.id_suscripcion,
          email: suscripcion.Usuario.email,
          estado: "ERROR",
          mensaje: error instanceof Error ? error.message : "Error desconocido",
        });

        console.error(
          `[CRON] ✗ Error procesando ${suscripcion.id_suscripcion}:`,
          error
        );
      }
    }

    console.log(
      `[CRON] Completado: ${resultados.actualizadas}/${resultados.procesadas} exitosas`
    );

    return NextResponse.json(
      {
        ok: true,
        mensaje: "Recordatorios 48h procesados",
        timestamp: new Date().toISOString(),
        resultados,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[CRON ERROR] recordatorios-48h:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Error procesando recordatorios",
        mensaje: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
