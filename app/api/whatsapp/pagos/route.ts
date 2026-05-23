import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import {
  sendWhatsAppNotification,
} from "@/lib/whatsapp/send-whatsapp";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * IMPORTANTE:
 * Evolution API normalmente NO usa +
 */
function buildPhoneE164(
  codigoPais: number,
  nroTelefono: string
) {

  return `${codigoPais}${nroTelefono}`;
}

export async function POST(
  req: Request
) {

  try {

    const {
      id_detalle,
      estado,
      motivo_rechazo
    } = await req.json();

    console.log(
      "REQUEST:",
      {
        id_detalle,
        estado,
        motivo_rechazo
      }
    );

    if (
      !id_detalle ||
      !estado
    ) {

      return NextResponse.json(
        {
          ok: false,
          message:
            "Faltan datos requeridos"
        },
        {
          status: 400
        }
      );
    }

    const {
      data: detalle,
      error: detalleError
    } = await supabaseAdmin
      .from("DetallePago")
      .select(`
        *,
        Usuario (
          id_usuario,
          nombres,
          apellidos
        ),
        PlanPublicacion (
          nombre_plan
        )
      `)
      .eq(
        "id_detalle",
        id_detalle
      )
      .single();

    if (detalleError) {

      console.error(
        "ERROR DETALLE:",
        detalleError
      );

      throw detalleError;
    }

    console.log(
      "DETALLE:",
      detalle
    );

    if (!detalle?.Usuario) {

      throw new Error(
        "Usuario no encontrado"
      );
    }

    const {
      data: pref,
      error: prefError
    } = await supabaseAdmin
      .from(
        "PreferenciaNotificacionCanal"
      )
      .select("*")
      .eq(
        "id_usuario",
        detalle.Usuario.id_usuario
      )
      .eq("canal", "WHATSAPP")
      .eq("activo", true)
      .eq("verificado", true)
      .maybeSingle();

    if (prefError) {

      console.error(
        "ERROR PREF:",
        prefError
      );

      throw prefError;
    }

    console.log(
      "PREFERENCIA:",
      pref
    );

    if (!pref?.id_telefono) {

      console.log(
        "USUARIO SIN TELEFONO"
      );

      return NextResponse.json({
        ok: true,
        skipped: true,
        message:
          "Usuario sin WhatsApp activo"
      });
    }

    const {
      data: telefono,
      error: telefonoError
    } = await supabaseAdmin
      .from("Telefono")
      .select("*")
      .eq(
        "id_telefono",
        pref.id_telefono
      )
      .eq("verificado", true)
      .maybeSingle();

    if (telefonoError) {

      console.error(
        "ERROR TELEFONO:",
        telefonoError
      );

      throw telefonoError;
    }

    console.log(
      "TELEFONO:",
      telefono
    );

    if (!telefono) {

      return NextResponse.json({
        ok: true,
        skipped: true,
        message:
          "Teléfono no encontrado"
      });
    }

    /**
     * FORMATO TELEFONO
     */
    const phoneE164 =
      buildPhoneE164(
        telefono.codigo_pais,
        telefono.nro_telefono
      );

    console.log(
      "PHONE FINAL:",
      phoneE164
    );

    const strNombreCompleto =
      `${detalle.Usuario.nombres} ${detalle.Usuario.apellidos ?? ""}`.trim();

    const strPlan =
      detalle.PlanPublicacion
        ?.nombre_plan || "Plan";

    let title = "";
    let body = "";

    if (
      estado === "Aceptado"
    ) {

      title =
        "✅ Pago aprobado";

      body =
        `Hola ${strNombreCompleto}.\n\n` +
        `Tu pago fue aprobado correctamente.\n\n` +
        `📦 Plan: ${strPlan}\n` +
        `🚀 Ya puedes utilizar los beneficios del plan.`;

    } else {

      title =
        "❌ Pago rechazado";

      body =
        `Hola ${strNombreCompleto}.\n\n` +
        `Tu pago no pudo ser aprobado.\n\n` +
        `📦 Plan: ${strPlan}\n` +
        `📝 Motivo: ${motivo_rechazo || "No especificado"}\n\n` +
        `Por favor revisa la información e inténtalo nuevamente.`;
    }

    console.log(
      "TITLE:",
      title
    );

    console.log(
      "BODY:",
      body
    );

    const result =
      await sendWhatsAppNotification({
        to: phoneE164,
        title,
        body
      });

    console.log(result);

    console.log(
      "WHATSAPP ENVIADO"
    );

    return NextResponse.json({
      ok: true,
      message:
        "WhatsApp enviado correctamente"
    });

  } catch (error) {

    console.error(
      "ERROR GENERAL WHATSAPP:"
    );

    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        message:
          "No se pudo enviar WhatsApp"
      },
      {
        status: 500
      }
    );
  }
}