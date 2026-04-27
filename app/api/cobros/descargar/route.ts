import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');
    const modalidad = searchParams.get("modalidad");

    if (!planId || !modalidad) {
      return NextResponse.json({ error: "Faltan parámetros (planId o modalidad)" }, { status: 400 });
    }

    // Buscamos en la tabla QrUrl usando la nueva estructura
    const qr = await (prisma.qrUrl as any).findFirst({
      where: {
        id_plan: parseInt(planId),
        modalidad: modalidad
      }
    });

    if (!qr) {
      return NextResponse.json({ error: "No se encontró un QR para este plan y modalidad" }, { status: 404 });
    }

    return NextResponse.json({ 
      url: qr.qr_URL 
    });

  } catch (error) {
    console.error("Error en GET QR:", error);
    return NextResponse.json(
      { error: "Error interno al recuperar el QR" }, 
      { status: 500 }
    );
  }
}