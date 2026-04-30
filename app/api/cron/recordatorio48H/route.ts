import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

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
      include: { PlanPublicacion: true }
    });


    for (const sub of suscripciones) {
      const mensaje = `Su plan actual ${sub.PlanPublicacion?.nombre_plan} expira en 5 días por favor pagar antes de que expire`;

      await prisma.notificacion.create({
        data: {
          id_notificacion: uuidv4(),
          id_usuario: sub.id_usuario,
          id_publicacion: 1,
          titulo: "Recordatorio de Pago",
          mensaje: mensaje,
          id_categoria: 2, 
          leido: false,
          creado_en: new Date()
        }
      });

      await prisma.suscripcion.update({
        where: { id_suscripcion: sub.id_suscripcion },
        data: { notificado_48h: true }
      });
    }

    return NextResponse.json({ ok: true, mensaje: `48H: Procesados ${suscripciones.length}` });
  } catch (error: any) {
    console.error("ERROR_48H:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}