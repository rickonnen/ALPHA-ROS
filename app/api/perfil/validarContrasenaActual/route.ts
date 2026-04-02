import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_usuario, password_actual } = body ?? {};

    if (!id_usuario || !password_actual) {
      return NextResponse.json(
        {
          ok: false,
          reason: "MISSING_FIELDS",
          error: "Faltan campos id_usuario o password_actual",
        },
        { status: 400 },
      );
    }

    const [usuarioPublico, usuarioAuth, identidadGoogle] = await Promise.all([
      prisma.usuario.findUnique({
        where: { id_usuario },
        select: { email: true },
      }),
      prisma.users.findUnique({
        where: { id: id_usuario },
        select: { email: true },
      }),
      prisma.identities.findFirst({
        where: {
          user_id: id_usuario,
          provider: "google",
        },
        select: { id: true },
      }),
    ]);

    if (!usuarioPublico) {
      return NextResponse.json(
        {
          ok: false,
          reason: "USER_NOT_FOUND",
          error: "Usuario no encontrado",
        },
        { status: 404 },
      );
    }

    if (identidadGoogle) {
      return NextResponse.json(
        {
          ok: false,
          reason: "GOOGLE_PROVIDER_BLOCKED",
          error:
            "No puedes cambiar el correo porque tu cuenta fue creada con un proveedor externo (Google).",
        },
        { status: 403 },
      );
    }

    const emailLogin = (usuarioAuth?.email ?? usuarioPublico.email ?? "")
      .trim()
      .toLowerCase();

    if (!emailLogin) {
      return NextResponse.json(
        {
          ok: false,
          reason: "EMAIL_NOT_FOUND",
          error: "El usuario no tiene correo registrado",
        },
        { status: 400 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          ok: false,
          reason: "MISSING_SUPABASE_ENV",
          error: "Error interno del servidor",
        },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase.auth.signInWithPassword({
      email: emailLogin,
      password: password_actual,
    });

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          reason: "INVALID_PASSWORD",
          error: "La contraseña actual es incorrecta",
        },
        { status: 401 },
      );
    }

    await supabase.auth.signOut();

    return NextResponse.json(
      { ok: true, message: "Contraseña validada correctamente" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error al validar contraseña actual:", error);
    return NextResponse.json(
      {
        ok: false,
        reason: "INTERNAL_ERROR",
        error: "Error interno del servidor",
      },
      { status: 500 },
    );
  }
}