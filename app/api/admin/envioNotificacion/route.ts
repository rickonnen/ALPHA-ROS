
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { generarComprobantePDF } from "@/app/api/admin/services/pdfService";
import { enviarEmailCobroConPDF } from "@/app/api/admin/services/emailCobrosService";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const emailAdminLogueado = session?.user?.email;

  try {
    const body = await req.json();
    const { id_detalle, decision, motivo_rechazo } = body;

    const detalle = await prisma.detallePago.findUnique({
      where: { id_detalle },
      include: { PlanPublicacion: true, Usuario: true }
    });

    if (!detalle) {
      return NextResponse.json({ ok: false, error: "Pago no encontrado" }, { status: 404 });
    }

    const planNombre = detalle.PlanPublicacion?.nombre_plan || "Plan";
    const montoPlan = Number(detalle.PlanPublicacion?.precio_plan) || 0;
    const cupos = detalle.PlanPublicacion?.cant_publicaciones || 0;
    const nuevoEstado = decision === "ACEPTAR" ? 2 : 3;

    // 1. Transacción de Base de Datos
    const resultado = await prisma.$transaction(async (tx) => {
      const pagoActualizado = await tx.detallePago.update({
        where: { id_detalle },
        data: { 
          estado: nuevoEstado,
          razon_rechazo: decision === "RECHAZAR" ? motivo_rechazo : null
        }
      });

      const titulo = decision === "ACEPTAR" ? "Compra Aprobada" : "Compra Rechazada";
      const mensaje = decision === "ACEPTAR"
        ? `Su compra del plan ${planNombre} fue aprobada se adquirieron ${cupos} cupos a su cuenta`
        : `Su compra del plan ${planNombre} fue rechazada.`;

      const nuevaNotificacion = await tx.notificacion.create({
        data: {
          id_notificacion: uuidv4(),
          titulo: titulo,
          mensaje: mensaje,
          id_usuario: detalle.id_usuario!,
          id_categoria: 2, 
          leido: false,             
          creado_en: new Date(),
          id_publicacion: 1,
          estado_envio: "pendiente",
          email_enviado: false
        }
      });
      return { pagoActualizado, nuevaNotificacion };
    });

    // 2. Proceso colateral: PDF y Email Dual
    if (decision === "ACEPTAR") {
      try {
        const pdfBuffer = await generarComprobantePDF({
          id_detalle,
          nombre: detalle.Usuario?.nombres || "Cliente",
          plan: planNombre,
          precio: montoPlan,
          cupos: cupos
        });

        // LLAMADA ÚNICA AL SERVICIO (Él se encarga de enviar los dos correos)
        const infoEmail = await enviarEmailCobroConPDF({
          emailCliente: detalle.Usuario?.email!,
          emailAdmin: emailAdminLogueado || process.env.GMAIL_USER!,
          nombreCliente: detalle.Usuario?.nombres!,
          plan: planNombre,
          monto: montoPlan,
          cupos: cupos,
          pdfBuffer
        });

        // 3. Marcamos como completado si el envío fue exitoso
        if (infoEmail) {
          await prisma.notificacion.update({
            where: { id_notificacion: resultado.nuevaNotificacion.id_notificacion },
            data: { email_enviado: true, estado_envio: "completado" }
          });
        }
      } catch (errorPostTransaction) {
        console.error("Error en PDF/Email:", errorPostTransaction);
      }
    }

    return NextResponse.json({ ok: true, data: resultado });

  } catch (error) {
    console.error("[ERROR_VERIFICACION]:", error);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}