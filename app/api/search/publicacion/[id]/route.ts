/**
 * @Dev: [Equipo]  
 * @Fecha: 2026-04-07
 * @Descripción: Endpoint para obtener detalle de publicación
 * GET /api/search/publicacion/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { obtenerDetallePublicacion } from '@/features/search/obtener-detalle';
import { PublicacionDetalleBusqueda } from '@/features/search/search-services';

interface ApiResponse {
  ok: boolean;
  datos?: PublicacionDetalleBusqueda;
  mensaje?: string;
  error?: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id: idString } = await params;
    const id = Number(idString);

    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'INVALID_ID',
          mensaje: 'ID inválido',
        },
        { status: 400 }
      );
    }

    const publicacion = await obtenerDetallePublicacion(id);

    if (!publicacion) {
      return NextResponse.json(
        {
          ok: false,
          error: 'NOT_FOUND',
          mensaje: 'Publicación no encontrada',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        datos: publicacion,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Error en GET /api/search/publicacion/[id]:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'INTERNAL_ERROR',
        mensaje: 'Error al obtener publicación',
      },
      { status: 500 }
    );
  }
}
