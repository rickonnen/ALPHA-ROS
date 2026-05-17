import { NextRequest, NextResponse } from "next/server";

import {
  getCachedPublicaciones,
  type SearchFiltersInput,
} from "../../../features/filter_search_page/services";

function toOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();


    const filters: SearchFiltersInput = {
      ...body,
      // CAPTURAMOS LAS CARACTERÍSTICAS: Convertimos a número para evitar errores de tipo
      caracteristicasIds: body.caracteristicasIds ? body.caracteristicasIds.map(Number) : undefined,
      
      // Mantenemos el arreglo de superficies
      minSurface: body.minSurface ? Number(body.minSurface) : (body.superficieMin ? Number(body.superficieMin) : undefined),
      maxSurface: body.maxSurface ? Number(body.maxSurface) : (body.superficieMax ? Number(body.superficieMax) : undefined),
      soloOfertas: Boolean(body.soloOfertas),
      sort: typeof body.sort === "string" ? body.sort : undefined,
    };

    // Llamamos al servicio 
    const publications = await getCachedPublicaciones(filters);

    return NextResponse.json({
      success: true,
      publications, 
      total: publications.length,
    });
  } catch (error) {
    console.error("Error en /api/filter_search_page:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No se pudo consultar las publicaciones",
      },
      { status: 500 },
    );
  }
}