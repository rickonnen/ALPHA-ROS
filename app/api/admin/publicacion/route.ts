import { NextResponse } from "next/server";
import { getPlanesPublicacion } from "@/features/cobros/planes/getPlanesPublicacion";

export async function GET() {
  try {
    const planes = await getPlanesPublicacion();
    
    // Mapeamos para que el cliente reciba números y no objetos Decimal de Prisma
    const planesFormateados = planes.map((plan) => ({
      id_plan: plan.id_plan,
      nombre_plan: plan.nombre_plan ?? "Plan",
      precio_plan: Number(plan.precio_plan),
      cant_publicaciones: plan.cant_publicaciones ?? 0,
    }));

    return NextResponse.json(planesFormateados);
  } catch (error) {
    console.error("Error en API de planes:", error);
    return NextResponse.json({ error: "Error al obtener planes" }, { status: 500 });
  }
}