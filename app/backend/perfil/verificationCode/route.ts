import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createHash, randomInt } from "crypto";

const prisma = new PrismaClient();

const OTP_LENGTH = 6;
const OTP_EXP_SECONDS = 600;
const OTP_RESEND_SECONDS = 60;
const OTP_MAX_INTENTOS = 5;

function generarOtpNumerico(length: number): string {
  const min = 10 ** (length - 1);
  const max = 10 ** length;
  return String(randomInt(min, max));
}

function hashOtp(
  otpPlano: string,
  idUsuario: string,
  nuevoEmail: string,
  secret: string,
): string {
  return createHash("sha256")
    .update(`${otpPlano}|${idUsuario}|${nuevoEmail}|${secret}`)
    .digest("hex");
}

async function enviarCorreoBrevo(nuevoEmail: string, codigoOtp: string) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderName = process.env.BREVO_SENDER_NAME;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const templateIdRaw = process.env.BREVO_TEMPLATE_ID;

  const templateId = Number(templateIdRaw);

  if (!apiKey || !senderName || !senderEmail || !Number.isFinite(templateId)) {
    return {
      ok: false,
      reason: "MISSING_BREVO_ENV",
      message: "Faltan variables de entorno de Brevo",
    } as const;
  }

  const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: nuevoEmail }],
      templateId,
      params: { codigo: codigoOtp },
    }),
  });

  if (!resp.ok) {
    const errBody = await resp.text();
    console.error("Brevo send error:", errBody);
    return {
      ok: false,
      reason: "BREVO_SEND_FAILED",
      message: "No se pudo enviar el código OTP",
    } as const;
  }

  return { ok: true } as const;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_usuario, nuevo_email } = body ?? {};

    if (!id_usuario || !nuevo_email) {
      return NextResponse.json(
        {
          ok: false,
          reason: "MISSING_FIELDS",
          message: "Faltan campos id_usuario o nuevo_email",
        },
        { status: 400 },
      );
    }

    const strNuevoEmail = String(nuevo_email).trim().toLowerCase();
    const otpHashSecret = process.env.OTP_HASH_SECRET;

    if (!otpHashSecret) {
      return NextResponse.json(
        {
          ok: false,
          reason: "MISSING_OTP_SECRET",
          message: "Error interno del servidor",
        },
        { status: 500 },
      );
    }

    const [
      usuarioPublico,
      usuarioAuth,
      identidadGoogle,
      existeEnAuth,
      existeEnPublic,
    ] = await Promise.all([
      prisma.usuario.findUnique({
        where: { id_usuario },
        select: { id_usuario: true, email: true },
      }),
      prisma.users.findUnique({
        where: { id: id_usuario },
        select: { id: true, email: true },
      }),
      prisma.identities.findFirst({
        where: { user_id: id_usuario, provider: "google" },
        select: { id: true },
      }),
      prisma.users.findFirst({
        where: { email: strNuevoEmail, NOT: { id: id_usuario } },
        select: { id: true },
      }),
      prisma.usuario.findFirst({
        where: { email: strNuevoEmail, NOT: { id_usuario } },
        select: { id_usuario: true },
      }),
    ]);

    if (!usuarioPublico || !usuarioAuth) {
      return NextResponse.json(
        {
          ok: false,
          reason: "USER_NOT_FOUND",
          message: "Usuario no encontrado",
        },
        { status: 404 },
      );
    }

    if (identidadGoogle) {
      return NextResponse.json(
        {
          ok: false,
          reason: "GOOGLE_PROVIDER_BLOCKED",
          message:
            "No puedes cambiar el correo porque tu cuenta fue creada con un proveedor externo (Google).",
        },
        { status: 403 },
      );
    }

    const emailActual = (usuarioAuth.email ?? usuarioPublico.email ?? "")
      .trim()
      .toLowerCase();

    if (emailActual && emailActual === strNuevoEmail) {
      return NextResponse.json(
        {
          ok: false,
          reason: "SAME_EMAIL",
          message: "El nuevo correo no puede ser igual al actual",
        },
        { status: 400 },
      );
    }

    if (existeEnAuth || existeEnPublic) {
      return NextResponse.json(
        {
          ok: false,
          reason: "EMAIL_ALREADY_IN_USE",
          message: "El correo ya está registrado",
        },
        { status: 409 },
      );
    }

    const otpActivo = await prisma.otp_cambio_correo.findFirst({
      where: {
        id_usuario,
        nuevo_email: strNuevoEmail,
        consumido: false,
      },
      orderBy: { creado_en: "desc" },
      select: {
        id_otp: true,
        reenviar_desde: true,
      },
    });

    const ahora = new Date();

    if (otpActivo && otpActivo.reenviar_desde > ahora) {
      const waitSec = Math.ceil(
        (otpActivo.reenviar_desde.getTime() - ahora.getTime()) / 1000,
      );

      return NextResponse.json(
        {
          ok: false,
          reason: "OTP_COOLDOWN",
          message: `Debes esperar ${waitSec}s para reenviar código`,
          resendAfterSec: waitSec,
        },
        { status: 429 },
      );
    }

    const codigoOtp = generarOtpNumerico(OTP_LENGTH);
    const otpHash = hashOtp(
      codigoOtp,
      id_usuario,
      strNuevoEmail,
      otpHashSecret,
    );
    const expiraEn = new Date(ahora.getTime() + OTP_EXP_SECONDS * 1000);
    const reenviarDesde = new Date(ahora.getTime() + OTP_RESEND_SECONDS * 1000);

    const nuevoRegistro = await prisma.$transaction(async (tx) => {
      await tx.otp_cambio_correo.updateMany({
        where: {
          id_usuario,
          nuevo_email: strNuevoEmail,
          consumido: false,
        },
        data: {
          consumido: true,
          actualizado_en: ahora,
        },
      });

      return tx.otp_cambio_correo.create({
        data: {
          id_usuario,
          nuevo_email: strNuevoEmail,
          otp_hash: otpHash,
          expira_en: expiraEn,
          reenviar_desde: reenviarDesde,
          intentos: 0,
          max_intentos: OTP_MAX_INTENTOS,
          consumido: false,
          actualizado_en: ahora,
        },
        select: { id_otp: true },
      });
    });

    const envio = await enviarCorreoBrevo(strNuevoEmail, codigoOtp);

    if (!envio.ok) {
      await prisma.otp_cambio_correo.update({
        where: { id_otp: nuevoRegistro.id_otp },
        data: { consumido: true, actualizado_en: new Date() },
      });

      return NextResponse.json(
        {
          ok: false,
          reason: envio.reason,
          message: envio.message,
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Código OTP enviado correctamente",
        expiresInSec: OTP_EXP_SECONDS,
        resendAfterSec: OTP_RESEND_SECONDS,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error al enviar OTP de cambio de correo:", error);
    return NextResponse.json(
      {
        ok: false,
        reason: "INTERNAL_ERROR",
        message: "aqui fallo",
      },
      { status: 500 },
    );
  }
}