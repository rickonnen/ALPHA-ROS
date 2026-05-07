import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { paymentId, nuevoEstado } = await req.json();

    // Actualizamos usando el nombre exacto de tu modelo: detallePago
    const pagoActualizado = await prisma.detallePago.update({
      where: {
        externalId: paymentId,
      },
      data: {
        status: nuevoEstado, // Columna donde guardaremos "finished", "failed"
      },
    });

    return NextResponse.json({
      success: true,
      mensaje: `Simulación completada: El pago ahora está en ${nuevoEstado}`,
      data: pagoActualizado
    });

  } catch (error) {
    console.error("Error en la simulación con Prisma:", error);
    return NextResponse.json({ error: "No se pudo actualizar el estado del pago" }, { status: 500 });
  }
}