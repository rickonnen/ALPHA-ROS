import { NextResponse } from "next/server";
import { prisma } from "@/features/filter_search_page/prismaClient";

export async function GET() {
  try {
    const caracteristicas = await prisma.caracteristica.findMany({
      where: {
        PublicacionCaracteristica: {
          some: {
            Publicacion: {
              id_estado: 1,
            },
          },
        },
      },
      orderBy: {
        nombre_caracteristica: "asc",
      },
      select: {
        id_caracteristica: true,
        nombre_caracteristica: true,
        _count: {
          select: {
            PublicacionCaracteristica: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      caracteristicas,
    });
  } catch (error) {
    console.error("Error al obtener características:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error al cargar características",
      },
      { status: 500 },
    );
  }
}