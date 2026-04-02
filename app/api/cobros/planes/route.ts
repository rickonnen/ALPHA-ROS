import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Ajusta la ruta a donde tengas tu instancia de prisma

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
    console.error("Error al obtener los planes:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los planes de publicación." }, 
      { status: 500 }
    );
  }
}