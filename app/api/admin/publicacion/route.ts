import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET (Ya lo tienes, asegúrate de incluir 'activo' y 'tipo')
export async function GET() {
  try {
    const planes = await prisma.planPublicacion.findMany({
      orderBy: { precio_plan: "asc" },
    });
    
    const planesFormateados = planes.map((plan) => ({
      ...plan,
      precio_plan: Number(plan.precio_plan),
    }));

    return NextResponse.json(planesFormateados);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener planes" }, { status: 500 });
  }
}

// PATCH para actualizar el plan
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id_plan, ...data } = body;

    const planActualizado = await prisma.planPublicacion.update({
      where: { id_plan: Number(id_plan) },
      data: {
        nombre_plan: data.nombre_plan,
        precio_plan: data.precio_plan,
        cant_publicaciones: data.cant_publicaciones,
        activo: data.activo,
        // El campo 'tipo' se mantiene según la pestaña
      },
    });

    return NextResponse.json(planActualizado);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar el plan" }, { status: 500 });
  }
}