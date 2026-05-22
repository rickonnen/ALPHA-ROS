import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validatePhoneE164 } from "@/lib/phone/validate-phone";
import { checkEvolutionWhatsappNumber } from "@/lib/whatsapp/evolution";
import { sendWhatsAppNotification } from "@/lib/whatsapp/send-whatsapp";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function splitBoliviaPhone(phoneE164: string) {
  const clean = phoneE164.replace("+", "").replace(/\D/g, "");

  if (!clean.startsWith("591")) {
    throw new Error("Solo se permiten números de Bolivia con código +591.");
  }

  return {
    codigoPais: 591,
    nroTelefono: clean.slice(3),
  };
}

export async function POST(req: Request) {
  try {
    const { userId, phone } = await req.json();

    if (!userId || !phone) {
      return NextResponse.json(
        { ok: false, message: "Faltan datos requeridos." },
        { status: 400 }
      );
    }

    const validation = validatePhoneE164(phone);

    if (!validation.valid || !validation.phoneE164) {
      return NextResponse.json(
        {
          ok: false,
          message: validation.error ?? "Número inválido.",
        },
        { status: 400 }
      );
    }

    const phoneE164 = validation.phoneE164;
    const { codigoPais, nroTelefono } = splitBoliviaPhone(phoneE164);

    const whatsappCheck = await checkEvolutionWhatsappNumber({ phoneE164 });

    if (!whatsappCheck.exists) {
      return NextResponse.json(
        {
          ok: false,
          valid: false,
          message: "El número no tiene una cuenta de WhatsApp activa.",
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const { data: telefono, error: telefonoError } = await supabaseAdmin
      .from("Telefono")
      .upsert(
        {
          codigo_pais: codigoPais,
          nro_telefono: nroTelefono,
          verificado: true,
        },
        {
          onConflict: "codigo_pais,nro_telefono",
        }
      )
      .select("id_telefono, codigo_pais, nro_telefono, verificado")
      .single();

    if (telefonoError) {
      throw telefonoError;
    }

    const { data: existingRelation } = await supabaseAdmin
      .from("UsuarioTelefono")
      .select(`
    id_uste,
    estado,
    Telefono:id_telefono (
      id_telefono,
      verificado
    )
  `)
      .eq("id_usuario", userId)
      .eq("id_telefono", telefono.id_telefono)
      .maybeSingle();

    const alreadyExists = Boolean(existingRelation);

    if (!alreadyExists) {
      const { count, error: countError } = await supabaseAdmin
        .from("UsuarioTelefono")
        .select("id_uste", {
          count: "exact",
          head: true,
        })
        .eq("id_usuario", userId)
        .eq("estado", 1);

      if (countError) {
        throw countError;
      }

      if ((count ?? 0) >= 3) {
        return NextResponse.json(
          {
            ok: false,
            message: "Solo puedes registrar hasta 3 números.",
          },
          { status: 400 }
        );
      }
    }

    const { error: relationError } = await supabaseAdmin
      .from("UsuarioTelefono")
      .upsert(
        {
          id_usuario: userId,
          id_telefono: telefono.id_telefono,
          estado: 1,
        },
        {
          onConflict: "id_usuario,id_telefono",
        }
      );

    if (relationError) {
      throw relationError;
    }

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

    if (prefError) {
      throw prefError;
    }

    await sendWhatsAppNotification({
      to: phoneE164,
      title: "🎉 ¡Bienvenido a PropBol!",
      body:
        "📱 Tu número fue registrado correctamente\n\n" +
        "Desde ahora podrás recibir novedades, oportunidades y avisos importantes sobre propiedades, visitas y actividad de tu cuenta 📲\n\n" +
        "🏠 Encuentra el lugar ideal para comprar, alquilar o invertir ✨",
    });

    return NextResponse.json({
      ok: true,
      valid: true,
      isActive: true,
      isVerified: true,
      idTelefono: telefono.id_telefono,
      phoneE164,
      message: "Número verificado. WhatsApp fue activado correctamente.",
    });
  } catch (error) {
    console.error("verify-phone error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "No se pudo verificar o guardar el número.",
      },
      { status: 500 }
    );
  }
}