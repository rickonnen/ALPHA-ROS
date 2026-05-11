import { Prisma } from '@prisma/client';

export const syncUserPublicationsAndQuota = async (
  tx: Prisma.TransactionClient, 
  strUserId: string, 
  intNewQuota: number
) => {
    console.log(`--- INICIO SYNC PAGO (User: ${strUserId}) ---`);
    console.log(`Nuevo Cupo del Plan: ${intNewQuota}`);

    // 1. Traer TODAS las publicaciones del usuario (sin filtrar estado)
    const publicaciones = await tx.publicacion.findMany({
        where: { id_usuario: strUserId, gratuito: false },
        orderBy: { fecha_creacion: 'asc' }
    });

    console.log(`Total publicaciones encontradas: ${publicaciones.length}`);

    // 2. Clasificamos usando IDs numéricos (1=Activa, 4=Suspencion)
    const activas = publicaciones.filter(p => p.id_estado === 1 && p.gratuito === false);
    const suspendidas = publicaciones.filter(p => p.id_estado === 4 && p.gratuito === false);

    console.log(`Publicaciones actualmente Activas (ID 1): ${activas.length}`);
    console.log(`Publicaciones actualmente Suspendidas (ID 4): ${suspendidas.length}`);

    if (activas.length > intNewQuota) {
        // ESCENARIO: Downgrade
        const exceso = activas.length - intNewQuota;
        const paraSuspender = activas.slice(-exceso); 
        
        console.log(`Acción: Downgrade. Suspendiendo ${paraSuspender.length} más recientes.`);

        if (paraSuspender.length > 0) {
            const res = await tx.publicacion.updateMany({
                where: { id_publicacion: { in: paraSuspender.map(p => p.id_publicacion) } },
                data: { id_estado: 4 }
            });
            console.log(`Resultado update: ${res.count} actualizadas a ID 4`);
        }
    } 
    else if (activas.length < intNewQuota && suspendidas.length > 0) {
        // ESCENARIO: Upgrade/Reactivación
        const cupoDisponible = intNewQuota - activas.length;
        // Reactivamos las más antiguas (inicio del array)
        const paraReactivar = suspendidas.slice(0, cupoDisponible);

        console.log(`Acción: Upgrade. Reactivando ${paraReactivar.length} más antiguas.`);

        if (paraReactivar.length > 0) {
            const res = await tx.publicacion.updateMany({
                where: { id_publicacion: { in: paraReactivar.map(p => p.id_publicacion) } },
                data: { id_estado: 1 }
            });
            console.log(`Resultado update: ${res.count} actualizadas a ID 1`);
        }
    } else {
        console.log("No se requiere ajuste de estados (el cupo ya es correcto o no hay suspendidas).");
    }

    console.log(`--- FIN SYNC PAGO ---`);
};