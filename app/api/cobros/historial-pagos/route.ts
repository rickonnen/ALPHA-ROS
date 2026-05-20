import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const estado = req.nextUrl.searchParams.get("estado");
    const userId = req.nextUrl.searchParams.get("id_usuario");

    if (!userId || userId.trim() === "") {
      return NextResponse.json([]);
    }

    const pagos = await prisma.detallePago.findMany({
      where: {
        id_usuario: userId,
        ...(estado === "pendiente" && { estado: 1 }),
        ...(estado === "realizado" && { estado: 2 }),
        ...(estado === "rechazado" && { estado: 3 }),
      },
      include: {
        PlanPublicacion: true,
        Publicacion: {
          select: {
            titulo: true,
          },
        },
      },
      orderBy: {
        fecha_detalle: "desc",
      },
      take: 5,
    });

    return NextResponse.json(pagos);
  } catch {
    return NextResponse.json(
      { message: "Error al obtener pagos" },
      { status: 500 }
    );
  }
}