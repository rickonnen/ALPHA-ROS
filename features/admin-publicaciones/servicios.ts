import prisma from "@/lib/prisma";

/**
 *
 */
export async function obtenerUsuariosExpirados() {
  const haceUnMes = new Date();
  haceUnMes.setMonth(haceUnMes.getMonth() - 1); // Asumimos que los planes duran 1 mes

  return await prisma.usuario.findMany({
    where: {
      DetallePago: {
        some: {
          fecha_detalle: { lt: haceUnMes }, // El pago es más viejo de un mes
          estado: 1 // Asumiendo que 1 es 'Pagado/Activo'
        }
      }
    },
    include: { DetallePago: true }
  });
}

/**
 *  Suspensión por exceso (Orden cronológico DESC)
 */
export async function suspenderPublicacionesPorExceso(idUsuario: string, limitePlan: number) {
  const activas = await prisma.publicacion.findMany({
    where: { 
      id_usuario: idUsuario,
      id_estado: 1 // Usamos el id_estado de tu modelo (asumiendo 1 = Activo)
    },
    orderBy: {
      id_publicacion: 'desc' 
    }
  });

  if (activas.length > limitePlan) {
    const idsASuspender = activas
      .slice(limitePlan) 
      .map(p => p.id_publicacion);

    await prisma.publicacion.updateMany({
      where: { id_publicacion: { in: idsASuspender } },
      data: { id_estado: 3 } /
    });

    return idsASuspender;
  }
  return [];
}

/**
 * Registro de logs
 */
export async function registrarLogCambio(idUsuario: string, ids: number[], motivo: string) {
  
  const log = {
    usuario: idUsuario,
    publicacionesAfectadas: ids,
    motivo: motivo,
    fecha: new Date().toISOString()
  };
  console.log("--- REGISTRO DE AUDITORÍA ---", log);
}