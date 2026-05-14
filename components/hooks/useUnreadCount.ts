"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useUnreadCount(user: any) {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const fetchCount = async () => {
      const { count } = await supabase
        .from("Notificacion")
        .select("*", { count: "exact", head: true })
        .eq("id_usuario", user.id)
        .eq("leido", false);

      const trashRaw = localStorage.getItem(`trash_notif_ids_${user.id}`);
      const trashIds: string[] = trashRaw
        ? JSON.parse(trashRaw).map((t: any) => (typeof t === "string" ? t : t.id))
        : [];

      const real = Math.max(0, (count ?? 0) - trashIds.length);
      setUnreadCount(real);
      localStorage.setItem("notification_unread_count", real.toString());
      window.dispatchEvent(new Event("refresh-notification-badge"));
      setLoading(false);
    };

    fetchCount();

    // Realtime: escucha INSERT en Notificacion
    const channel = supabase
      .channel(`unread-count-${user.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "Notificacion",
        filter: `id_usuario=eq.${user.id}`,
      }, () => {
        fetchCount();
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "Notificacion",
        filter: `id_usuario=eq.${user.id}`,
      }, () => {
        fetchCount();
      })
      .subscribe();

    // También escucha cuando el panel marca como leído
    window.addEventListener("refresh-notification-badge", fetchCount);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("refresh-notification-badge", fetchCount);
    };
  }, [user?.id]);

  return { unreadCount, loading };
}