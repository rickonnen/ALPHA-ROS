
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { generarComprobantePDF } from "@/app/api/admin/services/pdfService";
import { enviarEmailCobroConPDF } from "@/app/api/admin/services/emailCobrosService";

export async function POST(req: NextRequest) {
  

  try {
    const body = await req.json();
    const { id_detalle, decision, motivo_rechazo, id_admin_ejecutor } = body;

    let emailAdminFinal = process.env.GMAIL_USER;

    if (id_admin_ejecutor) {
      const adminDB = await prisma.usuario.findUnique({
        where: { id_usuario: id_admin_ejecutor },
        select: { email: true }
      });
      
      if (adminDB?.email) {
        emailAdminFinal = adminDB.email;
        console.log("✅ Admin identificado por DB:", emailAdminFinal);
      }
    }

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

    if (decision === "ACEPTAR") {
      try {
        const pdfBuffer = await generarComprobantePDF({
          id_detalle,
          nombre: detalle.Usuario?.nombres || "Cliente",
          plan: planNombre,
          precio: montoPlan,
          cupos: cupos
        });

        const infoEmail = await enviarEmailCobroConPDF({
          emailCliente: detalle.Usuario?.email!,
          emailAdmin: emailAdminFinal!,
          nombreCliente: detalle.Usuario?.nombres!,
          plan: planNombre,
          monto: montoPlan,
          cupos: cupos,
          pdfBuffer
        });

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