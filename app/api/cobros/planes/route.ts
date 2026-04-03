import { NextResponse } from 'next/server';
import { getPlanesPublicacion } from '@/features/cobros/planes/getPlanesPublicacion';

export async function GET() {
  try {
    const planes = await getPlanesPublicacion();
    
    return NextResponse.json(planes, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error("Error al obtener los planes:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los planes de publicación." }, 
      { status: 500 }
    );
  }
}