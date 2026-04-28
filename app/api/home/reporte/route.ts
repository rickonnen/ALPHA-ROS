import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(objRequest: NextRequest) {
  try {
    const { lugar, operacion } = await objRequest.json();

    if (!lugar || !operacion) return NextResponse.json({ ok: true });

    // Extrae el departamento del texto de Mapbox
    const strDepartamento = lugar.includes("Departamento de")
      ? lugar.split("Departamento de").pop()?.trim()
      : lugar.trim();

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
    // Si falla no importa, no afecta la búsqueda
    return NextResponse.json({ ok: true });
  }
}