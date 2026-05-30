// En app/api/perfil/sesiones/cerrar-todas/route.ts
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

export async function POST(req: NextRequest) {
  const id_usuario = await resolveUserId(req);
  if (!id_usuario) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const sessionIdActual = req.cookies.get("session_id")?.value ?? null;

  // Eliminar todas EXCEPTO la actual
  await prisma.sesionDispositivo.deleteMany({
    where: {
      id_usuario,
      ...(sessionIdActual ? { token_hash: { not: sessionIdActual } } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}