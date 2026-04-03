import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ERROR_MESSAGE = 'No se pudieron cargar los planes de publicación.';

export async function GET() {
  try {
    const planes = await prisma.planPublicacion.findMany({
      where: {
        activo: true,
      },
      orderBy: {
        precio_plan: 'asc',
      },
    });

    return NextResponse.json(planes);
  } catch (error) {
    console.error('Error al obtener los planes:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGE },
      { status: 500 }
    );
  }
}