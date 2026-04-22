/*import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error(' NEXT_PUBLIC_SUPABASE_URL no está definida en .env');
}

if (!supabaseAnonKey) {
  console.error(' NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida en .env');
}

console.log(' Inicializando Supabase con URL:', supabaseUrl);
console.log(' Supabase Anon Key existe:', !!supabaseAnonKey);

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});*/

/*import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useUnreadCount(user: any) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }

    const fetchCount = async () => {
      const { count } = await supabase
        .from("Notificacion")
        .select("*", { count: "exact", head: true })
        .eq("id_usuario", user.id)
        .eq("leido", false);
      setUnreadCount(count ?? 0);
    };

    fetchCount();

    const channel = supabase
      .channel(`badge-count-${user.id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "Notificacion",
        filter: `id_usuario=eq.${user.id}`,
      }, () => { fetchCount(); })
      .subscribe();

    const handleRefresh = () => fetchCount();
    window.addEventListener("refresh-notification-badge", handleRefresh);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("refresh-notification-badge", handleRefresh);
    };
  }, [user?.id]);

  return unreadCount;
}*/

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);