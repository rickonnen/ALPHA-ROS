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
        { ok: false, error: "Faltan campos id_usuario o password_actual" },
        { status: 400 },
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario },
      select: { email: true },
    });

    if (!usuario) {
      return NextResponse.json(
        { ok: false, error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    if (!usuario.email) {
      return NextResponse.json(
        { ok: false, error: "El usuario no tiene correo registrado" },
        { status: 400 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      //esto es porque faltan variables de entorno en el supabase, pero mejor solo responder internal server error
      return NextResponse.json(
        { ok: false, error: "Error interno del servidor" },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase.auth.signInWithPassword({
      email: usuario.email,
      password: password_actual,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: "La contraseña actual es incorrecta" },
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
      { ok: false, error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
