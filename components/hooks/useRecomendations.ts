'use client';

import { useCallback, useRef } from 'react';
import type { TipoEvento } from '@/app/api/tracking/event/route';
import type { TrackSearchPayload } from '@/app/api/tracking/search/route';
import type { TrackPlacePayload } from '@/app/api/tracking/place/route';

function fireAndForget(url: string, body: unknown): void {
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {});
}


export function useTracking() {
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
        id_publicacion,
        tipo_evento,
        dispositivo,
        pagina_origen: typeof window !== 'undefined' ? window.location.pathname : undefined,
        ...extras,
      });
    },
    []
  );

  const trackSearch = useCallback((payload: TrackSearchPayload) => {
    fireAndForget('/api/tracking/search', payload);
  }, []);

  const trackPlace = useCallback((payload: TrackPlacePayload) => {
    fireAndForget('/api/tracking/place', payload);
  }, []);

  return { trackEvent, trackSearch, trackPlace };
}

export function useCardViewTracking(
  id_publicacion: number,
  posicion_card?: number
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
            observer.disconnect();
          }
        },
        { threshold: 0.5 } 
      );

      observer.observe(node);
    },
    [id_publicacion, posicion_card, trackEvent]
  );

  return refCallback;
}