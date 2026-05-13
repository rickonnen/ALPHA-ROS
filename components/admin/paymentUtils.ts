/**
 * Dev: Nicole Belen Arias Murillo
 * Funcionalidad: Calcula la fecha de vencimiento de un plan (Promoción o Suscripción)
 */
export const calculateValidUntil = (
  strPaymentDate: string,
  strTiempoPago: string | null,
  bolEsPromocion: boolean,
  intDaysQuota: number,
  intCurrentPaymentPlanId: number | null,
  objUserSubscription?: { id_plan: number, fecha_fin: string | Date } | null
): string => {
    if (!strPaymentDate) return 'No especificado';
        const objFechaPago = new Date(strPaymentDate);
        let objFechaBase = new Date(strPaymentDate);

    if (bolEsPromocion) {
        // Sumamos la cantidad de publicaciones como días
        objFechaBase.setDate(objFechaBase.getDate() + (intDaysQuota || 0));
    } else {
        if (objUserSubscription && objUserSubscription.id_plan === intCurrentPaymentPlanId && new Date(objUserSubscription.fecha_fin) > objFechaPago) {
        objFechaBase = new Date(objUserSubscription.fecha_fin);
        }
        const strModalidad = strTiempoPago || 'mensual';
    
        if (strModalidad.toLowerCase().includes('anual')) {
            objFechaBase.setFullYear(objFechaBase.getFullYear() + 1);
        } else {
            objFechaBase.setDate(objFechaBase.getDate() + 30);
        }
    }
  return objFechaBase.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};