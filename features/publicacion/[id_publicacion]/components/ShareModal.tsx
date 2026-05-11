"use client";

/**
 * @Dev: Gabriel Paredes.
 * @Fecha: 10/05/2026
 * @Funcionalidad: Modal para compartir la publicación del inmueble.
 *
 * FIXES aplicados:
 *  1. URL limpia → se deriva de window.location.href eliminando solo los
 *     query params, así respeta la ruta completa de Next.js (incluyendo
 *     segmentos intermedios como /Vista_del_Inmueble/). Evita el 404.
 *  2. Facebook sharer → usa la URL limpia (sin UTM) como parámetro "u"
 *     para evitar doble encoding y mejorar la compatibilidad.
 *  3. UTM solo viaja en los href de las redes sociales, nunca en la URL
 *     que se copia ni en la que se muestra.
 *  4. id_publicacion se mantiene para otros usos (analytics, etc.) pero
 *     ya NO se usa para reconstruir la URL manualmente.
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

/**
 * URL LIMPIA — deriva la URL actual del navegador eliminando query params y
 * hash. Así respeta la ruta completa de Next.js sin importar cuántos
 * segmentos dinámicos tenga (ej: /publicacion/Vista_del_Inmueble/198).
 *
 * FIX: antes se reconstruía manualmente como
 *   `${origin}/publicacion/${id_publicacion}`
 * lo que ignoraba los segmentos intermedios y causaba un 404.
 */
function fnBuildUrlLimpia(): string {
  if (typeof window === "undefined") return "";
  // Tomamos origin + pathname, descartando ?query y #hash
  return `${window.location.origin}${window.location.pathname}`;
}

/**
 * URL CON UTM — solo para los href de las redes sociales.
 * Se construye sobre la URL limpia para heredar la ruta correcta.
 */
function fnBuildUrlUtm(): string {
  return `${fnBuildUrlLimpia()}?utm_source=share_btn`;
}

/** Trunca el texto para X dejando 23 chars fijos para t.co + 1 espacio */
function fnTruncateParaX(titulo: string): string {
  const MAX = 280 - 23 - 1;
  if (titulo.length <= MAX) return titulo;
  return titulo.slice(0, MAX - 3) + "...";
}

/**
 * Abre ventana nueva y devuelve false SOLO si fue bloqueada por el navegador.
 *
 * FIX: algunos navegadores devuelven un objeto window con .closed = true
 * inmediatamente para dominios externos (Facebook, X) aunque la ventana
 * sí se abrió. Por eso ya no usamos .closed como indicador — solo
 * verificamos que window.open no haya devuelto null/undefined.
 */
function fnOpenWindow(url: string): boolean {
  const w = window.open(url, "_blank", "noopener,noreferrer");
  // null o undefined = popup bloqueado. Cualquier objeto = ventana abierta.
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
  const [estadoFb, setEstadoFb] = useState<"idle" | "copiado">("idle");
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

  /* ── URLs ──────────────────────────────────────────────────────
   *
   * strUrlLimpia: lo que se muestra y se copia. Deriva de window.location
   *   para respetar la ruta completa (fix Bug 1).
   *
   * strUrlUtm: solo va en los href de redes sociales.
   *
   * FIX Facebook (Bug 2): el sharer de Facebook recibe strUrlLimpia (sin UTM)
   *   como parámetro "u". Usar la URL con UTM provocaba doble encoding y
   *   que el og:scraper de Facebook no encontrara la página correctamente.
   *   En producción, Facebook lee los og:tags de la URL limpia.
   *   (En localhost Facebook no puede rastrear og:tags de todas formas
   *   porque el dominio no es público, pero el enlace sí aparece en el
   *   cuadro de texto del sharer.)
   */
  const strUrlLimpia = fnBuildUrlLimpia();
  //llamado a API para registrar la compartida
  const fnRegistrarCompartida = () => {
  fetch(`/api/publicacion/${id_publicacion}/compartir`, {
    method: "POST",
  }).catch((error) => console.error("Error registrando compartida:", error));
  };
  const strUrlUtm = fnBuildUrlUtm();

  // Para Facebook usamos la URL limpia encodeada (sin UTM) — evita doble encoding
  const strUrlLimpiaEnc = encodeURIComponent(strUrlLimpia);
  // Para el resto de redes usamos la URL con UTM
  const strUrlUtmEnc = encodeURIComponent(strUrlUtm);

  const strTituloX = fnTruncateParaX(titulo);
  const strTextoEnc = encodeURIComponent(`¡Mira esta propiedad: ${strTituloX}!`);
  const strTextoWa = encodeURIComponent(`¡Mira esta propiedad! ${strUrlUtm}`);

  /*
   * REDES SOCIALES
   * ─────────────────────────────────────────────────────────────
   * Facebook: sharer/sharer.php con parámetro "u" = URL limpia (sin UTM).
   *   • No requiere app_id.
   *   • Evita doble encoding que ocurría al pasar una URL con query params.
   *   • En producción (dominio público) Facebook precargará og:tags.
   *   • En localhost el enlace igual aparece en el campo de texto del sharer.
   */
  const arrRedes = [
    {
      nombre: "Whatsapp",
      icono: <IconWhatsApp />,
      href: `https://wa.me/?text=${strTextoWa}`,
    },
    {
      nombre: "Facebook",
      icono: <IconFacebook />,
      /*
       * sharer.php con parámetro "u" = URL limpia sin UTM.
       * dialog/feed requiere app_id registrado → da error en dominios no
       * registrados. sharer.php es el único endpoint público sin app_id.
       * El enlace aparece precargado en el compositor de Facebook.
       */
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

  /* Abrir red social — sin mostrar aviso de popup al usuario */
  const fnCompartirRed = (href: string) => {
    if (sinConexion) {
      setMsgError(
        "Sin conexión a Internet. Verifica tu red e intenta de nuevo."
      );
      return;
    }
    if (!disponible) {
      setMsgError(
        "Esta publicación ya no está disponible y no puede ser difundida."
      );
      return;
    }
    setMsgError(null);
    fnRegistrarCompartida(); // Llamado a API para registrar la compartida
    fnOpenWindow(href);
  };

  /**
   * Facebook: Meta eliminó el soporte de sharer.php y dialog/feed sin app_id
   * registrada. La única alternativa funcional sin registro es:
   *   1. Copiar la URL al portapapeles automáticamente.
   *   2. Abrir facebook.com para que el usuario cree la publicación y pegue.
   * El botón muestra feedback visual ("¡Enlace copiado! Pégalo en Facebook").
   */
  const fnCompartirFacebook = async () => {
    if (sinConexion) { setMsgError("Sin conexión a Internet. Verifica tu red e intenta de nuevo."); return; }
    if (!disponible) { setMsgError("Esta publicación ya no está disponible y no puede ser difundida."); return; }
    setMsgError(null);
    fnRegistrarCompartida(); // Llamado a API para registrar la compartida
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(strUrlLimpia);
      } else {
        const el = document.createElement("textarea");
        el.value = strUrlLimpia;
        el.style.cssText = "position:fixed;opacity:0";
        document.body.appendChild(el);
        el.focus(); el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
    } catch { /* silencioso — igual abrimos Facebook */ }
    setEstadoFb("copiado");
    setTimeout(() => setEstadoFb("idle"), 3000);
    fnOpenWindow("https://www.facebook.com");
  };

  /* Copiar enlace */
  const fnCopiar = async () => {
    if (!disponible) {
      setMsgError(
        "Esta publicación ya no está disponible y no puede ser difundida."
      );
      return;
    }
    setMsgError(null);
    fnRegistrarCompartida(); // Llamado a API para registrar la compartida
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
      setMsgError(
        "No se pudo copiar el enlace. Por favor, cópialo manualmente."
      );
      setTimeout(() => setEstadoCopia("idle"), 3000);
    }
  };

  const fnReintentar = () => {
    setMsgError(null);
    setEstadoCopia("idle");
    fnCopiar();
  };

  /* ── Render ─────────────────────────────────────────────────── */
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
        className="relative w-full max-w-[440px] bg-white rounded-2xl shadow-2xl p-6"
        style={{ animation: "shareModalIn 0.2s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1F3A4D]">
            Compartir Publicacion
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#2E2E2E]/60 hover:bg-[#F4EFE6] hover:text-[#2E2E2E] transition-colors duration-150"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerta: publicación no disponible */}
        {!disponible && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 text-amber-800 rounded-lg px-3 py-2 mb-4 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Esta publicación ya no está disponible y no puede ser difundida.
            </span>
          </div>
        )}

        {/* Alerta: sin conexión */}
        {sinConexion && (
          <div className="flex items-start gap-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg px-3 py-2 mb-4 text-sm">
            <WifiOff className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Sin conexión a Internet. Verifica tu red para compartir.</span>
          </div>
        )}

        {/* Alerta: error general */}
        {msgError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-300 text-red-700 rounded-lg px-3 py-2 mb-4 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{msgError}</span>
          </div>
        )}

        {/* ── Copiar enlace ────────────────────────────────────── */}
        <p className="text-sm font-semibold text-[#2E2E2E]/70 mb-2">
          Copiar enlace
        </p>
        <div className="flex items-center gap-2 mb-5">
          {/*
           * ENLACE CLICKEABLE — muestra la URL limpia y abre la publicación
           * en una pestaña nueva. Usa strUrlLimpia (sin UTM) para no exponer
           * parámetros de tracking al usuario.
           */}
          <a
            href={strUrlLimpia}
            target="_blank"
            rel="noopener noreferrer"
            title={strUrlLimpia}
            className="
              flex-1 flex items-center gap-1.5
              text-sm px-3 py-2
              border border-black/10 rounded-lg
              bg-[#F4EFE6]/60 text-[#1F3A4D]
              truncate outline-none
              hover:bg-[#F4EFE6] hover:underline
              transition-colors duration-150
              min-w-0
            "
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-60" />
            <span className="truncate">{strUrlLimpia}</span>
          </a>

          {/* Botón copiar */}
          {estadoCopia === "error" ? (
            <button
              onClick={fnReintentar}
              title="Reintentar"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold shrink-0 bg-gray-200 hover:bg-gray-300 text-[#2E2E2E] transition-all duration-200"
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
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-lg
                text-sm font-bold transition-all duration-200 shrink-0
                ${
                  estadoCopia === "copiado"
                    ? "bg-green-500 text-white cursor-default"
                    : "bg-[#C26E5A] hover:bg-[#a85a47] text-white cursor-pointer"
                }
              `}
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

        {/* ── Redes sociales ───────────────────────────────────── */}
        <p className="text-sm font-semibold text-[#2E2E2E]/70 mb-3">
          Compartir en
        </p>

        {/* Tooltip Facebook */}
        {estadoFb === "copiado" && (
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-300 text-blue-700 rounded-lg px-3 py-2 mb-3 text-sm">
            <Check className="w-4 h-4 mt-0.5 shrink-0" />
            <span>¡Enlace copiado! Pégalo en tu publicación de Facebook.</span>
          </div>
        )}

        <div className="grid grid-cols-4 gap-2">
          {arrRedes.map((red) => (
            <button
              key={red.nombre}
              onClick={
                red.nombre === "Facebook"
                  ? fnCompartirFacebook
                  : () => fnCompartirRed(red.href)
              }
              disabled={!disponible || sinConexion}
              aria-label={`Compartir en ${red.nombre}`}
              className="
                flex flex-col items-center gap-1.5
                p-2 rounded-xl
                hover:bg-[#F4EFE6] active:scale-95
                transition-all duration-150
                disabled:opacity-40 disabled:cursor-not-allowed
                group
              "
            >
              <div className="transition-transform duration-150 group-hover:scale-110">
                {red.icono}
              </div>
              <span className="text-xs text-[#2E2E2E]/60 group-hover:text-[#2E2E2E] transition-colors leading-tight text-center">
                {red.nombre}
              </span>
            </button>
          ))}
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