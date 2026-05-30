import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { id_usuario } = await req.json();

    if (!id_usuario) {
      return NextResponse.json({ error: "Falta id_usuario" }, { status: 400 });
    }
    
    console.log("id usuario recibido:", id_usuario);    

    await prisma.$transaction([

      prisma.suscripcion.update({
        where: { id_usuario },
        data: { id_plan: 7 },
      }),
      prisma.publicacion.updateMany({
        where: { 
          id_usuario,
          gratuito: false
        },
        data: { id_estado: 4 },
      }),
    ]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error al cancelar suscripción:", error);
    return NextResponse.json(
        { error: "Error interno de route al cancelar la suscripción" }, 
        { status: 500 });
  }
}