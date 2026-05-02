import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/nextAuthOptions";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log("[AUTH/ME] Sin sesión activa");
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    console.log("[AUTH/ME] Sesión encontrada para userId:", session.user.id);

    const { data: userData, error } = await supabaseAdmin
      .from("Usuario")
      .select("id_usuario, nombres, email, rol, estado")
      .eq("id_usuario", session.user.id)
      .maybeSingle();

    if (error || !userData) {
      console.error("[AUTH/ME] Usuario no encontrado en BD");
      return NextResponse.json(
        { error: "Usuario no encontrado en BD" },
        { status: 404 }
      );
    }

    // HU-04 CA-3: si la cuenta está desactivada, rechazar la sesión
    if (userData.estado === 0) {
      return NextResponse.json(
        { error: "Cuenta desactivada" },
        { status: 403 }
      );
    }

    const user = {
      id: userData.id_usuario,
      name: userData.nombres,
      email: userData.email,
      rol: userData.rol,
    };

    console.log("[AUTH/ME] ✅ Usuario autenticado:", user.email);

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("[AUTH/ME] Error:", error);
    return NextResponse.json(
      { error: "No autenticado o error del servidor" },
      { status: 401 }
    );
  }
}
