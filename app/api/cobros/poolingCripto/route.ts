import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const desde = searchParams.get("desde"); 

  if (!userId || !desde) return NextResponse.json({ estado: 1 });

  const ultimoPago = await prisma.detallePago.findFirst({
    where: {
      id_usuario: userId,
      estado: { in: [2, 3] },
      fecha_detalle: { gte: new Date(desde) },
      metodo_pago: "Transferencia virtual"
    },
    orderBy: { fecha_detalle: 'desc' }
  });

  return NextResponse.json({ estado: ultimoPago ? ultimoPago.estado : 1 });
}