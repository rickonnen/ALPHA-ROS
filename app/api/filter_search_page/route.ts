import { NextRequest, NextResponse } from 'next/server';

import {
  getCachedPublicaciones,
  type SearchFiltersInput,
} from '../../../features/filter_search_page/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ESTO ES LO IMPORTANTE: Mirá tu terminal negra después de mover el slider
    console.log("DATOS REALES DEL FRONTEND:", body);

    const filters: SearchFiltersInput = {
      ...body,
      // ESTO ES LO QUE ARREGLA LA SUPERFICIE:
      minSurface: body.minSurface ? Number(body.minSurface) : (body.superficieMin ? Number(body.superficieMin) : undefined),
      maxSurface: body.maxSurface ? Number(body.maxSurface) : (body.superficieMax ? Number(body.superficieMax) : undefined),
    };

    const publications = await getCachedPublicaciones(filters);

    return NextResponse.json({
      success: true,
      publications,
      total: publications.length,
    });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}