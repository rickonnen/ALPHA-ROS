import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const tipos = await prisma.tipoPuntoInteres.findMany({
      orderBy: { nombre: "asc" },
      select: {
        id_tipo_poi: true,
        nombre: true,
        icono: true,
        color: true,
      },
    })

    return NextResponse.json({ data: tipos })
  } catch (error) {
    console.error("Error al obtener tipos de punto de interés:", error)
    return NextResponse.json(
      { error: "No se pudieron obtener los tipos de punto de interés." },
      { status: 500 },
    )
  }
}
