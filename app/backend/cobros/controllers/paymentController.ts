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
 * Fecha: 26/03/2026
 * Funcionalidad: Recuperar pagos filtrados por su estado actual.
 * @param {string} strStatusName - Nombre del estado para filtrar.
 * @return {array} arrPayments - Array de registros de detalles de pago.
 */
export const getPaymentsByStatus = async (strStatusName: string) => {
  const objStatusMap: Record<string, number> = {
    'Pendiente': objStatuses.intPending,
    'Aceptado': objStatuses.intAccepted,
    'Rechazado': objStatuses.intRejected
  };

  return await objPrisma.detallePago.findMany({
    where: {
      estado: objStatusMap[strStatusName] || objStatuses.intPending,
    },
    include: {
      Usuario: {
        select: {
          nombres: true,
          apellidos: true,
          email: true
        }
      },
      PlanPublicacion: {
        select: {
          nombre_plan: true
        }
      }
    },
  });
};

/**
 * Dev: Nicole Belen Arias Murillo
 * Fecha: 26/03/2026
 * Funcionalidad: Actualiza el estado de un pago específico y activa las asignaciones del plan si se acepta.
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

  // Buscar los datos del pago antes de actualizarlo para identificar al usuario y el plan
  const objPayment = await objPrisma.detallePago.findUnique({
    where: { id_detalle: intId }
  });

  // Validar si el registro de pago existe en la base de datos
  if (!objPayment) {
    throw new Error(`No se encontró el pago con id ${intId}`);
  }

  // Actualizar el estado del pago con el nuevo valor
  const objUpdatedPayment = await objPrisma.detallePago.update({
    where: { id_detalle: intId },
    data: {
      estado: intNewStatus,
    },
  });

  // Verificar si la acción fue aceptada y asegurar la existencia de los datos requeridos
  if (strNewStatusName === 'Aceptado' && objPayment.id_usuario && objPayment.id_plan) {
    console.log(`Pago aceptado. Procediendo a sumar publicaciones para el usuario ${objPayment.id_usuario}`);
    // Llamar al método aislado pasando los datos encontrados
    await addPlanPublications(objPayment.id_usuario, objPayment.id_plan);
  }

  return objUpdatedPayment;
};

/**
 * Dev: Nicole Belen Arias Murillo
 * Fecha: 26/03/2026
 * Funcionalidad: Agregar créditos de publicación a un usuario específico según el ID del plan comprado.
 * @param {string} strUserId - UUID del usuario que recibe las publicaciones.
 * @param {number} intPlanId - ID of the purchased plan determining the publication amount.
 * @return {number|null} intAffectedRows - ID del plan adquirido que determina la cantidad de publicaciones.
 */
export const addPlanPublications = async (strUserId: string, intPlanId: number) => {
  const objPublicationsPerPlan: Record<number, number> = {
    1: 2,
    2: 12,
    3: 50
  };
  const intAmountToAdd = objPublicationsPerPlan[intPlanId] || 0;

  // Evitar consultas a la base de datos si el plan no es reconocido
  if (intAmountToAdd === 0) {
    console.warn(`No se sumaron publicaciones: id_plan ${intPlanId} no reconocido.`);
    return null;
  }

  try {
    // Usar Raw SQL para actualizar el contador y saltar las restricciones de Prisma con otras columnas
    const intAffectedRows = await objPrisma.$executeRaw`
      UPDATE "Usuario" 
      SET cant_publicaciones_restantes = cant_publicaciones_restantes + ${intAmountToAdd} 
      WHERE id_usuario = ${strUserId}::uuid
    `;

    console.log(`Se sumaron ${intAmountToAdd} publicaciones al usuario ${strUserId}. Filas afectadas: ${intAffectedRows}`);
    return intAffectedRows;

  } catch (objError) {
    console.error("Error al intentar sumar las publicaciones por SQL:", objError);
    throw objError;
  }
};