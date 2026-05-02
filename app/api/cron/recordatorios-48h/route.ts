import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarNotificacionDeGrupo } from "@/lib/email/emailService";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    /*
    const cronSecret = req.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || cronSecret !== expectedSecret) {
      console.warn("[CRON] Acceso denegado: secret inválido");
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
      */

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
        const id_notificacion = uuidv4();
        const titulo = "Plan vencido";
        const mensaje = "Su plan ya venció, regularice su pago";

        // Crear registro en tabla Notificacion
        await prisma.notificacion.create({
          data: {
            id_notificacion,
            titulo,
            mensaje,
            id_usuario: suscripcion.id_usuario,
            id_publicacion: 1,
            id_categoria: 2, // ID fijo para notificaciones de pagos
            email_enviado: false,
            estado_envio: "pendiente",
          },
        });

        console.log(
          `[CRON] Notificación creada: ${id_notificacion}`
        );

        // Enviar correo
        const resultadoEmail = await enviarNotificacionDeGrupo(
          suscripcion.Usuario.email,
          suscripcion.Usuario.nombre,
          titulo,
          mensaje,
          "Cobros",
          id_notificacion
        );

        // Actualizar suscripción solo si el email se envió exitosamente
        if (resultadoEmail.success) {
          await prisma.suscripcion.update({
            where: { id_suscripcion: suscripcion.id_suscripcion },
            data: { notificado_48h: true },
          });

          resultados.actualizadas++;
          resultados.detalles.push({
            id_suscripcion: suscripcion.id_suscripcion,
            email: suscripcion.Usuario.email,
            estado: "OK",
            mensaje: "Correo enviado y suscripción marcada",
          });

          console.log(
            `[CRON] ✓ Suscripción ${suscripcion.id_suscripcion} procesada correctamente`
          );
        } else {
          resultados.errores++;
          resultados.detalles.push({
            id_suscripcion: suscripcion.id_suscripcion,
            email: suscripcion.Usuario.email,
            estado: "ERROR",
            mensaje: "Error al enviar correo",
          });

          console.error(
            `[CRON] ✗ Error enviando email para ${suscripcion.id_suscripcion}`
          );
        }
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
