import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

//funcion para verificar el pago para el admin poder ver
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_usuario, id_plan } = body;
    const planIdNumeric = parseInt(id_plan.toString());

    if (!id_usuario || !id_plan) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const pagoExistente = await prisma.detallePago.findFirst({
      where: {
        id_usuario: id_usuario,
        id_plan: planIdNumeric,
        estado: 1 // 1 = Pendiente
      }
    });
    //si el usuario le da segundo click al boton aparece aca
    if (pagoExistente) {
      return NextResponse.json({
        titulo: "Verificando Pago",
        mensaje: "El pago se esta procesando, esto puede durar algunas horas"
      });
    }

    await prisma.detallePago.create({
      data: {
        id_plan: planIdNumeric,
        id_usuario: id_usuario,
        estado: 1,
        metodo_pago: "Transferencia QR",
        fecha_detalle: new Date()
      }
    });

    return NextResponse.json({
      titulo: "Verificando Pago",
      mensaje: "El pago se esta procesando, esto puede durar algunas horas"
    });

  } catch (error: any) {
    console.error("Error de Prisma en Verificar:", error);
    return NextResponse.json(
      { error: "Error interno al registrar el intento de pago" }, 
      { status: 500 }
    );
  }
}