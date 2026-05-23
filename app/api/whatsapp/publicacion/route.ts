import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import {
  sendWhatsAppNotification,
} from "@/lib/whatsapp/send-whatsapp";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function buildPhoneE164(
  codigoPais: number,
  nroTelefono: string
) {

  return `${codigoPais}${nroTelefono}`;
}

function buildPublicacionUrl(
  idPublicacion: number | string
) {

  const baseUrl =
    process.env.URL_BASE;

  if (!baseUrl) {

    throw new Error(
      "Falta URL_BASE en variables de entorno."
    );
  }

  const url = new URL(
    `/publicacion/Mi_inmueble/${idPublicacion}`,
    baseUrl
  );

  url.searchParams.set(
    "utm_source",
    "whatsapp"
  );

  url.searchParams.set(
    "utm_medium",
    "notification"
  );

  url.searchParams.set(
    "utm_campaign",
    "publicacion_creada"
  );

  url.searchParams.set(
    "utm_content",
    "ver_publicacion"
  );

  return url.toString();
}

export async function POST(
  req: Request
) {

  try {

    const {
      userId,
      idPublicacion,
      titulo,
      tipoInmueble,
      precio,
      tipoMoneda,
      zona,
      departamento,
    } = await req.json();

    /**
     * Validaciones
     */
    if (
      !userId ||
      !idPublicacion
    ) {

      return NextResponse.json(
        {
          ok: false,
          message:
            "Faltan datos requeridos."
        },
        {
          status: 400
        }
      );
    }

    /**
     * Preferencia WhatsApp
     */
    const {
      data: pref,
      error: prefError
    } = await supabaseAdmin
      .from(
        "PreferenciaNotificacionCanal"
      )
      .select("*")
      .eq("id_usuario", userId)
      .eq("canal", "WHATSAPP")
      .eq("activo", true)
      .eq("verificado", true)
      .maybeSingle();

    if (prefError) {
      throw prefError;
    }

    if (!pref?.id_telefono) {

      return NextResponse.json({
        ok: true,
        skipped: true,
        message:
          "Usuario sin WhatsApp activo."
      });
    }

    /**
     * Obtener teléfono
     */
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
      throw telefonoError;
    }

    if (!telefono) {

      return NextResponse.json({
        ok: true,
        skipped: true,
        message:
          "Teléfono no encontrado."
      });
    }

    /**
     * Número WhatsApp
     */
    const phoneE164 =
      buildPhoneE164(
        telefono.codigo_pais,
        telefono.nro_telefono
      );

    console.log(
      "PHONE:",
      phoneE164
    );

    /**
     * URL publicación
     */
    const publicacionUrl =
      buildPublicacionUrl(
        idPublicacion
      );

    /**
     * Mensaje
     */
    const title =
      "🏠 Publicación registrada correctamente";

    const body =
      `Tu inmueble fue publicado correctamente.\n\n` +
      `📌 Título: ${titulo ?? "Sin título"}\n` +
      `🏷️ Tipo: ${tipoInmueble ?? "No especificado"}\n` +
      `📍 Ubicación: ${zona ?? ""} ${departamento ?? ""}\n` +
      `💰 Precio: ${precio ?? "0"} ${tipoMoneda ?? ""}\n\n` +
      `🔗 Ver publicación:\n${publicacionUrl}`;

    /**
     * Enviar WhatsApp
     */
    console.log(
      "ENVIANDO WHATSAPP..."
    );

    const result =
      await sendWhatsAppNotification({
        to: phoneE164,
        title,
        body
      });

    console.log(
      "RESULT:",
      result
    );

    return NextResponse.json({
      ok: true,
      message:
        "WhatsApp enviado correctamente."
    });

  } catch (error) {

    console.error(
      "publicacion-creada whatsapp error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "No se pudo enviar WhatsApp."
      },
      {
        status: 500
      }
    );
  }
}