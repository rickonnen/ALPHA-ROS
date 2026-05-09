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

    console.log("DATOS REALES DEL FRONTEND:", body);

    const filters: SearchFiltersInput = {
      ...body,

      minPrice: toOptionalNumber(body.minPrice),
      maxPrice: toOptionalNumber(body.maxPrice),

      minSurface:
        toOptionalNumber(body.minSurface) ??
        toOptionalNumber(body.superficieMin),

      maxSurface:
        toOptionalNumber(body.maxSurface) ??
        toOptionalNumber(body.superficieMax),

      soloOfertas: Boolean(body.soloOfertas),
      sort: typeof body.sort === "string" ? body.sort : undefined,
    };

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