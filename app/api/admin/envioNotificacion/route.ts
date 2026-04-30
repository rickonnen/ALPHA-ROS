import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_detalle, decision, motivo_rechazo } = body;

    const detalle = await prisma.detallePago.findUnique({
      where: { id_detalle: id_detalle },
      include: {
        PlanPublicacion: true,
        Usuario: true
      }
    });

    if (!detalle) {
      return NextResponse.json({ ok: false, error: "Pago no encontrado" }, { status: 404 });
    }

    const planNombre = detalle.PlanPublicacion?.nombre_plan || "Plan";
    const cupos = detalle.PlanPublicacion?.cant_publicaciones || 0;
    const nuevoEstado = decision === "ACEPTAR" ? 2 : 3;

    const resultado = await prisma.$transaction(async (tx) => {
      
      const pagoActualizado = await tx.detallePago.update({
        where: { id_detalle: id_detalle },
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
          id_publicacion: 1, // ID por defecto de vuestros crones
          id_categoria: 2,   // Categoría Cobros confirmada
          estado_envio: "pendiente",
          email_enviado: false
        }
      });

      return { pagoActualizado, nuevaNotificacion };
    });

    return NextResponse.json({
      ok: true,
      message: "Estado actualizado y notificación enviada a la app",
      data: resultado
    });

  } catch (error) {
    console.error("[ERROR_VERIFICACION]:", error);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}