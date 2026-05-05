import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { enviarEmailRecordatorio } from "@/app/api/admin/services/recordatoriosService"; 

export async function GET() {
  try {
    //aqui creamos las variables inicioDia y finDia para crear las variables de rango para detectar los limites
    //arreglamos el error de la zona horaria con un cambio, porque en bolivia estamos 4 horas atras
    const ahora = new Date();
    const ahoraBolivia = new Date(ahora.getTime() - (4 * 60 * 60 * 1000));
    const fechaMeta = new Date();
    fechaMeta.setUTCDate(ahoraBolivia.getUTCDate() + 5);

    //crea un rango en el dia limite osea faltando 7 dias para vencer
    //inicioDia recibe +4 horas
    const inicioDia = new Date(fechaMeta);
    inicioDia.setUTCHours(4, 0, 0, 0);

    //finDia recibe tambiem el mismo trato
    const finDia = new Date(fechaMeta);
    finDia.setDate(finDia.getDate() + 1); 
    finDia.setUTCHours(23, 59, 59, 999);

    // aca el gte(Greater Than or Equal) y let(Less Than or Equal) sirven para que garantizar que se tome el valor de fecha_fin
    // con include traemos el dato del usuario y el dato del planpublicacion para el gmail
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

    //console.log(`📊 Planes encontrados (5 días): ${suscripciones.length}`);

    for (const sub of suscripciones) {
      if (sub.Usuario?.email) {
        try {
          await enviarEmailRecordatorio({
            emailCliente: sub.Usuario.email,
            nombreCliente: sub.Usuario.nombres || "Usuario",
            plan: sub.PlanPublicacion?.nombre_plan || "Plan Profesional",
            tipo: '48H'
          });
          //console.log(`📧 Email 5D enviado a: ${sub.Usuario.email}`);
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
          mensaje: `Su plan ${sub.PlanPublicacion?.nombre_plan} vence en 5 días. Por favor, pagar antes de que expire.`,
          leido: false,
          creado_en: new Date(),
          estado_envio: "pendiente",
          email_enviado: false
        }
      });
      //console.log(`Noti 5D creada para: ${sub.id_usuario}`);

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