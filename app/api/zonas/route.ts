import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ZoneCoordinatePair = [number, number];

function isValidCoordinatePair(value: unknown): value is ZoneCoordinatePair {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number" &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  );
}

export async function GET() {
  try {
    const zonas = await prisma.zona.findMany({
      select: {
        id_zona: true,
        nombre_zona: true,
        id_ciudad: true,
        coordenadas: true,
      },
      orderBy: [{ id_ciudad: "asc" }, { nombre_zona: "asc" }],
    });

    const data = zonas
      .map((zona) => {
        if (!Array.isArray(zona.coordenadas)) return null;
        if (!zona.coordenadas.every(isValidCoordinatePair)) return null;

        return {
          id_zona: zona.id_zona,
          nombre_zona: zona.nombre_zona ?? "Zona sin nombre",
          id_ciudad: zona.id_ciudad ?? null,
          coordenadas: zona.coordenadas,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error al obtener zonas predeterminadas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
