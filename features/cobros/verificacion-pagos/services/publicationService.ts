import { Prisma } from '@prisma/client';

export const syncUserPublicationsAndQuota = async (
  tx: Prisma.TransactionClient, 
  strUserId: string, 
  intNewQuota: number
) => {
    const estadoActivo = await tx.estadoPublicacion.findFirst({ where: { nombre_estado: 'Activo' } });
    const estadoSuspendido = await tx.estadoPublicacion.findFirst({ where: { nombre_estado: 'Suspendido' } });
    
    if (estadoActivo && estadoSuspendido) {
        // Obtener publicaciones del usuario ordenadas por las más recientes primero
        const publicaciones = await tx.publicacion.findMany({
            where: { id_usuario: strUserId },
            orderBy: { fecha_creacion: 'desc' }
        });

        const activas = publicaciones.filter(p => p.id_estado === estadoActivo.id_estado);
        const suspendidas = publicaciones.filter(p => p.id_estado === estadoSuspendido.id_estado);

        if (activas.length > intNewQuota) {
            // Downgrade: Si excede el cupo, ssuspender las MÁS RECIENTES
            const exceso = activas.length - intNewQuota;
            const paraSuspender = activas.slice(0, exceso); 
            
            if (paraSuspender.length > 0) {
            await tx.publicacion.updateMany({
                where: { id_publicacion: { in: paraSuspender.map(p => p.id_publicacion) } },
                data: { id_estado: estadoSuspendido.id_estado }
            });
            }
        } else if (activas.length < intNewQuota && suspendidas.length > 0) {
            // Upgrade/Renovación: Reactivar las suspendidas hasta alcanzar el nuevo límite
            const cupoDisponible = intNewQuota - activas.length;
            const paraReactivar = suspendidas.slice(0, cupoDisponible);

            if (paraReactivar.length > 0) {
            await tx.publicacion.updateMany({
                where: { id_publicacion: { in: paraReactivar.map(p => p.id_publicacion) } },
                data: { id_estado: estadoActivo.id_estado }
            });
            }
        }
    }


    //lo único que hace es cambiar la cantidad de publicaciones al del plan que se compró;
    // se compró un plan de 12 y antes se tenía de otro (2/50) solo cambia la cantidad a 12,
    // no toca nada de suspender publicaciones solo actualiza la cantidad
    await tx.usuario.update({
        where: { id_usuario: strUserId },
        data: {
            cant_publicaciones_restantes: intNewQuota
        }
    });
};