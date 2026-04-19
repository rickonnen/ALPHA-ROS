import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id_usuario = searchParams.get("id_usuario");

    console.log("ID recibido:", id_usuario);

    if (!id_usuario) {
      return NextResponse.json({ error: "no hay id usuario" }, { status: 400 });
    }

    const suscripcion = await prisma.suscripcion.findUnique({
      where: { id_usuario },
      include: {
        PlanPublicacion: {
          select: {
            nombre_plan: true,
            cant_publicaciones: true
          }
        }
      }
    });

    return NextResponse.json({
      nombre_plan: suscripcion?.PlanPublicacion?.nombre_plan ?? null,
      cant_publicaciones: suscripcion?.PlanPublicacion?.cant_publicaciones ?? null,
      modalidad: suscripcion?.modalidad ?? null,
      fecha_inicio: suscripcion?.fecha_inicio ?? null,
      fecha_fin: suscripcion?.fecha_fin ?? null
    });

  } catch (error) {
    console.error("Error API Suscripción:", error);
    return NextResponse.json(
      { error: "Error interno de route al obtener la suscripción" },
      { status: 500 }
    );
  }
}