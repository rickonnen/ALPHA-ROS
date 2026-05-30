import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import {
  sendWhatsAppNotification,
} from "@/lib/whatsapp/send-whatsapp";

import {
  isQuietHours,
  nextAllowedTime
} from "@/lib/notifications/quiet-hours";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function buildPhoneE164(
  codigoPais: number,
  nroTelefono: string
) {
  return `+${codigoPais}${nroTelefono}`;
}

export async function GET() {

  try {

    const { data: subs, error }
      = await supabaseAdmin
      .from("Suscripcion")
      .select(`
        *,
        Usuario (
          id_usuario,
          nombres,
          apellidos
        )
      `)
      .gt("fecha_fin", new Date().toISOString());

    if (error) throw error;

    for (const sub of subs || []) {

      const fechaFin =
        new Date(sub.fecha_fin);

      const now =
        new Date();

      const diffMs =
        fechaFin.getTime() - now.getTime();

      const hoursLeft =
        diffMs / (1000 * 60 * 60);

      const daysLeft =
        hoursLeft / 24;

      let tipoReminder = "";
      let campoUpdate = "";

      if (
        hoursLeft <= 48 &&
        !sub.notificado_48h
      ) {

        tipoReminder = "48 horas";
        campoUpdate = "notificado_48h";
      }

      else if (
        daysLeft <= 7 &&
        !sub.notificado_7d
      ) {

        tipoReminder = "7 días";
        campoUpdate = "notificado_7d";
      }

      else {
        continue;
      }

      const { data: pref, error: prefError }
        = await supabaseAdmin
        .from("PreferenciaNotificacionCanal")
        .select("*")
        .eq("id_usuario", sub.id_usuario)
        .eq("canal", "WHATSAPP")
        .eq("activo", true)
        .eq("verificado", true)
        .maybeSingle();

      if (prefError) throw prefError;

      if (!pref?.id_telefono) {
        continue;
      }

      const { data: telefono, error: telefonoError }
        = await supabaseAdmin
        .from("Telefono")
        .select("*")
        .eq("id_telefono", pref.id_telefono)
        .eq("verificado", true)
        .maybeSingle();

      if (telefonoError) throw telefonoError;

      if (!telefono) {
        continue;
      }

      const phoneE164 =
        buildPhoneE164(
          telefono.codigo_pais,
          telefono.nro_telefono
        );

      const nombreCompleto =
        `${sub.Usuario?.nombres ?? ""} ${sub.Usuario?.apellidos ?? ""}`.trim();

      const title =
        "⏳ Tu suscripción está por vencer";

      const body =
        `Hola ${nombreCompleto}.\n\n` +
        `Tu suscripción vence en ${tipoReminder}.\n\n` +
        `🚀 Renueva tu plan para continuar disfrutando de todos los beneficios.\n\n` +
        `Gracias por usar nuestra plataforma.`;

      const quiet = isQuietHours();

      if (quiet) {

        const scheduledAt =
          nextAllowedTime();

        const { error: queueError }
          = await supabaseAdmin
          .from("NotificationQueue")
          .insert({
            phone: phoneE164,
            title,
            body,
            status: "PENDING",
            scheduled_at:
              scheduledAt.toISOString(),
          });

        if (queueError) throw queueError;

      } else {

        await sendWhatsAppNotification({
          to: phoneE164,
          title,
          body
        });
      }

      const { error: updateError }
        = await supabaseAdmin
        .from("Suscripcion")
        .update({
          [campoUpdate]: true
        })
        .eq(
          "id_suscripcion",
          sub.id_suscripcion
        );

      if (updateError) {
        throw updateError;
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Reminders procesados"
    });

  } catch (error) {

    console.error(
      "subscription reminder error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "Error procesando reminders"
      },
      {
        status: 500
      }
    );
  }
}   