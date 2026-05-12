"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import styles from "./ShareBlog.module.css";
import SharePanel from "./SharePanel";
import { ShareIcon } from "@/app/home/components/shareBlogs/ShareIcons";
import { useShareBlog } from "@/components/hooks/useShareBlog";

const TOAST_STYLES = {
  success: "bg-gray-900 text-white",
  error:   "bg-red-600 text-white",
  warning: "bg-amber-500 text-white",
};

const TOAST_ICONS = {
  success: "✓",
  error:   "✕",
  warning: "⚠",
};

const ShareBlog: React.FC = () => {
  const [isOpen, setIsOpen]       = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted]     = useState(false);

  const containerRef      = useRef<HTMLDivElement>(null);
  const triggerButtonRef  = useRef<HTMLButtonElement>(null);

  const { toast, SOCIAL_NETWORKS, handleCopyLink, handleShareToNetwork } =
    useShareBlog();

  // Necesario para createPortal (evita error de hidratación en SSR)
  useEffect(() => { setMounted(true); }, []);

  // Recalcula la posición del botón (también al hacer scroll/resize)
  const updatePosition = useCallback(() => {
    if (triggerButtonRef.current) {
      setButtonRect(triggerButtonRef.current.getBoundingClientRect());
    }
  }, []);

  const closePanel = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsExiting(false);
      triggerButtonRef.current?.focus();
    }, 150);
  }, []);

  const openPanel = useCallback(() => {
    updatePosition();
    setIsExiting(false);
    setIsOpen(true);
  }, [updatePosition]);

  const togglePanel = useCallback(() => {
    isOpen ? closePanel() : openPanel();
  }, [isOpen, closePanel, openPanel]);

  // Actualiza posición al hacer scroll o resize mientras el panel está abierto
  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, updatePosition]);

  // Cierra al hacer clic fuera del botón y del panel (portal)
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const outsideButton = containerRef.current && !containerRef.current.contains(target);
      const outsidePanel  = !(target instanceof Element && target.closest('[role="dialog"]'));
      if (outsideButton && outsidePanel) closePanel();
    };
    const id = setTimeout(() => document.addEventListener("mousedown", handleClickOutside), 10);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closePanel]);

  // Cierra con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closePanel]);

  const handleButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); togglePanel(); }
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <div ref={containerRef} className="relative inline-block">

        {/* Panel renderizado en document.body vía portal → escapa overflow:hidden */}
        {mounted && isOpen && createPortal(
          <SharePanel
            isExiting={isExiting}
            networks={SOCIAL_NETWORKS}
            onClose={closePanel}
            onCopyLink={handleCopyLink}
            onShare={handleShareToNetwork}
            triggerRect={buttonRect}
          />,
          document.body
        )}

        {/* Botón principal */}
        <button
          ref={triggerButtonRef}
          onClick={togglePanel}
          onKeyDown={handleButtonKeyDown}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label="Compartir este blog"
          className={[
            styles.shareButton,
            "inline-flex items-center gap-2 px-4 py-2 rounded-xl",
            "text-sm font-medium text-white shadow-sm select-none cursor-pointer",
            "hover:brightness-90 transition-all",
          ].join(" ")}
          style={{ fontFamily: "Geist, sans-serif", backgroundColor: "#C26E5A" }}
        >
          <ShareIcon className="w-4 h-4 text-white/90" />
          {/* En móvil ocultamos el texto para ahorrar espacio */}
          <span className="hidden sm:inline">Compartir este Blog</span>
          <span className="sm:hidden">Compartir</span>
        </button>
      </div>

      {/* Toast — posición fixed en móvil para no quedarse oculto */}
      {toast.visible && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={[
            styles.toast,
            TOAST_STYLES[toast.variant],
            // En móvil se ancla abajo al centro; en desktop fluye inline
            "fixed bottom-5 left-1/2 -translate-x-1/2 sm:static sm:translate-x-0",
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg",
            "pointer-events-none select-none whitespace-nowrap",
          ].join(" ")}
          style={{ fontFamily: "Geist, sans-serif" }}
        >
          <span aria-hidden="true" className="text-base leading-none">
            {TOAST_ICONS[toast.variant]}
          </span>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ShareBlog;