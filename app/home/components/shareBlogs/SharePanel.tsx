"use client";

import React, { useEffect, useState } from "react";
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
  twitter:  TwitterXIcon,
  linkedin: LinkedInIcon,
  whatsapp: WhatsAppIcon,
  telegram: TelegramIcon,
  reddit:   RedditIcon,
  email:    EmailIcon,
};

interface SharePanelProps {
  isExiting:   boolean;
  networks:    SocialNetwork[];
  onClose:     () => void;
  onCopyLink:  () => void;
  onShare:     (network: SocialNetwork) => void;
  triggerRect: DOMRect | null;
}

const GAP    = 8;
const MARGIN = 12;

const SharePanel: React.FC<SharePanelProps> = ({
  isExiting,
  networks,
  onClose,
  onCopyLink,
  onShare,
  triggerRect,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!triggerRect) return null;

  const bottomFromViewport = window.innerHeight - triggerRect.top + GAP;
  const buttonCenterX      = triggerRect.left + triggerRect.width / 2;

  // ── Desktop ──────────────────────────────────────────────────────────────
  const idealLeft = triggerRect.left;
  const maxLeft   = window.innerWidth - MARGIN;
  const finalLeft = Math.min(idealLeft, maxLeft);
  const arrowLeft = `${buttonCenterX - finalLeft}px`;

  const desktopStyle: React.CSSProperties = {
    position: "fixed",
    bottom:   bottomFromViewport,
    left:     finalLeft,
    zIndex:   9999,
  };

  // ── Móvil ────────────────────────────────────────────────────────────────
  const mobileStyle: React.CSSProperties = {
    position: "fixed",
    bottom:   bottomFromViewport,
    left:     MARGIN,
    right:    MARGIN,
    zIndex:   9999,
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Opciones para compartir este blog"
      style={isMobile ? mobileStyle : desktopStyle}
      className={[
        styles.panel,
        isExiting ? styles.panelExiting : "",
        "bg-white border border-gray-100 rounded-2xl shadow-xl px-4 py-3",
        isMobile ? "" : "w-max",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ── Encabezado ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3 gap-4">
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
            "text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors",
          ].join(" ")}
        >
          <CloseIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Íconos ──────────────────────────────────────────────────── */}
      <div
        className={[
          "flex items-center gap-2",
          isMobile ? "justify-between flex-wrap" : "",
        ].join(" ")}
        role="list"
      >
        {/* Copiar enlace */}
        <div className={styles.iconWrapper} data-tooltip="Copiar enlace" role="listitem">
          <button
            onClick={onCopyLink}
            aria-label="Copiar enlace del blog"
            tabIndex={0}
            className={[
              styles.iconButton,
              "flex items-center justify-center rounded-xl",
              "bg-gray-100 text-gray-600 hover:bg-gray-200",
              // Íconos ligeramente más pequeños en móvil para que quepan en una fila
              isMobile ? "w-9 h-9" : "w-10 h-10",
            ].join(" ")}
          >
            <CopyLinkIcon className="w-[17px] h-[17px]" />
          </button>
        </div>

        {/* Redes sociales */}
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
                  "flex items-center justify-center rounded-xl",
                  isMobile ? "w-9 h-9" : "w-10 h-10",
                ].join(" ")}
                style={{ backgroundColor: network.color, color: network.textColor }}
              >
                <IconComponent className="w-[17px] h-[17px]" />
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Flecha decorativa ────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute -bottom-[7px] w-3 h-3 bg-white border-r border-b border-gray-100"
        style={{
          left:      isMobile ? `${buttonCenterX - MARGIN}px` : arrowLeft,
          transform: "translateX(-50%) rotate(45deg)",
        }}
      />
    </div>
  );
};

export default SharePanel;