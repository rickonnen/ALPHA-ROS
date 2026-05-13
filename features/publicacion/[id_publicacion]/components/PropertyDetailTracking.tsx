"use client";

import { useEffect, useRef } from "react";
import { useTracking } from "@/components/hooks/useTracking";

interface PropertyDetailTrackingProps {
  id_publicacion: number;
}

export function PropertyDetailTracking({
  id_publicacion,
}: PropertyDetailTrackingProps) {
  const { trackEvent } = useTracking();
  const hasFlushedRef = useRef(false);

  useEffect(() => {
    hasFlushedRef.current = false;
    let maxScrollDepth = 0;
    const startedAt = Date.now();

    trackEvent(id_publicacion, "view");

    const updateMaxScrollDepth = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const viewportHeight = window.innerHeight || 0;
      const documentHeight = document.documentElement.scrollHeight || 0;

      if (documentHeight <= viewportHeight) {
        maxScrollDepth = 100;
        return;
      }

      const depth = Math.round(
        ((scrollTop + viewportHeight) / documentHeight) * 100,
      );
      maxScrollDepth = Math.max(maxScrollDepth, Math.min(100, depth));
    };

    const flushDetailTracking = () => {
      if (hasFlushedRef.current) return;
      hasFlushedRef.current = true;
      updateMaxScrollDepth();
      trackEvent(id_publicacion, "detalle", {
        duracion_ms: Math.max(0, Date.now() - startedAt),
        scroll_depth_pct: maxScrollDepth,
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushDetailTracking();
      }
    };

    updateMaxScrollDepth();

    window.addEventListener("scroll", updateMaxScrollDepth, { passive: true });
    window.addEventListener("pagehide", flushDetailTracking);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("scroll", updateMaxScrollDepth);
      window.removeEventListener("pagehide", flushDetailTracking);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [id_publicacion, trackEvent]);

  return null;
}
