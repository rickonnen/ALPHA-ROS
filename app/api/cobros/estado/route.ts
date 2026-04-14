import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Asegúrate de que la ruta a tu cliente de prisma sea correcta

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Falta el ID de usuario" }, { status: 400 });
    }

    const pagoPendiente = await prisma.detallePago.findFirst({
      where: {
        id_usuario: userId,
        estado: 1, 
      },
    });

    // Si encuentra algo, devolvemos el estado 1, si no, devolvemos null
    return NextResponse.json({ 
      estado: pagoPendiente ? pagoPendiente.estado : null,
      tienePendientes: !!pagoPendiente 
    });

  } catch (error) {
    console.error("Error en API de estado de cobro:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}