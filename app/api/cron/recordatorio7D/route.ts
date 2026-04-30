import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { enviarEmailRecordatorio } from "@/app/api/admin/services/recordatoriosService"; 

export async function GET() {
  try {
    const ahora = new Date();
    const fechaMeta = new Date();
    fechaMeta.setUTCDate(ahora.getUTCDate() + 7);

    const inicioDia = new Date(fechaMeta);
    inicioDia.setUTCHours(0, 0, 0, 0);
    const finDia = new Date(fechaMeta);
    finDia.setUTCHours(23, 59, 59, 999);


    const suscripciones = await prisma.suscripcion.findMany({
      where: {
        id_plan: { not: 7 }, 
        notificado_7d: false, 
        fecha_fin: {
          gte: inicioDia,
          lte: finDia
        }
      },
      include: { Usuario: true, PlanPublicacion: true }
    });


    for (const sub of suscripciones) {
      
      if (sub.Usuario?.email) {
        try {
          await enviarEmailRecordatorio({
            emailCliente: sub.Usuario.email,
            nombreCliente: sub.Usuario.nombres || "Usuario",
            plan: sub.PlanPublicacion?.nombre_plan || "Plan Profesional",
            fechaFin: sub.fecha_fin.toLocaleDateString(),
            tipo: '7D'
          });
        } catch (mailError) {
          console.error(`❌ Error al enviar email a ${sub.Usuario.email}:`, mailError);
        }
      }

      await prisma.notificacion.create({
        data: {
          id_notificacion: uuidv4(),
          id_usuario: sub.id_usuario,
          id_publicacion: 1, 
          titulo: "Recordatorio de Pago",
          mensaje: `Su plan actual ${sub.PlanPublicacion?.nombre_plan} expira en 7 días. Por favor, pagar antes de que expire.`,
          id_categoria: 2,
          leido: false,
          creado_en: new Date(),
          estado_envio: "pendiente",
          email_enviado: false
        }
      });

      await prisma.suscripcion.update({
        where: { id_suscripcion: sub.id_suscripcion },
        data: { notificado_7d: true }
      });
    }

    return NextResponse.json({ ok: true, mensaje: `7D: Procesados ${suscripciones.length}` });
  } catch (error: any) {
    console.error("❌ ERROR CRÍTICO 7D:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}