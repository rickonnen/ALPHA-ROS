import { Prisma } from '@prisma/client';

export const upsertUserSubscription = async (
  tx: Prisma.TransactionClient,
  strUserId: string,
  intPlanId: number,
  strModalidadBase: string | null
) => {
    // Pa ver si ya tiene una suscripción
    const objExistingSub = await tx.suscripcion.findUnique({
    where: { id_usuario: strUserId }
    });

    const objNow = new Date();
    let objFechaInicioBase = objNow;
    
    //si es el mismo plan y no se venció, se acumula el tiempo
    if (objExistingSub && objExistingSub.id_plan === intPlanId && objExistingSub.fecha_fin > objNow) {
    objFechaInicioBase = new Date(objExistingSub.fecha_fin);
    } else {
    //sino empieza hoy...
    objFechaInicioBase = objNow;
    }
    
    const objFechaFin = new Date(objFechaInicioBase);
    const strModalidad = strModalidadBase || 'mensual';
    // Si es anual se suma 1 año exacto, sino ps, se suma 30 días
    if (strModalidad.toLowerCase().includes('anual')) {
    objFechaFin.setFullYear(objFechaFin.getFullYear() + 1);
    } else {
    objFechaFin.setDate(objFechaFin.getDate() + 30);
    }
    
    //Crea/actualiza suscripción
    await tx.suscripcion.upsert({
        where: { id_usuario: strUserId },
        update: {
            id_plan: intPlanId,
            fecha_inicio: objNow,
            fecha_fin: objFechaFin,
            modalidad: strModalidad,
            notificado_7d: false,
            notificado_48h: false
        },
        create: {
            id_usuario: strUserId,
            id_plan: intPlanId,
            fecha_inicio: objNow,
            fecha_fin: objFechaFin,
            modalidad: strModalidad,
            notificado_7d: false,
            notificado_48h: false
        }
    });
};