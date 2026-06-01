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
      .select(`
        id_preferencia,
        activo,
        verificado,
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

    if (prefError) throw prefError;

    const { data: userPhones, error: phonesError } = await supabaseAdmin
      .from("UsuarioTelefono")
      .select(`
        id_uste,
        estado,
        id_telefono,
        Telefono:id_telefono (
          id_telefono,
          codigo_pais,
          nro_telefono,
          verificado
        )
      `)
      .eq("id_usuario", userId)
      .eq("estado", 1)
      .limit(3);

    if (phonesError) throw phonesError;

    const phones =
      userPhones
        ?.map((item) => {
          const telefono = Array.isArray(item.Telefono)
            ? item.Telefono[0]
            : item.Telefono;

          if (!telefono) return null;

          return {
            idTelefono: telefono.id_telefono,
            phoneE164: buildPhoneE164(
              telefono.codigo_pais,
              telefono.nro_telefono
            ),
            isVerified: Boolean(telefono.verificado),
            isSelected: pref?.id_telefono === telefono.id_telefono,
          };
        })
        .filter(Boolean) ?? [];

    const telefono = Array.isArray(pref?.Telefono)
      ? pref.Telefono[0]
      : pref?.Telefono;

    if (!pref || !pref.id_telefono || !telefono) {
      return NextResponse.json({
        ok: true,
        exists: false,
        isActive: false,
        isVerified: false,
        phoneE164: null,
        idTelefono: null,
        phones,
      });
    }

    return NextResponse.json({
      ok: true,
      exists: true,
      isActive: Boolean(pref.activo),
      isVerified: Boolean(pref.verificado && telefono.verificado),
      idTelefono: telefono.id_telefono,
      phoneE164: buildPhoneE164(
        telefono.codigo_pais,
        telefono.nro_telefono
      ),
      phones,
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