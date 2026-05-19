import { Prisma } from '@prisma/client';

export const activatePromotion = async (
  tx: Prisma.TransactionClient,
  strUserId: string,
  intPublicacionId: number,
  intDaysQuota: number
) => {
  const objFechaInicio = new Date();
  const objFechaFin = new Date(objFechaInicio);

  objFechaFin.setDate(objFechaFin.getDate() + intDaysQuota);

  const objExistingPromotion = await tx.promocionPublicacion.findFirst({
    where: { id_publicacion: intPublicacionId }
  });

  if (objExistingPromotion) {
    await tx.promocionPublicacion.update({
      where: { id_promocion: objExistingPromotion.id_promocion },
      data: {
        id_usuario: strUserId, 
        fecha_fin: objFechaFin,
        fecha_inicio: objFechaInicio 
      }
    });
    console.log(`Promoción renovada para la publicación ${intPublicacionId}. Vigente hasta: ${objFechaFin}`);
  } else {
    await tx.promocionPublicacion.create({
      data: {
        id_usuario: strUserId,
        id_publicacion: intPublicacionId,
        fecha_inicio: objFechaInicio,
        fecha_fin: objFechaFin
      }
    });
    console.log(`Nueva promoción creada para la publicación ${intPublicacionId}. Expira el: ${objFechaFin}`);
  }

  await tx.publicacion.update({
    where: { id_publicacion: intPublicacionId },
    data: { prioridad: true }
  });
  
  console.log(`Publicación ${intPublicacionId} está ahora como prioridad.`);

};