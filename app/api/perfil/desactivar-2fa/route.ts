import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { id_usuario, password } = await request.json();

    if (!id_usuario || !password) {
      return NextResponse.json({ error: "Parámetros incompletos" }, { status: 400 });
    }

    const usuario = await (prisma.usuario.findUnique as any)({
      where: { id_usuario },
      select: { email: true },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const { error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: usuario.email,
      password,
    });

    if (authError) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    await (prisma.usuario.update as any)({
      where: { id_usuario },
      data: { dos_fa_habilitado: false, dos_fa_secreto: null },
    });

    console.log(`[2FA] ✓ 2FA desactivado para usuario: ${id_usuario}`);

    return NextResponse.json({ success: true, message: "2FA desactivado correctamente" });

  } catch (error) {
    console.error("[DESACTIVAR 2FA] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}