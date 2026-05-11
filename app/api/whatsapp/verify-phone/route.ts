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
        { ok: false, message: validation.error },
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

    let telefono;

    const { data: existingTelefono, error: findPhoneError } =
      await supabaseAdmin
        .from("Telefono")
        .select("*")
        .eq("codigo_pais", codigoPais)
        .eq("nro_telefono", nroTelefono)
        .maybeSingle();

    if (findPhoneError) {
      throw findPhoneError;
    }

    if (existingTelefono) {
      const { data: updatedTelefono, error: updatePhoneError } =
        await supabaseAdmin
          .from("Telefono")
          .update({
            verificado: true,
          })
          .eq("id_telefono", existingTelefono.id_telefono)
          .select()
          .single();

      if (updatePhoneError) {
        throw updatePhoneError;
      }

      telefono = updatedTelefono;
    } else {
      const { data: newTelefono, error: insertPhoneError } = await supabaseAdmin
        .from("Telefono")
        .insert({
          nro_telefono: nroTelefono,
          codigo_pais: codigoPais,
          verificado: true,
        })
        .select()
        .single();

      if (insertPhoneError) {
        throw insertPhoneError;
      }

      telefono = newTelefono;
    }

    const { data: existingRelation, error: findRelationError } =
      await supabaseAdmin
        .from("UsuarioTelefono")
        .select("*")
        .eq("id_usuario", userId)
        .eq("id_telefono", telefono.id_telefono)
        .maybeSingle();

    if (findRelationError) {
      throw findRelationError;
    }

    if (!existingRelation) {
      const { error: relationError } = await supabaseAdmin
        .from("UsuarioTelefono")
        .insert({
          id_usuario: userId,
          id_telefono: telefono.id_telefono,
        });

      if (relationError) {
        throw relationError;
      }
    }

    const { data: existingPref, error: findPrefError } = await supabaseAdmin
      .from("PreferenciaNotificacionCanal")
      .select("*")
      .eq("id_usuario", userId)
      .eq("canal", "WHATSAPP")
      .maybeSingle();

    if (findPrefError) {
      throw findPrefError;
    }

    if (existingPref) {
      const { error: updatePrefError } = await supabaseAdmin
        .from("PreferenciaNotificacionCanal")
        .update({
          activo: true,
          verificado: true,
          id_telefono: telefono.id_telefono,
          fecha_activacion: now,
          fecha_desactivacion: null,
          updated_at: now,
        })
        .eq("id_preferencia", existingPref.id_preferencia);

      if (updatePrefError) {
        throw updatePrefError;
      }
    } else {
      const { error: insertPrefError } = await supabaseAdmin
        .from("PreferenciaNotificacionCanal")
        .insert({
          id_usuario: userId,
          canal: "WHATSAPP",
          activo: true,
          verificado: true,
          id_telefono: telefono.id_telefono,
          fecha_activacion: now,
          fecha_desactivacion: null,
          updated_at: now,
        });

      if (insertPrefError) {
        throw insertPrefError;
      }
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