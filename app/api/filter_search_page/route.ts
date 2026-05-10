import { NextRequest, NextResponse } from 'next/server';
import {
  getCachedPublicaciones,
  type SearchFiltersInput,
} from '../../../features/filter_search_page/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Armamos el objeto de filtros para enviarlo al service
    const filters: SearchFiltersInput = {
      ...body,
      // CAPTURAMOS LAS CARACTERÍSTICAS: Convertimos a número para evitar errores de tipo
      caracteristicasIds: body.caracteristicasIds ? body.caracteristicasIds.map(Number) : undefined,
      
      // Mantenemos el arreglo de superficies
      minSurface: body.minSurface ? Number(body.minSurface) : (body.superficieMin ? Number(body.superficieMin) : undefined),
      maxSurface: body.maxSurface ? Number(body.maxSurface) : (body.superficieMax ? Number(body.superficieMax) : undefined),
    };

    // Llamamos al servicio 
    const publications = await getCachedPublicaciones(filters);

    return NextResponse.json({
      success: true,
      publications, 
      total: publications.length,
    });
  } catch (error) {
    console.error("ERROR EN API SEARCH:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}