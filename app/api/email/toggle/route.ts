import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, enabled } = await req.json();

    if (!userId || typeof enabled !== "boolean") {
      return NextResponse.json(
        { ok: false, message: "Faltan datos requeridos." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const { data: pref, error: prefError } = await supabaseAdmin
      .from("PreferenciaNotificacionCanal")
      .select("*")
      .eq("id_usuario", userId)
      .eq("canal", "GMAIL")
      .maybeSingle();

    if (prefError) throw prefError;

    if (!pref) {
      const { error: insertError } = await supabaseAdmin
        .from("PreferenciaNotificacionCanal")
        .insert({
          id_usuario: userId,
          canal: "GMAIL",
          activo: enabled,
          verificado: true,
          fecha_activacion: enabled ? now : null,
          fecha_desactivacion: enabled ? null : now,
          updated_at: now,
        });
      if (insertError) throw insertError;
    } else {
      const { error: updateError } = await supabaseAdmin
        .from("PreferenciaNotificacionCanal")
        .update({
          activo: enabled,
          fecha_activacion: enabled ? now : pref.fecha_activacion,
          fecha_desactivacion: enabled ? null : now,
          updated_at: now,
        })
        .eq("id_preferencia", pref.id_preferencia);
      if (updateError) throw updateError;
    }

    return NextResponse.json({
      ok: true,
      isActive: enabled,
      message: enabled
        ? "Notificaciones por Gmail activadas."
        : "Notificaciones por Gmail desactivadas.",
    });
  } catch (error) {
    console.error("email toggle error:", error);
    return NextResponse.json(
      { ok: false, message: "No se pudo actualizar la preferencia de Gmail." },
      { status: 500 }
    );
  }
}