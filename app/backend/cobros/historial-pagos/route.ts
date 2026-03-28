/**
 * dev: Kevin isnado
 * ultima modif: 27/03/2025 - horas: 12 pm
 * descripcion: endpoint del backend / encarga de obtener y devolver el historial de pagos del usuario desde la base de datos
 */

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const estado = req.nextUrl.searchParams.get("estado");
    const userId = "d4c4d9c0-ded9-4186-890e-a9f19fd67d5e"; //usuario id puesto manuelamente 
    const pagos = await prisma.detallePago.findMany({
      where: {
        id_usuario: userId,
        ...(estado === "pendiente" && {
          estado: 1,
        }),
        ...(estado === "realizado" && {
          estado: 2,
        }),
        ...(estado === "rechazado" && {
          estado: 3,
        }),
      },
      include: {
        PlanPublicacion: true,
      },
      orderBy: {
        fecha_detalle: "desc",
      },
    });
    return NextResponse.json(pagos);
  } catch (error) {
    return NextResponse.json(
      { message: "Error al obtener pagos" },
      { status: 500 }
    );
  }
}