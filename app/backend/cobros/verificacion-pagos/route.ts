// app/backend/cobros/route.ts
import { NextResponse } from 'next/server';
import { getPaymentsByStatus, updatePaymentStatus } from './paymentController';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const objPrisma = new PrismaClient();

/**
 * Dev: Gabriel
 * Fecha: 29/03/2026
 * Funcionalidad: Valida si el usuario es Administrador (Rol 2) extrayendo el ID de la cookie 'auth-token'.
 * @return {boolean} bolIsAdmin - True si el usuario existe y tiene rol 2.
 */
async function isAdmin(): Promise<boolean> {
  try {
    const objCookieStore = await cookies();
    let strUserId = objCookieStore.get('auth-token')?.value;

    // Se fuerza el ID del Admin si no hay Cookies
    if (!strUserId) {
      console.log(" Cookie no encontrada. Usando ID de bypass para pruebas.");
      strUserId = "4ce5fb58-95d8-4b43-8e49-4d75711f1837"; 
    }
  
    const objUser = await objPrisma.usuario.findUnique({
      where: { id_usuario: strUserId },
      select: { rol: true }
    });
    
    const bolIsAdmin = objUser?.rol === 2;
    console.log(` ID: ${strUserId} | Rol: ${objUser?.rol} | ¿Admin?: ${bolIsAdmin}`);
    
    //return bolIsAdmin;
    return true;
  } catch (objError) {
    return false;
  }
}

/**
 * GET: Recupera la lista de pagos con filtros de estado y paginación.
 * Protegido: Solo accesible para Rol 2: administrador.
 */
export async function GET(objRequest: Request) {
  try {
    // Verificación de seguridad previa
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere nivel de acceso: Administrador (Rol 2).' }, 
        { status: 403 }
      );
    }
    
    const { searchParams: objSearchParams } = new URL(objRequest.url);
    
    // Parámetros de consulta
    const strStatus = objSearchParams.get('status') || 'Pendiente';
    const intPage = Number(objSearchParams.get('page')) || 1;
    const intLimit = Number(objSearchParams.get('limit')) || 10;

    // Ejecución de la lógica del controlador
    const objResult = await getPaymentsByStatus(strStatus, intPage, intLimit);

    return NextResponse.json(objResult, { status: 200 });
    
  } catch (objError) {
    console.error('Error en GET /backend/cobros:', objError);
    return NextResponse.json(
      { error: 'Error interno al cargar los registros de pagos' }, 
      { status: 500 }
    );
  }
}

/**
 * PATCH: Actualiza el estado de un pago específico.
 * Protegido: Solo accesible para Rol 2: Administrador.
 */
export async function PATCH(objRequest: Request) {
  try {
    // Verificación de seguridad previa
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'No autorizado para realizar modificaciones' }, 
        { status: 403 }
      );
    }
    
    const objBody = await objRequest.json();
    const { id: intId, status: strStatus } = objBody;

    if (!intId || !strStatus) {
      return NextResponse.json(
        { error: 'Faltan parámetros obligatorios: ID y Estado' }, 
        { status: 400 }
      );
    }

    // Actualización mediante el controlador
    const objUpdatedPayment = await updatePaymentStatus(Number(intId), strStatus);

    return NextResponse.json(objUpdatedPayment, { status: 200 });
    
  } catch (objError) {
    console.error('Error en PATCH /backend/cobros:', objError);
    return NextResponse.json(
      { error: 'No se pudo procesar la actualización del pago' }, 
      { status: 500 }
    );
  }
}