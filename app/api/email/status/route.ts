import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "Falta userId." },
        { status: 400 }
      );
    }

    const { data: pref, error: prefError } = await supabaseAdmin
      .from("PreferenciaNotificacionCanal")
      .select("activo")
      .eq("id_usuario", userId)
      .eq("canal", "GMAIL")
      .maybeSingle();

    if (prefError) throw prefError;

    return NextResponse.json({
      ok: true,
      isActive: pref ? Boolean(pref.activo) : true,
    });
  } catch (error) {
    console.error("email status error:", error);
    return NextResponse.json(
      { ok: false, message: "No se pudo obtener el estado de Gmail." },
      { status: 500 }
    );
  }
}