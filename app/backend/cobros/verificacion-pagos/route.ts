import { NextResponse } from 'next/server';
import { getPaymentsByStatus, updatePaymentStatus } from '../../controllers/admin/paymentController';

/**
 * Dev: René Gabriel Vera Portanda
 * Fecha: 26/03/2026
 * Funcionalidad: Recupera la lista de pagos filtrada por estado para rellenar las tablas de la interfaz de usuario.
 * @param {object} objRequest - El objeto de solicitud HTTP entrante que contiene los parámetros de la URL.
 * @return {object} objNextResponse - Respuesta JSON con el arreglo de pagos o un mensaje de error.
 */
export async function GET(objRequest: Request) {
  try {
    const { searchParams: objSearchParams } = new URL(objRequest.url);
    const strStatus = objSearchParams.get('status') || 'Pendiente';

    const arrPayments = await getPaymentsByStatus(strStatus);

    // Si no hay registros, devolvemos una lista vacía (el front manejará el mensaje)
    return NextResponse.json(arrPayments, { status: 200 });
  } catch (objError) {
    console.error('Error en GET /backend/cobros:', objError);
    // Mensaje de error controlado
    return NextResponse.json(
      { error: 'Error al cargar los registros de pagos' }, 
      { status: 500 }
    );
  }
}

/**
 * Dev: René Gabriel Vera Portanda
 * Fecha: 26/03/2026
 * Funcionalidad: Actualiza el estado de un pago específico cuando un administrador lo acepta o lo rechaza.
 * @param {object} objRequest - El objeto de solicitud HTTP entrante que contiene la carga del cuerpo.
 * @return {object} objNextResponse - Respuesta JSON con el registro de pago actualizado o un mensaje de error.
 */
export async function PATCH(objRequest: Request) {
  try {
    const objBody = await objRequest.json();
    const { id: intId, status: strStatus } = objBody;

    // Validamos que vengan los datos obligatorios desde el cliente
    if (!intId || !strStatus) {
      return NextResponse.json(
        { error: 'ID y estado son obligatorios' }, 
        { status: 400 }
      );
    }

    // Convertimos el ID a número para actualizar en la BD (SmallInt)
    const objUpdatedPayment = await updatePaymentStatus(Number(intId), strStatus);

    return NextResponse.json(objUpdatedPayment, { status: 200 });
  } catch (objError) {
    console.error('Error en PATCH /backend/cobros:', objError);
    // Error controlado en caso de fallo en la actualización
    return NextResponse.json(
      { error: 'No se pudo actualizar el estado del pago' }, 
      { status: 500 }
    );
  }
}