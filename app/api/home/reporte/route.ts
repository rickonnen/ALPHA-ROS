import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @Dev: Rodrigo Chalco
 * POST /api/home/reporte
 */

export async function POST(objRequest: NextRequest) {
  try {
    const { lugar, operacion } = await objRequest.json();

    if (!lugar || !operacion) return NextResponse.json({ ok: true });

    // Limpia el texto de Mapbox correctamente
    const strDepartamento = lugar
      .replace(/Departamento de\s*/i, "")
      .replace(/,.*$/, "")
      .trim();

    if (!strDepartamento) return NextResponse.json({ ok: true });

    const arrValidOps = ["venta", "alquiler", "anticretico"];
    if (!arrValidOps.includes(operacion)) return NextResponse.json({ ok: true });

    await prisma.$executeRawUnsafe(
      `UPDATE "ReporteInmuebles" 
       SET "${operacion}" = "${operacion}" + 1 
       WHERE LOWER(departamento) = LOWER($1)`,
      strDepartamento
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}