import { NextRequest, NextResponse } from "next/server";
import { saveVerificationCode } from "@/lib/verificationCodes";
import { enviarCodigoVerificacion } from "@/lib/email/emailService";

export async function POST(request: NextRequest) {
  try {
   const body = await request.json();
   const email = body.email as string;
   const nombre = body.nombre as string ?? "";

    if (!email) {
      return NextResponse.json({ error: "El correo es requerido" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    const { code } = await saveVerificationCode(normalizedEmail);
   await enviarCodigoVerificacion(normalizedEmail, code, nombre);

    return NextResponse.json({
      success: true,
      message: "Se ha enviado un código a tu correo electrónico",
    });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message || "Error al enviar el código" }, { status: 500 });
  }
}