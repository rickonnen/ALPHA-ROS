// HU-05: API para SOLICITAR reactivación de cuenta (envía email a soporte)
// ⚠️ Esta ruta NO modifica la base de datos. Solo envía emails.
// La activación real la hace soporte desde el panel de admin.
import { NextRequest, NextResponse } from "next/server";
import { sendGenericEmail } from "@/lib/email/emailService";
import { templateSolicitudReactivacion } from "@/lib/email/templates/solicitudReactivacion";
import { templateConfirmacionSolicitudReactivacion } from "@/lib/email/templates/confirmacionSolicitudReactivacion";

const SOPORTE_EMAIL = "soportepropbol@gmail.com";

// Validación básica de email
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, tipoCuenta, motivo } = body;

    // CA-5 y CA-6: Validar campo email
    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "El correo electrónico es obligatorio.", code: "EMAIL_REQUIRED" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "El formato del correo electrónico no es válido.", code: "EMAIL_INVALID" },
        { status: 400 }
      );
    }

    if (!tipoCuenta || !tipoCuenta.trim()) {
      return NextResponse.json(
        { error: "El tipo de cuenta es obligatorio.", code: "TIPO_REQUIRED" },
        { status: 400 }
      );
    }

    const fechaSolicitud = new Date().toLocaleString("es-BO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // CA-10: Enviar email a soporte con todos los datos
    const emailSoporte = await sendGenericEmail(
      SOPORTE_EMAIL,
      `[REACTIVACIÓN] Solicitud de ${email}`,
      templateSolicitudReactivacion(
        email.trim(),
        tipoCuenta,
        motivo?.trim() || "",
        fechaSolicitud
      )
    );

    if (!emailSoporte.success) {
      console.error("[HU-05] Error enviando email a soporte:", emailSoporte.error);
      return NextResponse.json(
        { error: "Error al enviar la solicitud. Intenta nuevamente.", code: "EMAIL_SEND_ERROR" },
        { status: 500 }
      );
    }

    // CA-9: Enviar email de confirmación al usuario
    await sendGenericEmail(
      email.trim(),
      "Solicitud de reactivación recibida - PROPBOL",
      templateConfirmacionSolicitudReactivacion(email.trim())
    );
    // No bloqueamos si este falla — soporte ya recibió el principal

    return NextResponse.json({
      success: true,
      message: "Solicitud enviada correctamente. Recibirás respuesta en máximo 24 horas.",
    });

  } catch (error) {
    console.error("[HU-05] Error en solicitar-reactivacion:", error);
    return NextResponse.json(
      { error: "Error interno del servidor. Intenta nuevamente.", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}