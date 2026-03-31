import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

//funcion no completada para descargar qr uwu
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const planIdString = searchParams.get('planId');

    if (!planIdString) {
      return NextResponse.json({ error: "Falta el ID del plan" }, { status: 400 });
    }

    const planId = parseInt(planIdString);

    const qr = await prisma.qrUrl.findUnique({
      where: { id_metodo: planId }
    });

    if (!qr) {
      return NextResponse.json({ error: "QR no encontrado en la base de datos" }, { status: 404 });
    }

    return NextResponse.json({ 
      url: qr.qr_URL 
    });

  } catch (error) {
    console.error("Error de Prisma en GET QR:", error);
    return NextResponse.json(
      { error: "Error interno al recuperar el recurso QR" }, 
      { status: 500 }
    );
  }
}