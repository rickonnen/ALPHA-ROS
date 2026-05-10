"use client";

/**
 * @Dev: [Tu nombre]
 * @Fecha: 10/05/2026
 * @Funcionalidad: Modal para compartir la publicación del inmueble.
 *                 Permite copiar el enlace directo y compartir en
 *                 WhatsApp, Facebook, Telegram y X (Twitter).
 * @param {string}   id_publicacion - ID de la publicación para generar la URL compartible.
 * @param {function} onClose        - Callback para cerrar el modal desde el padre.
 */

import { useEffect, useRef, useState } from "react";
import { X, Copy, Check } from "lucide-react";

/* ── Íconos SVG de redes sociales (sin dependencias externas) ── */
const IconWhatsApp = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
    <circle cx="16" cy="16" r="16" fill="#25D366" />
    <path
      fill="#fff"
      d="M22.5 9.5A9.46 9.46 0 0 0 16 7a9.5 9.5 0 0 0-8.22 14.22L7 25l3.88-.78A9.5 9.5 0 1 0 22.5 9.5ZM16 24.1a7.9 7.9 0 0 1-4.03-1.1l-.29-.17-2.3.46.5-2.24-.19-.3A7.9 7.9 0 1 1 16 24.1Zm4.33-5.9c-.24-.12-1.4-.69-1.61-.77-.22-.08-.38-.12-.54.12-.16.23-.62.77-.76.93-.14.16-.28.18-.52.06a6.57 6.57 0 0 1-1.93-1.19 7.2 7.2 0 0 1-1.34-1.66c-.14-.24 0-.37.1-.49.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.46-.4-.4-.54-.4h-.46c-.16 0-.42.06-.64.3s-.84.82-.84 2 .86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.1.46-.07 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.46-.28Z"
    />
  </svg>
);

const IconFacebook = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
    <circle cx="16" cy="16" r="16" fill="#1877F2" />
    <path
      fill="#fff"
      d="M21 16h-3v9h-4v-9h-2v-3h2v-2c0-2.48 1.02-4 4-4h3v3h-2c-.93 0-1 .35-1 1v2h3l-.4 3H18Z"
    />
  </svg>
);

const IconTelegram = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
    <circle cx="16" cy="16" r="16" fill="#229ED9" />
    <path
      fill="#fff"
      d="M23.9 8.8 6.4 15.5c-1.2.5-1.2 1.2-.2 1.5l4.5 1.4 1.7 5.2c.2.6.5.8.9.8.4 0 .6-.2.9-.5l2.3-2.2 4.6 3.4c.8.5 1.4.2 1.6-.8l2.9-13.6c.3-1.2-.4-1.8-1.7-1.4Zm-10 9.4-.4 3.6-1.3-4 9.6-6-8 6.4Z"
    />
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
    <circle cx="16" cy="16" r="16" fill="#000" />
    <path
      fill="#fff"
      d="M18.24 14.65 24.1 8h-1.4l-5.1 5.93L13.1 8H8l6.15 8.95L8 24h1.4l5.38-6.26L19.1 24H24l-5.76-9.35Zm-1.9 2.2-.62-.9-4.96-7.1h2.14l4 5.73.62.9 5.2 7.44h-2.14l-4.24-6.07Z"
    />
  </svg>
);

/* ── Props ───────────────────────────────────────────────────── */
interface ShareModalProps {
  id_publicacion: string;
  onClose: () => void;
}

/* ── Componente ──────────────────────────────────────────────── */
export default function ShareModal({ id_publicacion, onClose }: ShareModalProps) {
  const [bolCopiado, setBolCopiado] = useState(false);
  const refOverlay = useRef<HTMLDivElement>(null);

  // Construir URL pública de la publicación
  const strUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/publicacion/${id_publicacion}`
      : `/publicacion/${id_publicacion}`;

  // Cerrar al hacer click fuera del modal
  const fnClickOverlay = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === refOverlay.current) onClose();
  };

  // Cerrar con tecla Escape
  useEffect(() => {
    const fnKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", fnKeyDown);
    return () => document.removeEventListener("keydown", fnKeyDown);
  }, [onClose]);

  // Copiar enlace al portapapeles
  const fnCopiar = async () => {
    try {
      await navigator.clipboard.writeText(strUrl);
      setBolCopiado(true);
      setTimeout(() => setBolCopiado(false), 2000);
    } catch {
      // Fallback para navegadores sin clipboard API
      const el = document.createElement("textarea");
      el.value = strUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setBolCopiado(true);
      setTimeout(() => setBolCopiado(false), 2000);
    }
  };

  const strTexto  = encodeURIComponent("¡Mira esta propiedad!");
  const strUrlEnc = encodeURIComponent(strUrl);

  const arrRedes = [
    {
      nombre: "Whatsapp",
      icono: <IconWhatsApp />,
      href: `https://wa.me/?text=${strTexto}%20${strUrlEnc}`,
    },
    {
      nombre: "Facebook",
      icono: <IconFacebook />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${strUrlEnc}`,
    },
    {
      nombre: "Telegram",
      icono: <IconTelegram />,
      href: `https://t.me/share/url?url=${strUrlEnc}&text=${strTexto}`,
    },
    {
      nombre: "X",
      icono: <IconX />,
      href: `https://x.com/intent/tweet?text=${strTexto}&url=${strUrlEnc}`,
    },
  ];

  return (
    <div
      ref={refOverlay}
      onClick={fnClickOverlay}
      className="
        fixed inset-0 z-50
        bg-black/50 backdrop-blur-[2px]
        flex items-center justify-center
        p-4
      "
    >
      <div
        className="
          relative w-full max-w-[420px]
          bg-white rounded-2xl shadow-2xl
          p-6
        "
        style={{ animation: "shareModalIn 0.2s ease-out" }}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1F3A4D]">
            Compartir Publicacion
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="
              w-8 h-8 flex items-center justify-center
              rounded-full text-[#2E2E2E]/60
              hover:bg-[#F4EFE6] hover:text-[#2E2E2E]
              transition-colors duration-150
            "
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Copiar enlace */}
        <p className="text-sm font-semibold text-[#2E2E2E]/70 mb-2">
          Copiar enlace
        </p>
        <div className="flex items-center gap-2 mb-5">
          <input
            readOnly
            value={strUrl}
            onFocus={(e) => e.target.select()}
            className="
              flex-1 text-sm px-3 py-2
              border border-black/10 rounded-lg
              bg-[#F4EFE6]/60 text-[#2E2E2E]/80
              truncate outline-none select-all
            "
          />
          <button
            onClick={fnCopiar}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-lg
              text-sm font-bold transition-all duration-200 shrink-0
              ${bolCopiado
                ? "bg-green-500 text-white"
                : "bg-[#C26E5A] hover:bg-[#a85a47] text-white"}
            `}
          >
            {bolCopiado
              ? <><Check className="w-4 h-4" /><span>Copiado</span></>
              : <><Copy className="w-4 h-4" /><span>Copiar</span></>
            }
          </button>
        </div>

        {/* Redes sociales */}
        <p className="text-sm font-semibold text-[#2E2E2E]/70 mb-3">
          Compartir en
        </p>
        <div className="flex items-center justify-around">
          {arrRedes.map((red) => (
            <a
              key={red.nombre}
              href={red.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="transition-transform duration-150 group-hover:scale-110">
                {red.icono}
              </div>
              <span className="text-xs text-[#2E2E2E]/60 group-hover:text-[#2E2E2E] transition-colors">
                {red.nombre}
              </span>
            </a>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shareModalIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}