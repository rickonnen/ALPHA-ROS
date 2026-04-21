import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Faltan variables de entorno de Supabase para useUnreadCount");
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

export function useUnreadCount(user: any) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setUnreadCount(0);
      return;
    }

    const fetchCount = async () => {
      try {
        const { count, error } = await supabase
          .from("Notificacion")
          .select("*", { count: "exact", head: true })
          .eq("id_usuario", user.id)
          .eq("leido", false);
        
        if (error) {
          console.error("Error fetching unread count:", error);
          return;
        }
        
        setUnreadCount(count ?? 0);
      } catch (error) {
        console.error("Error in fetchCount:", error);
      }
    };

    fetchCount();

    // Canal único por usuario para evitar conflictos
    const channelName = `badge-realtime-${user.id}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Notificacion",
          filter: `id_usuario=eq.${user.id}`,
        },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    const handleRefresh = () => fetchCount();
    window.addEventListener("refresh-notification-badge", handleRefresh);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("refresh-notification-badge", handleRefresh);
    };
  }, [user?.id]);

  return unreadCount;
}