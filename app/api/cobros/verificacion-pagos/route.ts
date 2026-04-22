import { NextRequest, NextResponse } from 'next/server';
import { getPaymentsByStatus, updatePaymentStatus } from '@/features/cobros/verificacion-pagos/paymentController';
import { verify } from "jsonwebtoken";
import { prisma } from '@/lib/prisma';

/**
 * Dev: Gabriel
 * Funcionalidad: Valida si el usuario es Administrador (Rol 1) .
 */
async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const authToken = request.cookies.get("auth_token")?.value;

    if (!authToken) {
      console.log("No se encontró la cookie 'auth_token'.");
      return false;
    }

    const decoded = verify(authToken, process.env.JWT_SECRET!) as {
      userId: string;
    };

    if (!decoded || !decoded.userId) {
      console.log("El token no contiene un userId válido.");
      return false;
    }

    const objUser = await prisma.usuario.findUnique({
      where: { id_usuario: decoded.userId },
      select: { rol: true }
    });
    
    const bolIsAdmin = objUser?.rol === 1;

    //console.log(` ID JWT: ${decoded.userId} | Rol DB: ${objUser?.rol} | Acceso Admin: ${bolIsAdmin}`);
    
    return bolIsAdmin; 
  } catch (objError) {
    console.error(" Error verificando el JWT en isAdmin:", objError);
    return false;
  }
}

/**
 * GET: Recupera la lista de pagos con filtros de estado y paginación.
 */
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: '403' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const strStatus = searchParams.get('status');
    
    // Capturar los parámetros de la URL
    const intPage = Number(searchParams.get('page')) || 1;
    const intLimit = Number(searchParams.get('limit')) || 10;

    if (strStatus !== 'all') {
      //  PASAR los parámetros al controlador
      const objResult = await getPaymentsByStatus(strStatus || 'Pendiente', intPage, intLimit);
      return NextResponse.json(objResult);
    }

    // Para el caso de 'all' (carga inicial)
    const [pending, accepted, rejected] = await Promise.all([
      getPaymentsByStatus('Pendiente', 1, 10),
      getPaymentsByStatus('Aceptado', 1, 10),
      getPaymentsByStatus('Rechazado', 1, 10)
    ]);

    return NextResponse.json({ pending, accepted, rejected });

  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

/**
 * PATCH: Actualiza el estado de un pago específico.
 */
export async function PATCH(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    const objBody = await request.json();
    const { id: intId, status: strStatus, reason: strReason } = objBody;

    if (!intId || !strStatus) {
      return NextResponse.json({ error: 'Faltan parámetros obligatorios' }, { status: 400 });
    }

    const objUpdatedPayment = await updatePaymentStatus(Number(intId), strStatus, strReason);
    return NextResponse.json(objUpdatedPayment, { status: 200 });
    
  } catch (objError) {
    console.error("Error en PATCH /verificacion-pagos:", objError);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}