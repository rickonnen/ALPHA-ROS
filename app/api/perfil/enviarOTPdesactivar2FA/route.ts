import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveVerificationCode } from "@/lib/verificationCodes";
import { enviarCodigoVerificacion } from "@/lib/email/emailService";

export async function POST(request: NextRequest) {
  try {
    const { id_usuario } = await request.json();

    if (!id_usuario) {
      return NextResponse.json({ error: "Parámetros incompletos" }, { status: 400 });
    }

    const usuario = await (prisma.usuario.findUnique as any)({
      where: { id_usuario },
      select: { email: true, nombres: true, google_id: true },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (!usuario.google_id) {
      return NextResponse.json({ error: "Este endpoint es solo para cuentas de Google" }, { status: 400 });
    }

    const { code } = await saveVerificationCode(usuario.email.toLowerCase());
    await enviarCodigoVerificacion(usuario.email.toLowerCase(), code, usuario.nombres ?? "");

    return NextResponse.json({ success: true, message: "Código enviado a tu correo" });

  } catch (error) {
    console.error("[OTP DESACTIVAR 2FA] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}