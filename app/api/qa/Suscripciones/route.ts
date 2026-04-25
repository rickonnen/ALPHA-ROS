import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
<<<<<<< HEAD
 * POST: Pasa la suscripción a "Expirado" (Fuerza la fecha a ayer)
=======
 * Endpoint para QA: POST
 * Funcionalidad: Pasa la suscripción de un usuario a "Expirado" (Forza la fecha a ayer).
>>>>>>> dfd9305eea7467e40e3f00db9cc43e065ed013bb
 */
export async function POST(request: NextRequest) {
  try {
    const { id_usuario } = await request.json();

    if (!id_usuario) {
      return NextResponse.json({ error: 'Falta el id_usuario' }, { status: 400 });
    }

<<<<<<< HEAD
=======
    // Le restamos 1 día a la fecha actual para forzar la expiración
>>>>>>> dfd9305eea7467e40e3f00db9cc43e065ed013bb
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);

    const suscripcionActualizada = await prisma.suscripcion.update({
      where: { id_usuario },
      data: { fecha_fin: ayer }
    });

    return NextResponse.json({
      success: true,
      message: 'Suscripción expirada forzosamente para testing',
      data: suscripcionActualizada
    });

  } catch (error: any) {
<<<<<<< HEAD
=======
    console.error('[QA] Error expirando suscripción:', error);
>>>>>>> dfd9305eea7467e40e3f00db9cc43e065ed013bb
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
<<<<<<< HEAD
 * PATCH: Modifica la fecha de expiración a una fecha específica
=======
 * Endpoint para QA: PATCH
 * Funcionalidad: Modifica la fecha de expiración a una fecha específica.
>>>>>>> dfd9305eea7467e40e3f00db9cc43e065ed013bb
 */
export async function PATCH(request: NextRequest) {
  try {
    const { id_usuario, nueva_fecha_fin } = await request.json();

    if (!id_usuario || !nueva_fecha_fin) {
      return NextResponse.json({ 
        error: 'Faltan parámetros obligatorios (id_usuario, nueva_fecha_fin)' 
      }, { status: 400 });
    }

    const suscripcionActualizada = await prisma.suscripcion.update({
      where: { id_usuario },
      data: { fecha_fin: new Date(nueva_fecha_fin) }
    });

    return NextResponse.json({
      success: true,
      message: 'Fecha de suscripción modificada exitosamente',
      data: suscripcionActualizada
    });

  } catch (error: any) {
<<<<<<< HEAD
=======
    console.error('[QA] Error modificando fecha:', error);
>>>>>>> dfd9305eea7467e40e3f00db9cc43e065ed013bb
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}