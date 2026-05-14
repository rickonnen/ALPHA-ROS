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

    const { data: pref, error: prefError } = await supabaseAdmin
      .from("PreferenciaNotificacionCanal")
      .select("*")
      .eq("id_usuario", userId)
      .eq("canal", "WHATSAPP")
      .maybeSingle();

    if (prefError) {
      throw prefError;
    }

    if (!pref || !pref.id_telefono || !pref.verificado) {
      return NextResponse.json(
        {
          ok: false,
          message: "Primero debes registrar y verificar un número de WhatsApp.",
        },
        { status: 400 }
      );
    }

    const { data: telefono, error: telefonoError } = await supabaseAdmin
      .from("Telefono")
      .select("*")
      .eq("id_telefono", pref.id_telefono)
      .single();

    if (telefonoError) {
      throw telefonoError;
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