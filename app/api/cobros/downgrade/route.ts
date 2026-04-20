import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { id_usuario, nuevo_plan_id, modalidad } = await req.json();

    if (!id_usuario || !nuevo_plan_id || !modalidad) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    // Actualizamos la suscripción en la base de datos
    const suscripcionActualizada = await prisma.suscripcion.update({
      where: {
        id_usuario: id_usuario,
      },
      data: {
        id_plan: Number(nuevo_plan_id),
        modalidad: modalidad,
        // Opcional: podrías resetear fechas o estados aquí si fuera necesario
      },
    });

    return NextResponse.json({
      success: true,
      message: "Plan actualizado correctamente",
      data: suscripcionActualizada,
    });
  } catch (error) {
    console.error("Error en el downgrade:", error);
    return NextResponse.json(
      { error: "No se pudo procesar el cambio de plan" },
      { status: 500 }
    );
  }
}