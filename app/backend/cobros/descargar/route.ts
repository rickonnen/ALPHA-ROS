import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// 1. Instanciamos el cliente al inicio del archivo
const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const planIdString = searchParams.get('planId');

    // 2. Validación de entrada para evitar errores de parseInt
    if (!planIdString) {
      return NextResponse.json({ error: "Falta el ID del plan" }, { status: 400 });
    }

    const planId = parseInt(planIdString);

    // 3. Consulta directa a la tabla qrUrl usando PrismaClient
    // Buscamos por id_metodo que corresponde al ID del plan
    const qr = await prisma.qrUrl.findUnique({
      where: { id_metodo: planId }
    });

    if (!qr) {
      return NextResponse.json({ error: "QR no encontrado en la base de datos" }, { status: 404 });
    }

    // 4. Retornamos la propiedad 'url' que el frontend espera para el <img>
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