import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const estado = req.nextUrl.searchParams.get("estado");

    const pagos = await prisma.detallePago.findMany({
      ...(estado && {
        where: {
          estado: estado === "pendiente" ? 0 : 1,
        },
      }),
      orderBy: {
        fecha_detalle: "desc",
      },
    });

    return NextResponse.json(pagos);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Error al obtener pagos" },
      { status: 500 }
    );
  }
}