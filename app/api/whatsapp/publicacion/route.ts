import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
    sendWhatsAppNotification,
} from "@/lib/whatsapp/send-whatsapp";
import { isQuietHours, nextAllowedTime } from "@/lib/notifications/quiet-hours";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function buildPhoneE164(codigoPais: number, nroTelefono: string) {
    return `+${codigoPais}${nroTelefono}`;
}

function buildPublicacionUrl(idPublicacion: number | string) {
    const baseUrl = process.env.URL_BASE;

    if (!baseUrl) {
        throw new Error("Falta URL_BASE en variables de entorno.");
    }

    const url = new URL(`/publicacion/Mi_inmueble/${idPublicacion}`, baseUrl);

    url.searchParams.set("utm_source", "whatsapp");
    url.searchParams.set("utm_medium", "notification");
    url.searchParams.set("utm_campaign", "publicacion_creada");
    url.searchParams.set("utm_content", "ver_publicacion");

    return url.toString();
}

export async function POST(req: Request) {
    const quiet = isQuietHours();

    if (quiet) {
    const scheduledAt = nextAllowedTime();

    const { error: queueError } = await supabaseAdmin
        .from("NotificationQueue")
        .insert({
            phone: phoneE164,
            title,
            body: `${body}\n\n🔗 Ver publicación:\n${publicacionUrl}`,
            status: "PENDING",
            scheduled_at: scheduledAt.toISOString(),
        });

    if (queueError) throw queueError;

    return NextResponse.json({
        ok: true,
        queued: true,
        message: "Notificación encolada por horario No Molestar.",
    });
}
    try {
        const {
            userId,
            idPublicacion,
            titulo,
            tipoOperacion,
            tipoInmueble,
            precio,
            tipoMoneda,
            direccion,
            zona,
            departamento,
        } = await req.json();

        if (!userId || !idPublicacion) {
            return NextResponse.json(
                { ok: false, message: "Faltan datos requeridos." },
                { status: 400 }
            );
        }

        const { data: pref, error: prefError } = await supabaseAdmin
            .from("PreferenciaNotificacionCanal")
            .select("*")
            .eq("id_usuario", userId)
            .eq("canal", "WHATSAPP")
            .eq("activo", true)
            .eq("verificado", true)
            .maybeSingle();

        if (prefError) throw prefError;

        if (!pref || !pref.id_telefono) {
            return NextResponse.json({
                ok: true,
                skipped: true,
                message: "El usuario no tiene WhatsApp activo.",
            });
        }

        const { data: telefono, error: telefonoError } = await supabaseAdmin
            .from("Telefono")
            .select("*")
            .eq("id_telefono", pref.id_telefono)
            .eq("verificado", true)
            .maybeSingle();

        if (telefonoError) throw telefonoError;

        if (!telefono) {
            return NextResponse.json({
                ok: true,
                skipped: true,
                message: "No se encontró teléfono verificado.",
            });
        }

        const phoneE164 = buildPhoneE164(
            telefono.codigo_pais,
            telefono.nro_telefono
        );

        const publicacionUrl = buildPublicacionUrl(idPublicacion);

        const title = "🏠 Publicación registrada correctamente";

        const body =
            `Tu inmueble fue publicado correctamente.\n\n` +
            `📌 Título: ${titulo ?? "Sin título"}\n` +
            `🏷️ Tipo: ${tipoInmueble ?? "No especificado"}\n` +
            `📍 Ubicación: ${zona ?? ""} ${departamento ?? ""}\n` +
            `💰 Precio: ${precio ?? "0"} ${tipoMoneda ?? ""}`;

        await sendWhatsAppNotification({
            to: phoneE164,
            title,
            body: `${body}\n\n🔗 Ver publicación:\n${publicacionUrl}`,
        });

        return NextResponse.json({
            ok: true,
            message: "Notificación WhatsApp enviada correctamente.",
        });
    } catch (error) {
        console.error("publicacion-creada whatsapp error:", error);

        return NextResponse.json(
            {
                ok: false,
                message: "No se pudo enviar la notificación WhatsApp.",
            },
            { status: 500 }
        );
    }
}