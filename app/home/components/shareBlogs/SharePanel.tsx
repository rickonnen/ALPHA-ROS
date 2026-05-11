"use client";

import React from "react";
import styles from "./ShareBlog.module.css";
import {
  CopyLinkIcon,
  FacebookIcon,
  TwitterXIcon,
  LinkedInIcon,
  WhatsAppIcon,
  TelegramIcon,
  RedditIcon,
  EmailIcon,
  CloseIcon,
} from "@/app/home/components/shareBlogs/ShareIcons";
import type { SocialNetwork } from "@/components/hooks/useShareBlog";

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  facebook: FacebookIcon,
  twitter: TwitterXIcon,
  linkedin: LinkedInIcon,
  whatsapp: WhatsAppIcon,
  telegram: TelegramIcon,
  reddit: RedditIcon,
  email: EmailIcon,
};

interface SharePanelProps {
  isExiting: boolean;
  networks: SocialNetwork[];
  onClose: () => void;
  onCopyLink: () => void;
  onShare: (network: SocialNetwork) => void;
  triggerRect: DOMRect | null;
}

const SharePanel: React.FC<SharePanelProps> = ({
  isExiting,
  networks,
  onClose,
  onCopyLink,
  onShare,
  triggerRect,
}) => {

  // Posición dinámica ajustada para abrir hacia la derecha
  const positionStyle: React.CSSProperties = triggerRect
    ? {
        position: "absolute",
        top: `${triggerRect.top + window.scrollY - 12}px`, 
        left: `${triggerRect.left + window.scrollX}px`, // Alinea borde izquierdo con borde izquierdo
        transform: "translate(0, -100%)", // Solo sube, ya no se desplaza a la izquierda
        zIndex: 9999, 
      }
    : { display: "none" };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Opciones para compartir este blog"
      style={positionStyle}
      className={[
        styles.panel,
        isExiting ? styles.panelExiting : "",
        "bg-white border border-gray-100 rounded-2xl shadow-xl",
        "px-4 py-3 w-max max-w-xs",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ── Encabezado ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3 gap-6">
        <span
          className="text-xs font-semibold text-gray-400 uppercase tracking-widest"
          style={{ fontFamily: "Geist, sans-serif" }}
        >
          Compartir
        </span>

        <button
          onClick={onClose}
          aria-label="Cerrar panel de compartir"
          className={[
            styles.iconButton,
            "flex items-center justify-center w-6 h-6 rounded-full",
            "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
            "transition-colors",
          ].join(" ")}
        >
          <CloseIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Grid de íconos ──────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2"
        role="list"
        aria-label="Redes sociales disponibles"
      >
        <div
          className={styles.iconWrapper}
          data-tooltip="Copiar enlace"
          role="listitem"
        >
          <button
            onClick={onCopyLink}
            aria-label="Copiar enlace del blog"
            tabIndex={0}
            className={[
              styles.iconButton,
              "flex items-center justify-center w-10 h-10 rounded-xl",
              "bg-gray-100 text-gray-600 hover:bg-gray-200",
            ].join(" ")}
          >
            <CopyLinkIcon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
          </button>
        </div>

        {networks.map((network) => {
          const IconComponent = ICON_MAP[network.id];
          if (!IconComponent) return null;

          return (
            <div
              key={network.id}
              className={styles.iconWrapper}
              data-tooltip={network.label}
              role="listitem"
            >
              <button
                onClick={() => onShare(network)}
                aria-label={`Compartir en ${network.label}`}
                tabIndex={0}
                className={[
                  styles.iconButton,
                  "flex items-center justify-center w-10 h-10 rounded-xl",
                ].join(" ")}
                style={{
                  backgroundColor: network.color,
                  color: network.textColor,
                }}
              >
                <IconComponent className="w-[18px] h-[18px]" />
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Flecha decorativa (Ajustada dinámicamente al centro del botón) ── */}
      <div
        aria-hidden="true"
        className="absolute -bottom-[7px] w-3 h-3 bg-white border-r border-b border-gray-100"
        style={{ 
          // Calculamos la mitad del ancho del botón para posicionar la flecha
          left: triggerRect ? `${triggerRect.width / 2}px` : '20px', 
          transform: 'translateX(-50%) rotate(45deg)' 
        }}
      />
    </div>
  );
};

export default SharePanel;