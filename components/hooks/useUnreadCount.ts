"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

// Usamos 'any' para evitar errores estrictos de TypeScript con el objeto User
export function useUnreadCount(user: any) {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ Extraemos el ID para evitar la advertencia del React Compiler
  const userId = user?.id;

  const fetchCount = useCallback(async () => {
    if (!userId) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // ✅ PASO 1: En vez de un conteo ciego, traemos la columna "type"
      const { data, error } = await supabase
        .from("notificacion_campana")
        .select("type")
        .eq("read", false);

      if (error) { 
        console.error("Error:", error.message); 
        return; 
      }

      if (data) {
        // ✅ PASO 2: Leemos tu configuración local
        const savedGmail = localStorage.getItem(`gmail_enabled_${userId}`);
        const savedWhatsapp = localStorage.getItem(`whatsapp_enabled_${userId}`);
        
        const gmailEnabled = savedGmail !== "false"; 
        const whatsappEnabled = savedWhatsapp !== "false";

        // ✅ PASO 3: Filtramos la basura. Si WhatsApp está apagado, no lo cuenta.
        const conteoReal = data.filter((n: Record<string, any>) => {
          if (n.type === "gmail" && !gmailEnabled) return false;
          if (n.type === "whatsapp" && !whatsappEnabled) return false;
          return true;
        }).length;

        // Ahora setea "1" en lugar de "6"
        setUnreadCount(conteoReal);
      }
    } catch (err) {
      console.error("Error inesperado:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    fetchCount();
    
    const interval = setInterval(fetchCount, 10000);
    const handleRefresh = () => fetchCount();
    
    // ✅ PASO 4: Esta es la "antena" que escucha cuando modificas el panel
    const handleOptimisticSync = (e: any) => {
      if (e.detail !== undefined) {
        setUnreadCount(e.detail);
      }
    };

    window.addEventListener("notifications-updated", handleRefresh);
    window.addEventListener("refresh-notification-badge", handleRefresh);
    window.addEventListener("optimistic-unread-sync", handleOptimisticSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications-updated", handleRefresh);
      window.removeEventListener("refresh-notification-badge", handleRefresh);
      // ✅ PASO 5: Faltaba limpiar esto en tu código original, causaba bugs
      window.removeEventListener("optimistic-unread-sync", handleOptimisticSync);
    };
  }, [userId, fetchCount]);

  return { unreadCount, refreshCount: fetchCount, loading };
}