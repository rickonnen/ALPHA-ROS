import { supabase } from "../supabaseClient";

export async function createNotification(input: {
  userId: string;
  title: string;
  body: string;
  type: string;
  metadata?: Record<string, unknown>;
}) {
  const { data: notification, error } = await supabase
    .from("notifications")
    .insert({
      user_id: input.userId,
      title: input.title,
      body: input.body,
      type: input.type,
      metadata: input.metadata ?? {},
    })
    .select()
    .single();

  if (error) throw error;

  const { data: profile } = await supabase
    .from("profiles")
    .select("phone_e164, whatsapp_enabled, whatsapp_verified")
    .eq("id", input.userId)
    .single();

  if (
    profile?.phone_e164 &&
    profile?.whatsapp_enabled &&
    profile?.whatsapp_verified
  ) {
    await supabase.from("notification_deliveries").insert({
      notification_id: notification.id,
      user_id: input.userId,
      channel: "whatsapp",
      status: "pending",
      idempotency_key: `whatsapp:${notification.id}`,
    });
  }

  return notification;
}