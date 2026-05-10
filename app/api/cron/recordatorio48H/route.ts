import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { enviarEmailRecordatorio } from "@/app/api/admin/services/recordatoriosService"; 

export async function GET() {
  try {
    const ahora = new Date();
    const fechaMeta = new Date();
    fechaMeta.setUTCDate(ahora.getUTCDate() + 5);

    const inicioDia = new Date(fechaMeta);
    inicioDia.setUTCHours(0, 0, 0, 0);
    const finDia = new Date(fechaMeta);
    finDia.setUTCHours(23, 59, 59, 999);


    const suscripciones = await prisma.suscripcion.findMany({
      where: {
        id_plan: { not: 7 }, 
        notificado_48h: false, 
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
            tipo: '5D'
          });
        } catch (mailError) {
          console.error(`❌ Error Mail 5D (${sub.Usuario.email}):`, mailError);
        }
      }

      await prisma.notificacion.create({
        data: {
          id_notificacion: uuidv4(),
          id_usuario: sub.id_usuario,
          id_publicacion: 1, 
          id_categoria:2,
          titulo: "Recordatorio Próximo Vencimiento",
          mensaje: `Segundo aviso: Su plan ${sub.PlanPublicacion?.nombre_plan} vence en 5 días. Por favor, pagar antes de que expire.`,
          leido: false,
          creado_en: new Date(),
          estado_envio: "pendiente",
          email_enviado: false
        }
      });

      await prisma.suscripcion.update({
        where: { id_suscripcion: sub.id_suscripcion },
        data: { notificado_48h: true }
      });
    }

    return NextResponse.json({ ok: true, mensaje: `48hr: Procesados ${suscripciones.length}` });
  } catch (error: any) {
    console.error("❌ ERROR CRÍTICO 5D:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}