import { NextResponse } from 'next/server';
import { prisma } from '@/features/filter_search_page/prismaClient';

export async function GET() {
  try {
    // Buscamos todas las etiquetas de la tabla Etiquetas
    const etiquetas = await prisma.etiquetas.findMany({
      orderBy: {
        nombre_etiqueta: 'asc'
      }
    });

    return NextResponse.json(etiquetas);
  } catch (error) {
    console.error("Error al obtener etiquetas:", error);
    return NextResponse.json({ error: "Error al cargar etiquetas" }, { status: 500 });
  }
}