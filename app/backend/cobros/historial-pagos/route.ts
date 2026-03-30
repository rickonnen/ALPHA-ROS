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
    const userId = req.nextUrl.searchParams.get("id_usuario");

    if (!userId) {
      return NextResponse.json(
        { message: "id_usuario es requerido" },
        { status: 400 }
      );
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