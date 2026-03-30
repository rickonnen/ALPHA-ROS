import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

//para poder agregar automaticamente la descripcion, qr y precio a cobros 
const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const planIdString = searchParams.get('planId');

    if (!planIdString) {
      return NextResponse.json({ error: "Falta el ID del plan" }, { status: 400 });
    }

    const planId = parseInt(planIdString);

    const plan = await prisma.planPublicacion.findUnique({
      where: { id_plan: planId }
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      nombre: plan.nombre_plan,
      total: Number(plan.precio_plan), // Conversión de Decimal a Number
      descripcion: `Este plan incluye +${plan.cant_publicaciones} cupos de publicación para tus inmuebles`
    });

  } catch (error) {
    console.error("Error en Prisma GET Planes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al consultar el plan" }, 
      { status: 500 }
    );
  }
}