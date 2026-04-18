/* Funcionalidad: POST /api/cobros/suscripcion-actual
    - Recibe el id_usuario y busca su plan actual en el modelo Suscripcion
*/
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_usuario } = body;

    if (!id_usuario) {
      return NextResponse.json({ id_plan: 7 }, { status: 200 });
    }

    // Buscamos en el modelo Suscripcion (PascalCase como en tu schema)
    const suscripcion = await prisma.suscripcion.findUnique({
      where: { 
        id_usuario: id_usuario 
      },
      select: { 
        id_plan: true 
      }
    });

    return NextResponse.json(
      { id_plan: suscripcion?.id_plan ?? 7 },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error al obtener suscripción:", error);
    return NextResponse.json(
      { error: "Error interno", id_plan: 7 },
      { status: 500 }
    );
  }
}