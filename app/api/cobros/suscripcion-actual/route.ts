import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_usuario } = body;

    if (!id_usuario) {
      return NextResponse.json({ id_plan: 7, modalidad: "mensual" }, { status: 200 });
    }

    const suscripcion = await prisma.suscripcion.findUnique({
      where: { id_usuario: id_usuario },
      select: { 
        id_plan: true,
        modalidad: true 
      }
    });

    return NextResponse.json(
      { 
        id_plan: suscripcion?.id_plan ?? 7, 
        modalidad: suscripcion?.modalidad ?? "mensual" 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error API Suscripción:", error);
    return NextResponse.json(
      { error: "Error interno", id_plan: 7, modalidad: "mensual" },
      { status: 500 }
    );
  }
}