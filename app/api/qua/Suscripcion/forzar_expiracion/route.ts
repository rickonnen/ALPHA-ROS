import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  
  if (process.env.ENABLE_QA_ENDPOINTS !== 'true') {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id_usuario } = body;

    if (!id_usuario) {
      return NextResponse.json({ error: 'Falta el id_usuario' }, { status: 400 });
    }

    // Cambiamos el estado a 0 (Expirado)
    const result = await prisma.detallePago.updateMany({
      where: { id_usuario: id_usuario },
      data: { estado: 0 }, 
    });

    return NextResponse.json({ 
      message: 'Usuario pasado a expirado (QA)', 
      count: result.count 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}