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
  error: "bg-red-600 text-white",
  warning: "bg-amber-500 text-white",
};

const TOAST_ICONS = {
  success: "✓",
  error: "✕",
  warning: "⚠",
};

const ShareBlog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  const { toast, SOCIAL_NETWORKS, handleCopyLink, handleShareToNetwork } = useShareBlog();

  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (isOpen) {
      closePanel();
    } else {
      openPanel();
    }
  }, [isOpen, closePanel, openPanel]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideContainer = containerRef.current && !containerRef.current.contains(target);
      const isOutsidePanel = !(target instanceof Element && target.closest('[role="dialog"]'));

      if (isOutsideContainer && isOutsidePanel) {
        closePanel();
      }
    };

    const timerId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timerId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closePanel]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closePanel]);

  const handleButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      togglePanel();
    }
  };

  return (
    // Cambiado a items-start para que el panel pueda crecer hacia la derecha
    <div className="flex flex-col items-start gap-3">
      <div ref={containerRef} className="relative inline-block">
        
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

        <button
          ref={triggerButtonRef}
          onClick={togglePanel}
          onKeyDown={handleButtonKeyDown}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label="Compartir este blog"
          className={[
            styles.shareButton,
            "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
            "text-white",
            "select-none cursor-pointer hover:brightness-90 shadow-sm", // Pequeño efecto hover
          ].join(" ")}
          style={{ 
            fontFamily: "Geist, sans-serif",
            backgroundColor: "#C26E5A"
          }}
        >
          <ShareIcon className="w-4 h-4 text-white/90" />
          Compartir este Blog
        </button>
      </div>

      {toast.visible && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={[
            styles.toast,
            TOAST_STYLES[toast.variant],
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg",
            "pointer-events-none select-none",
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