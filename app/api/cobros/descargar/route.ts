import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const planIdString = searchParams.get('planId');
    const modalidad = searchParams.get("modalidad"); 

    if (!planIdString) {
      return NextResponse.json({ error: "Falta el ID del plan" }, { status: 400 });
    }

    const planId = parseInt(planIdString);
    let idMetodoReal = 0;

    if (planId === 1) { // Estándar
      idMetodoReal = modalidad === "anual" ? 4 : 1;
    } else if (planId === 2) { // Avanzado
      idMetodoReal = modalidad === "anual" ? 5 : 2;
    } else if (planId === 3) { // Profesional
      idMetodoReal = modalidad === "anual" ? 6 : 3;
    }

    if (idMetodoReal === 0) {
      return NextResponse.json({ error: "Configuración de plan no válida" }, { status: 400 });
    }

    const qr = await prisma.qrUrl.findUnique({
      where: { id_metodo: idMetodoReal } 
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