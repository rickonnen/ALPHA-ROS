'use client';

import { useCallback, useRef } from 'react';
import { useAuth } from '@/app/auth/AuthContext';
import type { TipoEvento } from '@/app/api/tracking/event/route';
import type { TrackSearchPayload } from '@/app/api/tracking/search/route';
import type { TrackPlacePayload } from '@/app/api/tracking/place/route';

function fireAndForget(url: string, body: unknown): void {
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {
    // Silent fail - tracking is non-critical
  });
}

function notifyInteraction(tipo: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent('tracking:interaction', { detail: { tipo } }));
  } catch {
    // ignore
  }
}


export function useTracking() {
  const { user } = useAuth();
  const viewedCards = useRef<Set<number>>(new Set());

  const trackEvent = useCallback(
    (
      id_publicacion: number,
      tipo_evento: TipoEvento,
      extras?: {
        duracion_ms?: number;
        scroll_depth_pct?: number;
        posicion_card?: number;
        pagina_origen?: string;
      }
    ) => {
      // Only track logged-in users
      if (!user?.id) return;

      if (tipo_evento === 'view') {
        if (viewedCards.current.has(id_publicacion)) return;
        viewedCards.current.add(id_publicacion);
      }

      const dispositivo: 'desktop' | 'mobile' | 'tablet' =
        typeof window === 'undefined'
          ? 'desktop'
          : window.innerWidth < 768
          ? 'mobile'
          : window.innerWidth < 1024
          ? 'tablet'
          : 'desktop';

      fireAndForget('/api/tracking/event', {
        id_usuario: user.id,
        id_publicacion,
        tipo_evento,
        dispositivo,
        pagina_origen: typeof window !== 'undefined' ? window.location.pathname : undefined,
        ...extras,
      });
      notifyInteraction(tipo_evento);
    },
    [user]
  );

  const trackSearch = useCallback((payload: TrackSearchPayload) => {
    // Only track logged-in users
    if (!user?.id) return;

    fireAndForget('/api/tracking/search', {
      id_usuario: user.id,
      ...payload,
    });
    notifyInteraction('search');
  }, [user]);

  const trackPlace = useCallback((payload: TrackPlacePayload) => {
    // Only track logged-in users
    if (!user?.id) return;

    fireAndForget('/api/tracking/place', {
      id_usuario: user.id,
      ...payload,
    });
    notifyInteraction('place');
  }, [user]);

  return { trackEvent, trackSearch, trackPlace };
}



export function useCardViewTracking(
  id_publicacion: number,
  posicion_card?: number,
  onViewed?: (viewedAtMs: number) => void
) {
  const { trackEvent } = useTracking();
  const tracked = useRef(false);

  const refCallback = useCallback(
    (node: HTMLElement | null) => {
      if (!node || tracked.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && !tracked.current) {
            tracked.current = true;
            trackEvent(id_publicacion, 'view', { posicion_card });
            onViewed?.(Date.now());
            observer.disconnect();
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(node);
    },
    [id_publicacion, posicion_card, trackEvent, onViewed]
  );

  return refCallback;
}
