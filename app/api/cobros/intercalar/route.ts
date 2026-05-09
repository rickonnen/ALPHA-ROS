import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { paymentId, nuevoEstado } = await req.json();

    // Aceptado = 2, Rechazado = 3
    let estadocrip = 1; 

    //por si el rodri se wasea y pueda poner eso o el numero xdxdxdxdxddxdxxddxxdxdd
    if (nuevoEstado === "finished" || nuevoEstado === 2 || nuevoEstado === "2") {
      estadocrip = 2;
    } else if (nuevoEstado === "failed" || nuevoEstado === "partially_paid" || nuevoEstado === 3 || nuevoEstado === "3") {
      estadocrip = 3;
    }

    const resultado = await prisma.detallePago.updateMany({
      where: {
        id_cripto: paymentId, 
      },
      data: {
        estado: estadocrip,
      },
    });

    // Verificamos si realmente se actualizó algo
    if (resultado.count === 0) {
      return NextResponse.json(
        { error: "No se encontró ningún pago con ese id_cripto" }, 
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      mensaje: `Simulación completada: Se actualizaron ${resultado.count} registro(s) al estado ${estadocrip}`,
      // Nota: updateMany devuelve { count: X }, no el objeto actualizado
      data: resultado 
    });

  } catch (error) {
    console.error("Error en la simulación con updateMany:", error);
    return NextResponse.json(
      { error: "Error interno al intentar actualizar" }, 
      { status: 500 }
    );
  }
}