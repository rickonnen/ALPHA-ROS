import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { upsertUserSubscription } from "@/features/cobros/verificacion-pagos/services/subscriptionService";
import { syncUserPublicationsAndQuota } from "@/features/cobros/verificacion-pagos/services/publicationService"; 

import { v4 as uuidv4 } from "uuid";
import { generarComprobantePDF } from "@/app/api/admin/services/pdfService";
import { enviarEmailCobroConPDF } from "@/app/api/admin/services/emailCobrosService";
import { enviarEmailRechazo } from "@/app/api/admin/services/emailCobrosRechazo";


const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { paymentId, userId, nuevoEstado, planId, modalidad } = await req.json();
    
    // Aceptado = 2, Rechazado = 3
    let estadocrip = 1; 

    //por si el rodri se wasea y pueda poner eso o el numero xdxdxdxdxddxdxxddxxdxdd
    if (nuevoEstado === "finished" || nuevoEstado === 2 || nuevoEstado === "2") {
      estadocrip = 2;
    } else if (nuevoEstado === "failed" || nuevoEstado === "partially_paid" || nuevoEstado === 3 || nuevoEstado === "3") {
      estadocrip = 3;
    }

    const resultado = await prisma.$transaction(async (tx) => {
      // Creamos el detalle del pago
      const nuevoPago = await tx.detallePago.create({
        data: {
          id_plan: planId ? parseInt(planId) : null,
          id_cripto: paymentId,
          id_usuario: userId,
          estado: estadocrip,
          metodo_pago: "Transferencia virtual",
          fecha_detalle: new Date(),
        },
        include: { PlanPublicacion: true, Usuario: true } 
      });

      if (estadocrip === 2) {
        await upsertUserSubscription(
          tx, 
          userId, 
          parseInt(planId), 
          modalidad
        );
        const nuevoCupo = nuevoPago.PlanPublicacion?.cant_publicaciones || 0;
        await syncUserPublicationsAndQuota(tx, userId, nuevoCupo);
      }

      const planNombre = nuevoPago.PlanPublicacion?.nombre_plan || "Plan";
      const cupos = nuevoPago.PlanPublicacion?.cant_publicaciones || 0;
      
      const titulo = estadocrip === 2 ? "Compra Aprobada" : "Compra Rechazada";
      const mensaje = estadocrip === 2
        ? `Su compra del plan ${planNombre} fue aprobada. Se adquirieron ${cupos} cupos.`
        : `Su compra del plan ${planNombre} fue rechazada por: La transacción de criptomonedas no pudo ser validada.`;

      const nuevaNotificacion = await tx.notificacion.create({
        data: {
          id_notificacion: uuidv4(),
          titulo: titulo,
          mensaje: mensaje,
          id_usuario: userId,
          id_categoria: 2, 
          leido: false,
          creado_en: new Date(),
          id_publicacion: 1, 
          estado_envio: "pendiente",
          email_enviado: false
        }
      });

      return { nuevoPago, nuevaNotificacion };
    });

    const { nuevoPago, nuevaNotificacion } = resultado;
    const planNombre = nuevoPago.PlanPublicacion?.nombre_plan || "Plan";
    const montoPlan = Number(nuevoPago.PlanPublicacion?.precio_plan) || 0;
    const cupos = nuevoPago.PlanPublicacion?.cant_publicaciones || 0;

    if (estadocrip === 2) {
      try {
        const pdfBuffer = await generarComprobantePDF({
          id_detalle: nuevoPago.id_detalle.toString(),
          nombre: nuevoPago.Usuario?.nombres || "Cliente",
          plan: planNombre,
          precio: montoPlan,
          cupos: cupos
        });

        const infoEmail = await enviarEmailCobroConPDF({
          emailCliente: nuevoPago.Usuario?.email!,
          emailAdmin: process.env.GMAIL_USER!, 
          nombreCliente: nuevoPago.Usuario?.nombres!,
          plan: planNombre,
          monto: montoPlan,
          cupos: cupos,
          pdfBuffer
        });

        if (infoEmail) {
          await prisma.notificacion.update({
            where: { id_notificacion: nuevaNotificacion.id_notificacion },
            data: { email_enviado: true, estado_envio: "completado" }
          });
        }
      } catch (err) {
        console.error("Error en proceso de PDF o Email Cripto:", err);
      }
    } else if (estadocrip === 3) {
      try {
        const infoEmailRechazo = await enviarEmailRechazo({
          emailCliente: nuevoPago.Usuario?.email!,
          emailAdmin: process.env.GMAIL_USER!,
          nombreCliente: nuevoPago.Usuario?.nombres || "Cliente",
          plan: planNombre,
          motivo: "La transacción de criptomonedas falló o fue cancelada."
        });

        if (infoEmailRechazo) {
          await prisma.notificacion.update({
            where: { id_notificacion: nuevaNotificacion.id_notificacion },
            data: { email_enviado: true, estado_envio: "completado" }
          });
        }
      } catch (err) {
        console.error("Error al enviar email de rechazo Cripto:", err);
      }
    }

    return NextResponse.json({ success: true, data: resultado.nuevoPago });

  } catch (error) {
    console.error("Error al crear detalle de pago:", error);
    return NextResponse.json(
      { error: "No se pudo crear el registro. Verifica que el userId sea válido." }, 
      { status: 500 }
    );
  }
}