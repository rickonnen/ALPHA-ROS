import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_usuario, id_plan } = body;

    // INSERTAR DIRECTO: No preguntamos si ya existe.
    // Esto permite que si Diego sale y entra otra vez, se cree una NUEVA fila.
    await prisma.detallePago.create({
      data: {
        id_plan: parseInt(id_plan.toString()),
        id_usuario: id_usuario,
        estado: 1, // Pendiente
        metodo_pago: "Transferencia QR",
        fecha_detalle: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      mensaje: "Tu pago se está procesando correctamente"
    });
  } catch (error) {
    return NextResponse.json({ error: "Error al registrar" }, { status: 500 });
  }
}