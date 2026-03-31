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
  const totalPaginas = Math.ceil(historial.length / ITEMS_POR_PAGINA);
  const historialPaginado = historial
    .filter((item) => item.Publicacion)
    .slice(
      (paginaActual - 1) * ITEMS_POR_PAGINA,
      paginaActual * ITEMS_POR_PAGINA
    );
  const handleEliminar = (id_publicacion: number) => {
    const nuevos = historial.filter((h) => h.id_publicacion !== id_publicacion);
    setHistorial(nuevos);
    const nuevoTotal = Math.ceil(nuevos.length / ITEMS_POR_PAGINA);
    if (paginaActual > nuevoTotal && nuevoTotal > 0) {
      setPaginaActual(nuevoTotal);
    }
  };

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

        {!cargando && historial.filter(i => i.Publicacion).length > 0 && (
          <div className="block gap-2 overflow-y-auto pr-1 max-h-[50vh] md:max-h-[300px]">
            {historialPaginado.map((item) => (
              <div
                key={item.id_publicacion}
                className="flex items-center justify-between bg-white/10 rounded-md p-3 mb-2"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.Publicacion?.Imagen?.[0]?.url_imagen ?? "https://via.placeholder.com/80"}
                    alt={item.Publicacion.titulo ?? ""}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-bold text-sm">{item.Publicacion.titulo ?? "Sin título"}</p>
                    <p className="text-sm text-white/70">
                      {item.Publicacion.Moneda?.simbolo} {item.Publicacion.precio ?? "Sin precio"}
                    </p>
                    <p className="text-xs text-white/50">
                      {item.Publicacion.TipoOperacion?.nombre_operacion ?? ""}
                    </p>
                    <p className="text-xs text-white/40">
                      Visto: {item.fecha ? new Date(item.fecha).toLocaleDateString() : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-300 hover:text-blue-100"
                    onClick={() => alert(`Publicación: ${item.Publicacion.titulo}`)}
                  >
                    Info
                  </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-200"
                    onClick={() => {
                      if (confirm("¿Eliminar del historial?")) {
                        handleEliminar(item.id_publicacion);
                      }
                    }}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      {!cargando && totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white disabled:opacity-30"
              onClick={() => setPaginaActual((p) => p - 1)}
              disabled={paginaActual === 1}
            >
              ‹
            </Button>

            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
              <Button
                key={num}
                variant="ghost"
                size="sm"
                onClick={() => setPaginaActual(num)}
                className={`w-8 h-8 rounded-full text-sm font-bold transition-all ${
                  paginaActual === num
                    ? "bg-white text-[var(--primary)]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {num}
              </Button>
            ))}

            <Button
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white disabled:opacity-30"
              onClick={() => setPaginaActual((p) => p + 1)}
              disabled={paginaActual === totalPaginas}
            >
              ›
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}