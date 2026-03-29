import { NextResponse } from 'next/server';
import { obtenerDetallesDelPlanBD } from '@/app/backend/cobros/cobros-plataforma/cobros.service'; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const planId = searchParams.get('planId');

  if (!planId) {
    return NextResponse.json({ error: "Falta el ID del plan" }, { status: 400 });
  }

  try {
    // LLAMADA REAL A BASE DE DATOS
    const detalles = await obtenerDetallesDelPlanBD(parseInt(planId));

    if (!detalles) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }

    return NextResponse.json(detalles);
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}