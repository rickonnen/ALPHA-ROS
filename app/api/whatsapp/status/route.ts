import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function buildPhoneE164(codigoPais: number, nroTelefono: string) {
  return `+${codigoPais}${nroTelefono}`;
}

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
      .select("*")
      .eq("id_usuario", userId)
      .eq("canal", "WHATSAPP")
      .maybeSingle();

    if (prefError) {
      throw prefError;
    }

    if (!pref || !pref.id_telefono) {
      return NextResponse.json({
        ok: true,
        exists: false,
        isActive: false,
        isVerified: false,
        phoneE164: null,
      });
    }

    const { data: telefono, error: telefonoError } = await supabaseAdmin
      .from("Telefono")
      .select("*")
      .eq("id_telefono", pref.id_telefono)
      .maybeSingle();

    if (telefonoError) {
      throw telefonoError;
    }

    return NextResponse.json({
      ok: true,
      exists: true,
      isActive: Boolean(pref.activo),
      isVerified: Boolean(pref.verificado && telefono?.verificado),
      phoneE164: telefono
        ? buildPhoneE164(telefono.codigo_pais, telefono.nro_telefono)
        : null,
    });
  } catch (error) {
    console.error("whatsapp status error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "No se pudo obtener el estado de WhatsApp.",
      },
      { status: 500 }
    );
  }
}