// En app/api/perfil/sesiones/route.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { verify } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function resolveUserId(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return session.user.id;
  }

  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return null;
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const id_usuario = await resolveUserId(req);
  if (!id_usuario) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const sessionIdActual = req.cookies.get("session_id")?.value ?? null;

  const sesiones = await prisma.sesionDispositivo.findMany({
    where: { id_usuario },
    orderBy: { ultimo_acceso: "desc" },
  });

  const resultado = sesiones.map((s) => ({
    ...s,
    es_actual: sessionIdActual ? s.token_hash === sessionIdActual : false,
  }));

  return NextResponse.json({ data: resultado });
}