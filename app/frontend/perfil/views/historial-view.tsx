/*  Dev: Luis - xdev/sow-luisc
    Fecha: 29/03/2026
    Funcionalidad: Vista de Historial dentro del perfil del usuario
      - Consume GET /api/historial?id_usuario=...
      - Lista hasta 5 items por página con scroll interno (max-h 300px)
      - Paginación con numeritos si hay más de 5
      - Botón eliminar remueve el item del historial en frontend
      - @param {id_usuario} - ID del usuario autenticado pasado desde page.tsx
*/
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type HistorialItem = {
  id_publicacion: number;
  fecha: string;
  Publicacion: {
    titulo: string | null;
    precio: number | null;
    Moneda: { simbolo: string } | null;
    TipoOperacion: { nombre_operacion: string | null } | null;
    Imagen: { url_imagen: string | null }[];
  };
};

interface HistorialViewProps {
  id_usuario: string;
}

const ITEMS_POR_PAGINA = 5;

export default function HistorialView({ id_usuario }: HistorialViewProps) {
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        setCargando(true);
        const res = await fetch(`/api/historial?id_usuario=${id_usuario}`);
        if (!res.ok) throw new Error("No se pudo cargar el historial");
        const json = await res.json();
        setHistorial(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    cargarHistorial();
  }, [id_usuario]);

  return (
    <Card className="border-none bg-transparent shadow-none text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold border-b border-white/20 pb-2 tracking-tight w-full">
          Historial
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
        {error && (
          <p className="text-red-400 text-sm text-center py-2">{error}</p>
        )}

        {cargando && (
          <>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 mb-2 w-full rounded-md bg-white/10" />
            ))}
          </>
        )}

        {!cargando && historial.length === 0 && (
          <p className="text-white/40 text-sm text-center py-8">
            No hay publicaciones en tu historial.
          </p>
        )}
      </CardContent>
    </Card>
  );
}