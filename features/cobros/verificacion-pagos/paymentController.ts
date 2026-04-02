// app/backend/cobros/controllers/paymentController.ts
import { PrismaClient } from '@prisma/client';

const objPrisma = new PrismaClient();

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
    objPrisma.detallePago.findMany({
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
    objPrisma.detallePago.count({
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
export const updatePaymentStatus = async (intId: number, strNewStatusName: string) => {
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
    // Si cambia de 1 (Pendiente) a 2 (Aceptado), el Trigger trg_pago_aprobado_update 
    // en Supabase se disparará de forma invisible y sumará las publicaciones al usuario.
    const objUpdatedPayment = await objPrisma.detallePago.update({
      where: { id_detalle: intId },
      data: {
        estado: intNewStatus,
      },
    });

    console.log(`Estado del pago ${intId} actualizado a ${strNewStatusName}.`);
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