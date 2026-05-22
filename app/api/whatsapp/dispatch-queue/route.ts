import { NextResponse } from "next/server";
import { sendWhatsAppNotification } from "@/lib/whatsapp/send-whatsapp";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");
        const expected = `Bearer ${process.env.CRON_SECRET}`;

        if (authHeader !== expected) {
            return NextResponse.json(
                { ok: false, message: "No autorizado." },
                { status: 401 }
            );
        }

        const { data: notifications, error } = await supabase
            .from("NotificationQueue")
            .select("*")
            .eq("status", "PENDING")
            .lte("scheduled_at", new Date().toISOString())
            .order("scheduled_at", { ascending: true })
            .limit(50);

        if (error) throw error;

        for (const notification of notifications ?? []) {
            try {
                await supabase
                    .from("NotificationQueue")
                    .update({ status: "PROCESSING" })
                    .eq("id", notification.id)
                    .eq("status", "PENDING");

                const result = await sendWhatsAppNotification({
                    to: notification.phone,
                    title: notification.title,
                    body: notification.body,
                });

                await supabase
                    .from("NotificationQueue")
                    .update({
                        status: "SENT",
                        sent_at: new Date().toISOString(),
                        provider_message_id: result.providerMessageId,
                        error: null,
                    })
                    .eq("id", notification.id);
            } catch (sendError: any) {
                await supabase
                    .from("NotificationQueue")
                    .update({
                        status: "FAILED",
                        error: sendError?.message ?? "Error desconocido",
                    })
                    .eq("id", notification.id);
            }
        }

        return NextResponse.json({
            ok: true,
            processed: notifications?.length ?? 0,
        });
    } catch (error) {
        console.error("dispatch queue error:", error);

        return NextResponse.json(
            { ok: false, message: "No se pudo procesar la cola." },
            { status: 500 }
        );
    }
}