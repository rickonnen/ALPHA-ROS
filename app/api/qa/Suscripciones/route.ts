import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST: Pasa la suscripción a "Expirado" (Fuerza la fecha a ayer)
 */
export async function POST(request: NextRequest) {
  try {
    const { id_usuario } = await request.json();

    if (!id_usuario) {
      return NextResponse.json({ error: 'Falta el id_usuario' }, { status: 400 });
    }

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
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * PATCH: Modifica la fecha de expiración a una fecha específica
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
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}