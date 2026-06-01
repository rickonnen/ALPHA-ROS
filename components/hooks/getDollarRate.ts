"use client";

import { useState, useEffect } from "react";

export function useDollarRate() {
  const [compra, setCompra] = useState<number | null>(null);
  const [venta, setVenta] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        setLoading(true);
        setError(null);

        // DolarAPI - tipo de cambio paralelo para mi Bolivia querida :v
        const res = await fetch('https://bo.dolarapi.com/v1/dolares/binance');

        if (!res.ok) throw new Error("Error al obtener el tipo de cambio");

        const data = await res.json();

        setCompra(data.compra ?? null);
        setVenta(data.venta ?? null);
        setLastUpdate(data.fechaActualizacion ?? null);
      } catch (err: any) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, []);

  return { compra, venta, loading, error, lastUpdate };
}