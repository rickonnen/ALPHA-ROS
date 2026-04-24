import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  if (process.env.ENABLE_QA_ENDPOINTS !== 'true') {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
  }

  try {
    const { id_usuario, nueva_fecha } = await request.json();
    const fechaConvertida = new Date(nueva_fecha);

    if (isNaN(fechaConvertida.getTime())) {
      return NextResponse.json({ error: 'Fecha inválida. Usa: YYYY-MM-DD' }, { status: 400 });
    }

    const result = await prisma.detallePago.updateMany({
      where: { id_usuario: id_usuario },
      data: { fecha_detalle: fechaConvertida },
    });

    return NextResponse.json({ 
      message: 'Fecha actualizada para QA', 
      nueva_fecha: fechaConvertida 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}