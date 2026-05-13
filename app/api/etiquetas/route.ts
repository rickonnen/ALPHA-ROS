import { NextResponse } from "next/server";
import { prisma } from "@/features/filter_search_page/prismaClient";

export async function GET() {
  try {
    const caracteristicas = await prisma.caracteristica.findMany({
      orderBy: {
        nombre_caracteristica: "asc",
      },
    });

    return NextResponse.json(caracteristicas);
  } catch (error) {
    console.error("Error al obtener características:", error);
    return NextResponse.json(
      { error: "Error al cargar características" },
      { status: 500 }
    );
  }
}