import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');
    const modalidad = searchParams.get("modalidad");

    if (!planId) {
      return NextResponse.json({ error: "Falta el parámetro planId" }, { status: 400 });
    }

    // Buscamos en la tabla QrUrl usando la nueva estructura
    const modalidadDb = (modalidad === "unico" || modalidad === "null") ? null : modalidad;

    const qr = await (prisma.qrUrl as any).findFirst({
      where: {
        id_plan: parseInt(planId),
        modalidad: modalidadDb
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