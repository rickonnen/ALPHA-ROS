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
    const { userId, idTelefono } = await req.json();

    if (!userId || !idTelefono) {
      return NextResponse.json(
        { ok: false, message: "Faltan datos requeridos." },
        { status: 400 }
      );
    }

    const { data: relation, error: relationError } = await supabaseAdmin
      .from("UsuarioTelefono")
      .select(`
        id_uste,
        id_usuario,
        id_telefono,
        estado,
        Telefono:id_telefono (
          id_telefono,
          codigo_pais,
          nro_telefono,
          verificado
        )
      `)
      .eq("id_usuario", userId)
      .eq("id_telefono", idTelefono)
      .eq("estado", 1)
      .maybeSingle();

    if (relationError) throw relationError;

    const telefono = Array.isArray(relation?.Telefono)
      ? relation.Telefono[0]
      : relation?.Telefono;

    if (!relation || !telefono || !telefono.verificado) {
      return NextResponse.json(
        {
          ok: false,
          message: "El número seleccionado no existe o no está verificado.",
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const { error: prefError } = await supabaseAdmin
      .from("PreferenciaNotificacionCanal")
      .upsert(
        {
          id_usuario: userId,
          canal: "WHATSAPP",
          activo: true,
          verificado: true,
          id_telefono: telefono.id_telefono,
          fecha_activacion: now,
          fecha_desactivacion: null,
          updated_at: now,
        },
        {
          onConflict: "id_usuario,canal",
        }
      );

    if (prefError) throw prefError;

    return NextResponse.json({
      ok: true,
      exists: true,
      isActive: true,
      isVerified: true,
      idTelefono: telefono.id_telefono,
      phoneE164: buildPhoneE164(
        telefono.codigo_pais,
        telefono.nro_telefono
      ),
      message: "Número seleccionado correctamente.",
    });
  } catch (error) {
    console.error("select whatsapp phone error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "No se pudo seleccionar el número.",
      },
      { status: 500 }
    );
  }
}