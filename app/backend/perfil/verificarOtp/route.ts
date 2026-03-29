import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();
const OTP_LENGTH = 6;

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_usuario, nuevo_email, otp } = body ?? {};

    if (!id_usuario || !nuevo_email || !otp) {
      return NextResponse.json(
        {
          ok: false,
          reason: "MISSING_FIELDS",
          message: "Faltan campos id_usuario, nuevo_email u otp",
        },
        { status: 400 },
      );
    }

    const strNuevoEmail = String(nuevo_email).trim().toLowerCase();
    const strOtp = String(otp).replace(/\D/g, "");

    if (strOtp.length !== OTP_LENGTH) {
      return NextResponse.json(
        {
          ok: false,
          reason: "OTP_FORMAT_INVALID",
          message: "El código OTP debe tener 6 dígitos",
        },
        { status: 400 },
      );
    }

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

    const registro = await prisma.otp_cambio_correo.findFirst({
      where: {
        id_usuario,
        nuevo_email: strNuevoEmail,
        consumido: false,
      },
      orderBy: { creado_en: "desc" },
    });

    if (!registro) {
      return NextResponse.json(
        {
          ok: false,
          reason: "OTP_NOT_FOUND",
          message: "No existe un código OTP activo para este correo",
        },
        { status: 404 },
      );
    }

    const ahora = new Date();

    if (registro.expira_en <= ahora) {
      await prisma.otp_cambio_correo.update({
        where: { id_otp: registro.id_otp },
        data: {
          consumido: true,
          actualizado_en: ahora,
        },
      });

      return NextResponse.json(
        {
          ok: false,
          reason: "OTP_EXPIRED",
          message: "El código OTP expiró",
        },
        { status: 410 },
      );
    }

    if (registro.intentos >= registro.max_intentos) {
      await prisma.otp_cambio_correo.update({
        where: { id_otp: registro.id_otp },
        data: {
          consumido: true,
          actualizado_en: ahora,
        },
      });

      return NextResponse.json(
        {
          ok: false,
          reason: "OTP_MAX_ATTEMPTS",
          message: "Superaste el número máximo de intentos",
        },
        { status: 429 },
      );
    }

    const hashIngresado = hashOtp(
      strOtp,
      id_usuario,
      strNuevoEmail,
      otpHashSecret,
    );

    if (hashIngresado !== registro.otp_hash) {
      const nuevoIntento = registro.intentos + 1;
      const llegoAlMax = nuevoIntento >= registro.max_intentos;

      await prisma.otp_cambio_correo.update({
        where: { id_otp: registro.id_otp },
        data: {
          intentos: nuevoIntento,
          consumido: llegoAlMax,
          actualizado_en: ahora,
        },
      });

      return NextResponse.json(
        {
          ok: false,
          reason: "OTP_INVALID",
          message: "El código OTP es incorrecto",
          attemptsLeft: Math.max(registro.max_intentos - nuevoIntento, 0),
        },
        { status: 401 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          ok: false,
          reason: "MISSING_SUPABASE_ADMIN_ENV",
          message: "Error interno del servidor",
        },
        { status: 500 },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      id_usuario,
      {
        email: strNuevoEmail,
        email_confirm: true,
      },
    );

    if (authError) {
      console.error("Error actualizando email en Auth:", authError);
      return NextResponse.json(
        {
          ok: false,
          reason: "AUTH_UPDATE_FAILED",
          message: "No se pudo actualizar el correo en Auth",
        },
        { status: 502 },
      );
    }

    await prisma.$transaction([
      prisma.usuario.update({
        where: { id_usuario },
        data: { email: strNuevoEmail },
      }),
      prisma.otp_cambio_correo.update({
        where: { id_otp: registro.id_otp },
        data: {
          consumido: true,
          actualizado_en: ahora,
        },
      }),
    ]);

    return NextResponse.json(
      {
        ok: true,
        reason: "OTP_VERIFIED",
        message: "Correo actualizado correctamente",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error al verificar OTP:", error);
    return NextResponse.json(
      {
        ok: false,
        reason: "INTERNAL_ERROR",
        message: "Error interno del servidor",
      },
      { status: 500 },
    );
  }
}
