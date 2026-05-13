/**
 * useShareBlog — Custom hook que centraliza toda la lógica de "Compartir Blog".
 *
 * INTEGRACIÓN:
 *   Importa este hook dentro de <ShareBlog /> para mantener el componente
 *   limpio de lógica de negocio.
 *
 * DEPENDENCIAS: ninguna externa (sólo React).
 */

import { useState, useCallback } from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error" | "warning";

export interface ToastState {
  visible: boolean;
  message: string;
  variant: ToastVariant;
}

export interface SocialNetwork {
  id: string;
  label: string;
  color: string;         // Color de fondo del ícono
  textColor: string;     // Color del ícono/texto (contraste ≥ 4.5:1)
  buildUrl: (encodedUrl: string) => string;
}

// ─── Redes sociales con intent URLs ──────────────────────────────────────────

export const SOCIAL_NETWORKS: SocialNetwork[] = [
  {
    id: "facebook",
    label: "Facebook",
    color: "#1877F2",
    textColor: "#FFFFFF",
    buildUrl: (u) => `https://www.facebook.com/sharer/sharer.php?u=${u}`,
  },
  {
    id: "twitter",
    label: "X / Twitter",
    color: "#000000",
    textColor: "#FFFFFF",
    buildUrl: (u) => `https://twitter.com/intent/tweet?url=${u}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    color: "#0A66C2",
    textColor: "#FFFFFF",
    buildUrl: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    color: "#25D366",
    textColor: "#FFFFFF",
    buildUrl: (u) => `https://api.whatsapp.com/send?text=${u}`,
  },
  {
    id: "telegram",
    label: "Telegram",
    color: "#229ED9",
    textColor: "#FFFFFF",
    buildUrl: (u) => `https://t.me/share/url?url=${u}`,
  },
  {
    id: "reddit",
    label: "Reddit",
    color: "#FF4500",
    textColor: "#FFFFFF",
    buildUrl: (u) => `https://www.reddit.com/submit?url=${u}`,
  },
  {
    id: "email",
    label: "Correo",
    color: "#EA4335",
    textColor: "#FFFFFF",
    buildUrl: (u) => `mailto:?subject=Te%20comparto%20este%20blog&body=${u}`,
  },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useShareBlog() {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: "",
    variant: "success",
  });

  /** Muestra un toast temporal (desaparece en 2.5 s) */
  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      setToast({ visible: true, message, variant });
      setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 2500);
    },
    []
  );

  /**
   * AC 4 & 5 — Copia la URL actual al portapapeles.
   * Usa la Clipboard API moderna con fallback para contextos sin HTTPS.
   */
  const handleCopyLink = useCallback(async () => {
    const url = window.location.href;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback para HTTP o navegadores sin Clipboard API
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      showToast("¡Enlace copiado al portapapeles!", "success");
    } catch {
      showToast("No se pudo copiar el enlace.", "error");
    }
  }, [showToast]);

  /**
   * AC 8 & 10 — Verifica conexión y abre la red social en nueva pestaña.
   * @param network - Objeto SocialNetwork con buildUrl
   */
  const handleShareToNetwork = useCallback(
    (network: SocialNetwork) => {
      // AC 10: Validación offline
      if (!navigator.onLine) {
        showToast(
          "Sin conexión. Conéctate a internet para compartir.",
          "warning"
        );
        return;
      }

      const encodedUrl = encodeURIComponent(window.location.href);
      const shareUrl = network.buildUrl(encodedUrl);

      // AC 8: Nueva pestaña segura
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    },
    [showToast]
  );

  return {
    toast,
    SOCIAL_NETWORKS,
    handleCopyLink,
    handleShareToNetwork,
  };
}