// app/backend/cobros/route.ts
import { NextResponse } from 'next/server';
import { getPaymentsByStatus, updatePaymentStatus } from './paymentController';

/**
 * Dev: Nicole Belen Arias Murillo
 * Fecha: 29/03/2026
 * Funcionalidad: Recupera la lista de pagos con filtros y paginación.
 * @param {object} objRequest - El objeto de solicitud HTTP.
 * @return {object} objNextResponse - JSON con los datos mapeados y metadatos de paginación.
 */
export async function GET(objRequest: Request) {
  try {
    const { searchParams: objSearchParams } = new URL(objRequest.url);
    
    // Parámetros de la URL
    const strStatus = objSearchParams.get('status') || 'Pendiente';
    const intPage = Number(objSearchParams.get('page')) || 1;
    const intLimit = Number(objSearchParams.get('limit')) || 10;

    // Llamamos al controlador con la lógica de skip/take
    const objResult = await getPaymentsByStatus(strStatus, intPage, intLimit);

    // objResult ahora contiene: { arrPayments, intTotalCount, intTotalPages }
    return NextResponse.json(objResult, { status: 200 });
    
  } catch (objError) {
    console.error('Error en GET /backend/cobros:', objError);
    return NextResponse.json(
      { error: 'Error al cargar los registros de pagos' }, 
      { status: 500 }
    );
  }
}

/**
 * Dev: Nicole Belen Arias Murillo
 * Fecha: 29/03/2026
 * Funcionalidad: Actualiza el estado de un pago (Aceptado/Rechazado).
 * @param {object} objRequest - El objeto de solicitud HTTP.
 * @return {object} objNextResponse - JSON con el registro actualizado.
 */
export async function PATCH(objRequest: Request) {
  try {
    const objBody = await objRequest.json();
    const { id: intId, status: strStatus } = objBody;

    if (!intId || !strStatus) {
      return NextResponse.json(
        { error: 'ID y estado son obligatorios' }, 
        { status: 400 }
      );
    }

    const objUpdatedPayment = await updatePaymentStatus(Number(intId), strStatus);

    return NextResponse.json(objUpdatedPayment, { status: 200 });
    
  } catch (objError) {
    console.error('Error en PATCH /backend/cobros:', objError);
    return NextResponse.json(
      { error: 'No se pudo actualizar el estado del pago' }, 
      { status: 500 }
    );
  }
}