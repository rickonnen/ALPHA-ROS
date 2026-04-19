import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_usuario, nuevo_email } = body ?? {};

    if (!id_usuario || !nuevo_email) {
      return NextResponse.json(
        {
          ok: false,
          canProceed: false,
          reason: "MISSING_FIELDS",
          message: "Faltan campos id_usuario o nuevo_email",
        },
        { status: 400 },
      );
    }

    const strNuevoEmail = String(nuevo_email).trim().toLowerCase();

    const usuarioPublico = await prisma.usuario.findUnique({
      where: { id_usuario },
      select: { id_usuario: true, email: true },
    });

    if (!usuarioPublico) {
      return NextResponse.json(
        {
          ok: false,
          canProceed: false,
          reason: "USER_NOT_FOUND",
          message: "Usuario no encontrado",
        },
        { status: 404 },
      );
    }

    const usuarioAuth = await prisma.users.findUnique({
      where: { id: id_usuario },
      select: { id: true, email: true },
    });

    if (!usuarioAuth) {
      return NextResponse.json(
        {
          ok: false,
          canProceed: false,
          reason: "AUTH_USER_NOT_FOUND",
          message: "Usuario auth no encontrado",
        },
        { status: 404 },
      );
    }

    const emailActual = (usuarioAuth.email ?? usuarioPublico.email ?? "")
      .trim()
      .toLowerCase();

    if (emailActual && strNuevoEmail === emailActual) {
      return NextResponse.json(
        {
          ok: false,
          canProceed: false,
          reason: "SAME_EMAIL",
          message: "El nuevo correo no puede ser igual al actual",
        },
        { status: 400 },
      );
    }

    const identidadGoogle = await prisma.identities.findFirst({
      where: {
        user_id: id_usuario,
        provider: "google",
      },
      select: { id: true },
    });

    if (identidadGoogle) {
      return NextResponse.json(
        {
          ok: false,
          canProceed: false,
          reason: "GOOGLE_PROVIDER_BLOCKED",
          message:
            "No puedes cambiar el correo porque tu cuenta fue creada con un proveedor externo (Google).",
        },
        { status: 403 },
      );
    }

    const existeEnAuth = await prisma.users.findFirst({
      where: {
        email: strNuevoEmail,
        NOT: { id: id_usuario },
      },
      select: { id: true },
    });

    if (existeEnAuth) {
      return NextResponse.json(
        {
          ok: false,
          canProceed: false,
          reason: "EMAIL_ALREADY_IN_USE",
          message: "El correo ya está registrado",
        },
        { status: 409 },
      );
    }

    const existeEnPublic = await prisma.usuario.findFirst({
      where: {
        email: strNuevoEmail,
        NOT: { id_usuario },
      },
      select: { id_usuario: true },
    });

    if (existeEnPublic) {
      return NextResponse.json(
        {
          ok: false,
          canProceed: false,
          reason: "EMAIL_ALREADY_IN_USE",
          message: "El correo ya está registrado",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        canProceed: true,
        reason: null,
        message: "Prevalidación correcta",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error en prevalidación de cambio de correo:", error);
    return NextResponse.json(
      {
        ok: false,
        canProceed: false,
        reason: "INTERNAL_ERROR",
        message: "Error interno del servidor",
      },
      { status: 500 },
    );
  }
}
