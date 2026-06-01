import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWhatsAppNotification } from "@/lib/whatsapp/send-whatsapp";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function buildPhoneE164(codigoPais: number, nroTelefono: string) {
  return `+${codigoPais}${nroTelefono}`;
}

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

    const { data: pref, error } = await supabaseAdmin
      .from("PreferenciaNotificacionCanal")
      .select(`
        id_preferencia,
        activo,
        verificado,
        fecha_activacion,
        id_telefono,
        Telefono:id_telefono (
          id_telefono,
          codigo_pais,
          nro_telefono,
          verificado
        )
      `)
      .eq("id_usuario", userId)
      .eq("canal", "WHATSAPP")
      .maybeSingle();

    if (error) {
      throw error;
    }

    const telefono = Array.isArray(pref?.Telefono)
      ? pref.Telefono[0]
      : pref?.Telefono;

    if (!pref || !pref.id_telefono || !pref.verificado || !telefono?.verificado) {
      return NextResponse.json(
        {
          ok: false,
          message: "Primero debes registrar y verificar un número de WhatsApp.",
        },
        { status: 400 }
      );
    }

    const phoneE164 = buildPhoneE164(
      telefono.codigo_pais,
      telefono.nro_telefono
    );

    const { error: updateError } = await supabaseAdmin
      .from("PreferenciaNotificacionCanal")
      .update({
        activo: enabled,
        fecha_activacion: enabled ? now : pref.fecha_activacion,
        fecha_desactivacion: enabled ? null : now,
        updated_at: now,
      })
      .eq("id_preferencia", pref.id_preferencia);

    if (updateError) {
      throw updateError;
    }

    await sendWhatsAppNotification({
      to: phoneE164,
      title: enabled
        ? "✅ Notificaciones por WhatsApp activadas"
        : "🔕 Notificaciones por WhatsApp desactivadas",
      body: enabled
        ? "Volverás a recibir avisos importantes de tu cuenta por WhatsApp."
        : "Ya no recibirás notificaciones de tu cuenta por WhatsApp.",
    });

    return NextResponse.json({
      ok: true,
      isActive: enabled,
      phoneE164,
      message: enabled
        ? "WhatsApp activado correctamente."
        : "WhatsApp desactivado correctamente.",
    });
  } catch (error) {
    console.error("toggle whatsapp error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "No se pudo actualizar la preferencia de WhatsApp.",
      },
      { status: 500 }
    );
  }
}