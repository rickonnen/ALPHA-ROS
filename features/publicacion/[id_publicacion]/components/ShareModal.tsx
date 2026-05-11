"use client";

/**
 * @Dev: Gabriel Paredes.
 * @Fecha: 10/05/2026
 * @Funcionalidad: Modal para compartir la publicación del inmueble.
 */
/**
 * @Dev: Marcela C.
 * @Fecha: 10/05/2026.
 * @Funcionalidad: Llamado de API para registrar la compartida
 */

import { useEffect, useRef, useState } from "react";
import {
  X,
  Copy,
  Check,
  AlertCircle,
  WifiOff,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

/* ─── Tipos ─────────────────────────────────────────────────── */
type EstadoCopia = "idle" | "copiado" | "error";

/* ─── Íconos SVG (colores de marca oficiales) ───────────────── */
const IconWhatsApp = () => (
  <svg viewBox="0 0 32 32" className="w-9 h-9" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="16" fill="#25D366" />
    <path
      fill="#fff"
      d="M22.5 9.5A9.46 9.46 0 0 0 16 7a9.5 9.5 0 0 0-8.22 14.22L7 25l3.88-.78A9.5 9.5 0 1 0 22.5 9.5ZM16 24.1a7.9 7.9 0 0 1-4.03-1.1l-.29-.17-2.3.46.5-2.24-.19-.3A7.9 7.9 0 1 1 16 24.1Zm4.33-5.9c-.24-.12-1.4-.69-1.61-.77-.22-.08-.38-.12-.54.12-.16.23-.62.77-.76.93-.14.16-.28.18-.52.06a6.57 6.57 0 0 1-1.93-1.19 7.2 7.2 0 0 1-1.34-1.66c-.14-.24 0-.37.1-.49.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.46-.4-.4-.54-.4h-.46c-.16 0-.42.06-.64.3s-.84.82-.84 2 .86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.1.46-.07 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.46-.28Z"
    />
  </svg>
);

const IconFacebook = () => (
  <svg viewBox="0 0 32 32" className="w-9 h-9" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="16" fill="#1877F2" />
    <path
      fill="#fff"
      d="M21 16h-3v9h-4v-9h-2v-3h2v-2c0-2.48 1.02-4 4-4h3v3h-2c-.93 0-1 .35-1 1v2h3l-.4 3H18Z"
    />
  </svg>
);

const IconTelegram = () => (
  <svg viewBox="0 0 32 32" className="w-9 h-9" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="16" fill="#229ED9" />
    <path
      fill="#fff"
      d="M23.9 8.8 6.4 15.5c-1.2.5-1.2 1.2-.2 1.5l4.5 1.4 1.7 5.2c.2.6.5.8.9.8.4 0 .6-.2.9-.5l2.3-2.2 4.6 3.4c.8.5 1.4.2 1.6-.8l2.9-13.6c.3-1.2-.4-1.8-1.7-1.4Zm-10 9.4-.4 3.6-1.3-4 9.6-6-8 6.4Z"
    />
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 32 32" className="w-9 h-9" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="16" fill="#000" />
    <path
      fill="#fff"
      d="M18.24 14.65 24.1 8h-1.4l-5.1 5.93L13.1 8H8l6.15 8.95L8 24h1.4l5.38-6.26L19.1 24H24l-5.76-9.35Zm-1.9 2.2-.62-.9-4.96-7.1h2.14l4 5.73.62.9 5.2 7.44h-2.14l-4.24-6.07Z"
    />
  </svg>
);

/* ─── Props ─────────────────────────────────────────────────── */
interface ShareModalProps {
  id_publicacion: string;
  titulo?: string;
  disponible?: boolean;
  onClose: () => void;
}

/* ─── Helpers ───────────────────────────────────────────────── */
function fnBuildUrlLimpia(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}${window.location.pathname}`;
}

function fnBuildUrlUtm(): string {
  return `${fnBuildUrlLimpia()}?utm_source=share_btn`;
}

function fnTruncateParaX(titulo: string): string {
  const MAX = 280 - 23 - 1;
  if (titulo.length <= MAX) return titulo;
  return titulo.slice(0, MAX - 3) + "...";
}

function fnOpenWindow(url: string): boolean {
  const w = window.open(url, "_blank", "noopener,noreferrer");
  return w != null;
}

/* ─── Componente ─────────────────────────────────────────────── */
export default function ShareModal({
  id_publicacion,
  titulo = "Propiedad en venta",
  disponible = true,
  onClose,
}: ShareModalProps) {
  const [estadoCopia, setEstadoCopia] = useState<EstadoCopia>("idle");
  const [msgError, setMsgError] = useState<string | null>(null);
  const [sinConexion, setSinConexion] = useState(
    () => typeof navigator !== "undefined" && !navigator.onLine
  );
  const refOverlay = useRef<HTMLDivElement>(null);

  /* Detectar conexión */
  useEffect(() => {
    const fnOn = () => setSinConexion(false);
    const fnOff = () => setSinConexion(true);
    window.addEventListener("online", fnOn);
    window.addEventListener("offline", fnOff);
    return () => {
      window.removeEventListener("online", fnOn);
      window.removeEventListener("offline", fnOff);
    };
  }, []);

  /* Cerrar con Escape */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  /* ── URLs ── */
  const strUrlLimpia = fnBuildUrlLimpia();
  const strUrlUtm = fnBuildUrlUtm();
  const strUrlLimpiaEnc = encodeURIComponent(strUrlLimpia);
  const strUrlUtmEnc = encodeURIComponent(strUrlUtm);
  const strTituloX = fnTruncateParaX(titulo);
  const strTextoEnc = encodeURIComponent(`¡Mira esta propiedad: ${strTituloX}!`);
  const strTextoWa = encodeURIComponent(`¡Mira esta propiedad! ${strUrlUtm}`);

  /* Llamado a API para registrar la compartida */
  const fnRegistrarCompartida = () => {
    fetch(`/api/publicacion/${id_publicacion}/compartir`, {
      method: "POST",
    }).catch((error) => console.error("Error registrando compartida:", error));
  };

  /* ── Redes sociales ── */
  const arrRedes = [
    {
      nombre: "Whatsapp",
      icono: <IconWhatsApp />,
      href: `https://wa.me/?text=${strTextoWa}`,
    },
    {
      nombre: "Facebook",
      icono: <IconFacebook />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${strUrlLimpiaEnc}`,
    },
    {
      nombre: "Telegram",
      icono: <IconTelegram />,
      href: `https://t.me/share/url?url=${strUrlUtmEnc}&text=${strTextoEnc}`,
    },
    {
      nombre: "X",
      icono: <IconX />,
      href: `https://x.com/intent/tweet?text=${strTextoEnc}&url=${strUrlUtmEnc}`,
    },
  ];

  /* Abrir red social */
  const fnCompartirRed = (href: string) => {
    if (sinConexion) {
      setMsgError("Sin conexión a Internet. Verifica tu red e intenta de nuevo.");
      return;
    }
    if (!disponible) {
      setMsgError("Esta publicación ya no está disponible y no puede ser difundida.");
      return;
    }
    setMsgError(null);
    fnRegistrarCompartida();
    fnOpenWindow(href);
  };

  /* Copiar enlace */
  const fnCopiar = async () => {
    if (!disponible) {
      setMsgError("Esta publicación ya no está disponible y no puede ser difundida.");
      return;
    }
    setMsgError(null);
    fnRegistrarCompartida();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(strUrlLimpia);
      } else {
        const el = document.createElement("textarea");
        el.value = strUrlLimpia;
        el.style.cssText = "position:fixed;opacity:0";
        document.body.appendChild(el);
        el.focus();
        el.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(el);
        if (!ok) throw new Error("execCommand failed");
      }
      setEstadoCopia("copiado");
      setTimeout(() => setEstadoCopia("idle"), 2000);
    } catch {
      setEstadoCopia("error");
      setMsgError("No se pudo copiar el enlace. Por favor, cópialo manualmente.");
      setTimeout(() => setEstadoCopia("idle"), 3000);
    }
  };

  const fnReintentar = () => {
    setMsgError(null);
    setEstadoCopia("idle");
    fnCopiar();
  };

  /* ── Render ── */
  return (
    <div
      ref={refOverlay}
      onClick={(e) => {
        if (e.target === refOverlay.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Compartir publicación"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4"
    >
      <div
        className="relative w-full max-w-[440px] rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: "shareModalIn 0.2s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header: fondo azul petróleo (--primary = #1F3A4D) ── */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--primary-foreground)" }}
          >
            Compartir Publicacion
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-150"
            style={{ color: "var(--primary-foreground)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(244,239,230,0.15)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Cuerpo: fondo beige arena (--background = #F4EFE6) ── */}
        <div
          className="px-6 pt-5 pb-6"
          style={{ backgroundColor: "var(--background)" }}
        >
          {/* Alerta: publicación no disponible */}
          {!disponible && (
            <div
              className="flex items-start gap-2 rounded-lg px-3 py-2 mb-4 text-sm border"
              style={{
                backgroundColor: "rgba(212,163,115,0.15)",
                borderColor: "var(--warning)",
                color: "var(--warning-foreground)",
              }}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                Esta publicación ya no está disponible y no puede ser difundida.
              </span>
            </div>
          )}

          {/* Alerta: sin conexión */}
          {sinConexion && (
            <div
              className="flex items-start gap-2 rounded-lg px-3 py-2 mb-4 text-sm border"
              style={{
                backgroundColor: "var(--secondary-fund)",
                borderColor: "var(--card-border)",
                color: "var(--muted-foreground)",
              }}
            >
              <WifiOff className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Sin conexión a Internet. Verifica tu red para compartir.</span>
            </div>
          )}

          {/* Alerta: error general */}
          {msgError && (
            <div
              className="flex items-start gap-2 rounded-lg px-3 py-2 mb-4 text-sm border"
              style={{
                backgroundColor: "rgba(255,16,56,0.07)",
                borderColor: "var(--destructive)",
                color: "var(--destructive)",
              }}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{msgError}</span>
            </div>
          )}

          {/* ── Copiar enlace ── */}
          <p
            className="text-sm font-semibold mb-2"
            style={{ color: "var(--foreground)" }}
          >
            Copiar enlace
          </p>
          <div className="flex items-center gap-2 mb-5">
            <a
              href={strUrlLimpia}
              target="_blank"
              rel="noopener noreferrer"
              title={strUrlLimpia}
              className="flex-1 flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg truncate outline-none transition-colors duration-150 min-w-0 hover:underline"
              style={{
                border: "1px solid var(--card-border)",
                backgroundColor: "var(--card-bg)",
                color: "var(--primary)",
              }}
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-60" />
              <span className="truncate">{strUrlLimpia}</span>
            </a>

            {estadoCopia === "error" ? (
              <button
                onClick={fnReintentar}
                title="Reintentar"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold shrink-0 transition-all duration-200"
                style={{
                  backgroundColor: "var(--secondary-fund)",
                  color: "var(--foreground)",
                  border: "1px solid var(--card-border)",
                }}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reintentar</span>
              </button>
            ) : (
              <button
                onClick={fnCopiar}
                disabled={estadoCopia === "copiado"}
                aria-label={
                  estadoCopia === "copiado" ? "Enlace copiado" : "Copiar enlace"
                }
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 shrink-0"
                style={
                  estadoCopia === "copiado"
                    ? {
                        backgroundColor: "var(--success)",
                        color: "var(--success-foreground)",
                        cursor: "default",
                      }
                    : {
                        backgroundColor: "var(--secondary)",
                        color: "var(--secondary-foreground)",
                        cursor: "pointer",
                      }
                }
              >
                {estadoCopia === "copiado" ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* ── Redes sociales ── */}
          <p
            className="text-sm font-semibold mb-3"
            style={{ color: "var(--foreground)" }}
          >
            Compartir en
          </p>

          <div className="grid grid-cols-4 gap-2">
            {arrRedes.map((red) => (
              <button
                key={red.nombre}
                onClick={() => fnCompartirRed(red.href)}
                disabled={!disponible || sinConexion}
                aria-label={`Compartir en ${red.nombre}`}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed group"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--secondary-fund)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <div className="transition-transform duration-150 group-hover:scale-110">
                  {red.icono}
                </div>
                <span
                  className="text-xs leading-tight text-center"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {red.nombre}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shareModalIn {
          from { opacity: 0; transform: translateY(14px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>
  );
}