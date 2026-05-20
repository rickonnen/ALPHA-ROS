// HU-05: API para SOLICITAR reactivación de cuenta (envía email a soporte)
// Esta ruta NO modifica la base de datos. Solo envía emails.
// La activación real la hace soporte desde el panel de admin.
import { NextRequest, NextResponse } from "next/server";
import { sendGenericEmail } from "@/lib/email/emailService";
import { templateSolicitudReactivacion } from "@/lib/email/templates/solicitudReactivacion";
import { templateConfirmacionSolicitudReactivacion } from "@/lib/email/templates/confirmacionSolicitudReactivacion";
import { prisma } from "@/lib/prisma";

const SOPORTE_EMAIL = "soportepropbol@gmail.com";
const COOLDOWN_MS = 15 * 60 * 1000; // 15 minutos por email

// Rate limit en memoria: email → timestamp del último envío
const ultimoEnvio = new Map<string, number>();

// Validación básica de email
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, tipoCuenta, motivo } = body;

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
    // Límite por email
    const emailKey = email.trim().toLowerCase();
    const ahora = Date.now();
    const ultimaVez = ultimoEnvio.get(emailKey);

    if (ultimaVez) {
      const transcurrido = ahora - ultimaVez;
      if (transcurrido < COOLDOWN_MS) {
        const minutosRestantes = Math.ceil((COOLDOWN_MS - transcurrido) / 60000);
        return NextResponse.json(
          {
            error: `Ya enviaste una solicitud para este correo. Espera ${minutosRestantes} minuto${minutosRestantes !== 1 ? "s" : ""} antes de reenviar.`,
            code: "RATE_LIMIT",
            minutosRestantes,
          },
          { status: 429 }
        );
      }
    }

    // VALIDACIÓN DE ESTADO EN BD
const usuario = await prisma.usuario.findFirst({
  where: { email: { equals: emailKey, mode: "insensitive" } },
  select: { estado: true },
});

if (!usuario) {
  return NextResponse.json(
    {
      error: "Este correo no está asociado a ninguna cuenta en PROPBOL.",
      code: "EMAIL_NOT_FOUND",
    },
    { status: 404 }
  );
}

if (usuario.estado === 1) {
  return NextResponse.json(
    {
      error: "Esta cuenta ya está activa. Puedes iniciar sesión directamente.",
      code: "ACCOUNT_ALREADY_ACTIVE",
    },
    { status: 409 }
  );
}

// SANITIZACIÓN DEL MOTIVO
const motivoRaw = motivo?.trim() || "";
const motivoLimpio = motivoRaw
  .replace(/<[^>]*>/g, "")
  .replace(/javascript\s*:/gi, "")
  .replace(/on\w+\s*=/gi, "")
  .replace(/(['";])\s*(--|#|\/\*)/g, "")
  .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC|UNION|CAST|CONVERT)\b/gi, "")
  .trim();

if (motivoLimpio.length > 500) {
  return NextResponse.json(
    { error: "El motivo no puede superar los 500 caracteres.", code: "MOTIVO_TOO_LONG" },
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

    // Enviar email a soporte con todos los datos
    const emailSoporte = await sendGenericEmail(
      SOPORTE_EMAIL,
      `[REACTIVACIÓN] Solicitud de ${email}`,
      templateSolicitudReactivacion(
        email.trim(),
        tipoCuenta,
        motivoLimpio,
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

    // Registrar el envío SOLO si el email a soporte fue exitoso
    ultimoEnvio.set(emailKey, ahora);

    // Enviar email de confirmación al usuario
    await sendGenericEmail(
      email.trim(),
      "Solicitud de reactivación recibida - PROPBOL",
      templateConfirmacionSolicitudReactivacion(email.trim())
    );

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