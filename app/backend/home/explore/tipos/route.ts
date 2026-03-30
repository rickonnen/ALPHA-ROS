import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const data = await prisma.$queryRaw`SELECT * FROM get_total_por_tipo_inmueble()`;
    const serialized = JSON.parse(
      JSON.stringify(data, (_, value) =>
        typeof value === "bigint" ? Number(value) : value
      )
    );
    return NextResponse.json({ data: serialized }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener tipos de inmueble:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}