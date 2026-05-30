import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { verify } from "jsonwebtoken";
import { registrarSesionDispositivo } from "@/lib/sesion-dispositivo";

async function resolveUserId(req: NextRequest) {
  // Intentar con next-auth (Google, Discord, etc)
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return session.user.id;
  }

  // Si no, intentar con JWT (Credentials)
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
  try {
    const id_usuario = await resolveUserId(req);
    if (!id_usuario) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const sessionId = req.cookies.get("session_id")?.value ?? "";
    const userAgent = req.headers.get("user-agent");
    const ip = req.headers.get("x-forwarded-for") || 
               req.headers.get("x-client-ip") || 
               "unknown";

    await registrarSesionDispositivo({
      id_usuario,
      token_hash: sessionId,
      ip,
      user_agent: userAgent,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[REGISTRAR-SESION] Error:", error);
    return NextResponse.json(
      { error: "Error registrando sesión" },
      { status: 500 }
    );
  }
}
