"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type TrashEntry = { id: string; read: boolean };

type BroadcastPayload =
  | { action: "delete"; entry: TrashEntry }
  | { action: "restore"; id: string }
  | { action: "empty" }
  | { action: "sync"; entries: TrashEntry[] };

const STORAGE_KEY = (userId: string) => `trash_notif_ids_${userId}`;

function loadFromStorage(userId: string): TrashEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((s: any) =>
      typeof s === "string" ? { id: s, read: true } : s
    );
  } catch {
    return [];
  }
}

function saveToStorage(userId: string, entries: TrashEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(entries));
}

export function useTrash(userId: string | undefined) {
  const [trashIds, setTrashIds] = useState<TrashEntry[]>([]);
  // Ref para evitar que un broadcast recibido vuelva a emitir
  const isBroadcasting = useRef(false);

  // Carga inicial desde localStorage
  useEffect(() => {
    if (!userId) return;
    setTrashIds(loadFromStorage(userId));
  }, [userId]);

  // Canal Realtime Broadcast
  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel(`trash-sync-${userId}`, {
      config: { broadcast: { self: false } }, // no recibir los propios eventos
    });

    channel.on("broadcast", { event: "trash" }, ({ payload }: { payload: BroadcastPayload }) => {
      // Viniendo de otro dispositivo: actualizar estado y localStorage
      setTrashIds((prev) => {
        let next: TrashEntry[];
        if (payload.action === "delete") {
          if (prev.some((e) => e.id === payload.entry.id)) return prev;
          next = [payload.entry, ...prev];
        } else if (payload.action === "restore") {
          next = prev.filter((e) => e.id !== payload.id);
        } else if (payload.action === "empty") {
          next = [];
        } else if (payload.action === "sync") {
          next = payload.entries;
        } else {
          return prev;
        }
        saveToStorage(userId, next);
        // Notificar otros componentes en la misma pestaña
        window.dispatchEvent(new Event("trash-updated"));
        return next;
      });
    });

    channel.subscribe((status) => {
      // Al conectar, emitir el estado actual para sincronizar dispositivos recién abiertos
      if (status === "SUBSCRIBED") {
        const current = loadFromStorage(userId);
        channel.send({
          type: "broadcast",
          event: "trash",
          payload: { action: "sync", entries: current } satisfies BroadcastPayload,
        });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  /** Emite un evento broadcast y actualiza estado + localStorage */
  const broadcast = useCallback(
    (payload: BroadcastPayload, updater: (prev: TrashEntry[]) => TrashEntry[]) => {
      if (!userId) return;
      setTrashIds((prev) => {
        const next = updater(prev);
        saveToStorage(userId, next);
        // Notificar otras pestañas del mismo navegador
        window.dispatchEvent(new Event("trash-updated"));
        // Emitir a otros dispositivos
        supabase.channel(`trash-sync-${userId}`).send({
          type: "broadcast",
          event: "trash",
          payload,
        });
        return next;
      });
    },
    [userId]
  );

  const addToTrash = useCallback(
    (entry: TrashEntry) => {
      broadcast(
        { action: "delete", entry },
        (prev) => (prev.some((e) => e.id === entry.id) ? prev : [entry, ...prev])
      );
    },
    [broadcast]
  );

  const removeFromTrash = useCallback(
    (id: string) => {
      broadcast(
        { action: "restore", id },
        (prev) => prev.filter((e) => e.id !== id)
      );
    },
    [broadcast]
  );

  const emptyTrash = useCallback(() => {
    broadcast({ action: "empty" }, () => []);
  }, [broadcast]);

  return { trashIds, addToTrash, removeFromTrash, emptyTrash };
}