"use client";

import { useEffect } from "react";

const BROADCAST_CHANNEL = "magic_link_auth";
const STORAGE_KEY = "magic_link_session_id";

/**
 * Hook que escucha el evento de autenticación exitosa de Magic Link
 * emitido por la pestaña callback (Pestaña C) vía BroadcastChannel.
 *
 * Cuando recibe MAGIC_LINK_SUCCESS con el sessionId correcto:
 *  1. Limpia el sessionId de localStorage
 *  2. Redirige a /home (la sesión ya está en la cookie NextAuth)
 *
 * Uso: llamar en MagicLinkSentForm mientras el usuario espera el email.
 */
export function useAuthListener() {
  useEffect(() => {
    // Guard: solo inicializar si hay una sesión magic link activa
    if (!localStorage.getItem(STORAGE_KEY)) return;

    console.log("[useAuthListener] Escuchando auth...");

    const channel = new BroadcastChannel(BROADCAST_CHANNEL);

    function handleMessage(event: MessageEvent) {
      const { type, sessionId } = (event.data ?? {}) as { type?: string; sessionId?: string };

      if (type !== "MAGIC_LINK_SUCCESS") return;

      // Leer localStorage AL MOMENTO del mensaje (no al montar).
      // Si el usuario pidió un segundo link (resend), localStorage ya tiene el nuevo sessionId.
      const expectedSessionId = localStorage.getItem(STORAGE_KEY);

      if (!expectedSessionId || sessionId !== expectedSessionId) {
        console.warn("[useAuthListener] sessionId no coincide, ignorando mensaje");
        return;
      }

      console.log("[useAuthListener] Auth exitosa recibida, redirigiendo a /home...");
      localStorage.removeItem(STORAGE_KEY);
      channel.close();
      // Hard navigation para que el cliente lea la cookie de sesión fresca
      window.location.href = "/home";
    }

    channel.addEventListener("message", handleMessage);

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, []);
}
