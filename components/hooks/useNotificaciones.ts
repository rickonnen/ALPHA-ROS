"use client";
import { useEffect, useState } from "react";

export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<any[]>([]);

  const obtenerNotificaciones = async () => {
    try {
      const res = await fetch("/api/notificaciones");
      const data = await res.json();
      setNotificaciones(data);
    } catch (error) {
      console.error("Error cargando notificaciones");
    }
  };

  useEffect(() => {
    obtenerNotificaciones();

    const interval = setInterval(obtenerNotificaciones, 5000);

    return () => clearInterval(interval);
  }, []);

  return { notificaciones };
}