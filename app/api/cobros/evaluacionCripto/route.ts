import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { paymentId, userId, nuevoEstado, planId } = await req.json();

    // Aceptado = 2, Rechazado = 3
    let estadocrip = 1; 

    //por si el rodri se wasea y pueda poner eso o el numero xdxdxdxdxddxdxxddxxdxdd
    if (nuevoEstado === "finished" || nuevoEstado === 2 || nuevoEstado === "2") {
      estadocrip = 2;
    } else if (nuevoEstado === "failed" || nuevoEstado === "partially_paid" || nuevoEstado === 3 || nuevoEstado === "3") {
      estadocrip = 3;
    }

    const resultado = await prisma.detallePago.create({
      data: {
        id_plan: planId,
        id_cripto: paymentId,
        id_usuario: userId,
        estado: estadocrip,
        metodo_pago: "Transferencia virtual",
        fecha_detalle: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      mensaje: "Registro creado y validado exitosamente",
      data: resultado
    });

  } catch (error) {
    console.error("Error al crear detalle de pago:", error);
    return NextResponse.json(
      { error: "No se pudo crear el registro. Verifica que el userId sea válido." }, 
      { status: 500 }
    );
  }
}