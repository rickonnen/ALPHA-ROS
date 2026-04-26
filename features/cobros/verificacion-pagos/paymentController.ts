// app/backend/cobros/controllers/paymentController.ts
import { prisma } from '@/lib/prisma';
// Mapeo de estados según la lógica acordada
const objStatuses = {
  intPending: 1,
  intAccepted: 2,
  intRejected: 3
};
/**
 * Dev: Nicole Belen Arias Murillo
 * Fecha: 29/03/2026
 * Funcionalidad: Recuperar pagos filtrados por estado con paginación de servidor.
 * @param {string} strStatusName - Nombre del estado para filtrar.
 * @param {number} intPage - Número de página actual (por defecto 1).
 * @param {number} intPageSize - Cantidad de registros por página (por defecto 10).
 * @return {object} objResult - Objeto con el arreglo de pagos y el total de registros.
 */
export const getPaymentsByStatus = async (
  strStatusName: string, 
  intPage: number = 1, 
  intPageSize: number = 10
) => {
  const objStatusMap: Record<string, number> = {
    'Pendiente': objStatuses.intPending,
    'Aceptado': objStatuses.intAccepted,
    'Rechazado': objStatuses.intRejected
  };

  const intStatusId = objStatusMap[strStatusName] || objStatuses.intPending;
  const intSkip = (intPage - 1) * intPageSize;

  // Ejecutamos ambas consultas en paralelo para ahorrar tiempo
  const [arrPayments, intTotalCount] = await Promise.all([
    prisma.detallePago.findMany({
      where: { estado: intStatusId },
      include: {
        Usuario: {
          select: { nombres: true, apellidos: true, email: true }
        },
        PlanPublicacion: {
          select: { nombre_plan: true }
        }
      },
      skip: intSkip,
      take: intPageSize,
      orderBy: { id_detalle: 'desc' } // Los más recientes aparecen primero
    }),
    prisma.detallePago.count({
      where: { estado: intStatusId }
    })
  ]);

  return {
    arrPayments,
    intTotalCount,
    intTotalPages: Math.ceil(intTotalCount / intPageSize)
  };
};

/**
 * Dev: Rene Gabriel Vera Portanda 
 * Fecha: 27/03/2026
 * Funcionalidad: Actualiza el estado de un pago específico. La asignación del plan se maneja automáticamente en PostgreSQL.
 * @param {number} intId - Identificador único para el detalle del pago.
 * @param {string} strNewStatusName - El nuevo nombre de estado.
 * @return {object} objUpdatedPayment - El registro actualizado de la base de datos de pagos.
 */
export const updatePaymentStatus = async (intId: number, strNewStatusName: string, strReason?: string) => {
  const objStatusMap: Record<string, number> = {
    'Aceptado': objStatuses.intAccepted,
    'Rechazado': objStatuses.intRejected
  };
  
  const intNewStatus = objStatusMap[strNewStatusName];

  if (!intNewStatus) {
    throw new Error(`El estado proporcionado '${strNewStatusName}' no es válido para la actualización.`);
  }

  try {
    // Prisma actualizará el estado. 
    // Se cambia la razón del rachazo 
    // actualiza la cantidad de publicaciones de acuerdo al plan
    const objUpdatedPayment = await prisma.$transaction(async (tx) => {
      const objCurrentPayment = await tx.detallePago.findUnique({
        where: { id_detalle: intId },
        include: { PlanPublicacion: true }
      });

      if (!objCurrentPayment) {
        throw new Error(`No se encontró el pago con id ${intId}`);
      }

      const objPaymentResult = await tx.detallePago.update({
        where: { id_detalle: intId },
        data: {
          estado: intNewStatus,
          razon_rechazo: strNewStatusName === 'Rechazado' ? strReason : null,
        },
      });

      if (strNewStatusName === 'Aceptado' && objCurrentPayment.estado === objStatuses.intPending) {
        
        const intNewQuota = objCurrentPayment.PlanPublicacion?.cant_publicaciones || 0;
        const strUserId = objCurrentPayment.id_usuario;
        const intPlanId = objCurrentPayment.id_plan;

        if (strUserId && intPlanId) {
          // --- INICIO LÓGICA HU6 (Upgrade / Downgrade) ---
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
          // --- FIN LÓGICA HU6 ---

          // Pa ver si ya tiene una suscripción
          const objExistingSub = await tx.suscripcion.findUnique({
            where: { id_usuario: strUserId }
          });

          const objNow = new Date();
          let objFechaInicioBase = objNow;

          await tx.usuario.update({
            where: { id_usuario: strUserId },
            data: {
              cant_publicaciones_restantes: intNewQuota
            }
          });
          
          //si es el mismo plan y no se venció, se acumula el tiempo
          if (objExistingSub && objExistingSub.id_plan === intPlanId && objExistingSub.fecha_fin > objNow) {
            objFechaInicioBase = new Date(objExistingSub.fecha_fin);
          } else {
            //sino empieza hoy...
            objFechaInicioBase = objNow;
          }
          
          const objFechaFin = new Date(objFechaInicioBase);
          const strModalidad = objCurrentPayment.tiempo_pago || 'mensual';
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
        }
      }

      return objPaymentResult;

    });

    console.log(`Pago ${intId} procesado: Cupo actualizado a ${strNewStatusName}.`);
    return objUpdatedPayment;

  } catch (error: any) {
    // Prisma lanza un error P2025 si el registro no existe
    if (error.code === 'P2025') {
      throw new Error(`No se encontró el pago con id ${intId}`);
    }
    console.error("Error al actualizar el estado del pago:", error);
    throw error;
  }

};