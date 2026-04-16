/*  Dev: Luis - xdev/sow-luisc
    Fecha: 29/03/2026
    Funcionalidad: Vista de Historial dentro del perfil del usuario
      - Consume GET /api/historial?id_usuario=...
      - Lista hasta 5 items por página con scroll interno (max-h 300px)
      - Paginación con numeritos si hay más de 5
      - Botón eliminar remueve el item del historial en frontend
      - @param {id_usuario} - ID del usuario autenticado pasado desde page.tsx
*/
/*  Dev: Luis - xdev/sow-luisc
    Fecha: 09/04/2026
    Funcionalidad: Fix bugs historial
      - Conecta DELETE al backend para persistir eliminación
      - Agrega modal de confirmación antes de eliminar
      - Corrige imagen con fallback "Sin imagen"
      - Agrega campo zona en la vista
      - Botón Info registra visita via POST /api/perfil/addHistorial
*/
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"
type HistorialItem = {
  id_publicacion: number;
  fecha: string;
  Publicacion: {
    titulo: string | null;
    precio: number | null;
    zona: string | null;
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
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        setCargando(true);
        const res = await fetch(`/api/perfil/getHistorial?id_usuario=${id_usuario}`);
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
  const router = useRouter();
    const handleEliminar = async (id_publicacion: number) => {
      try {
        const res = await fetch(
          `/api/perfil/getHistorial?id_usuario=${id_usuario}&id_publicacion=${id_publicacion}`,
          { method: "DELETE" }
        );
        if (!res.ok) throw new Error("No se pudo eliminar");
        const nuevos = historial.filter((h) => h.id_publicacion !== id_publicacion);
        setHistorial(nuevos);
        const nuevoTotal = Math.ceil(nuevos.length / ITEMS_POR_PAGINA);
        if (paginaActual > nuevoTotal && nuevoTotal > 0) setPaginaActual(nuevoTotal);
        setIdAEliminar(null);
      } catch (err) {
        console.error(err);
      }
    };
    const handleInfo = async (id: string) => {
      await fetch("/api/perfil/addHistorial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario, id_publicacion: Number(id) }),
      });
      router.push(`/publicacion/perfil_del_inmueble/${id}`);
    };
  return (
    <>
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
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-white/10 flex-shrink-0 flex items-center justify-center">
                    {item.Publicacion?.Imagen?.[0]?.url_imagen ? (
                      <img
                        src={item.Publicacion.Imagen[0].url_imagen}
                        alt={item.Publicacion.titulo ?? ""}
                        className="object-cover w-full h-full"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <span className="text-white/30 text-xs text-center">Sin imagen</span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{item.Publicacion.titulo ?? "Sin título"}</p>
                    <p className="text-xs text-white/50">{item.Publicacion.zona ?? ""}</p>
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
                    variant="outline"
                    size="sm"
                    className="text-black border-white/60 hover:bg-white/80"
                    onClick={() => handleInfo(item.id_publicacion.toString())}
                  >
                    Info
                  </Button>
                <Button
                  size="sm"
                  className="bg-[var(--secondary)] text-white border-none hover:bg-[var(--secondary)]/80"
                  onClick={() => setIdAEliminar(item.id_publicacion)}
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
     {idAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full border-2 border-red-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-red-500"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">¿Eliminar del historial?</h2>
            <p className="text-sm text-gray-500 text-center">
              ¿Estás seguro de eliminar esta publicación de tu historial?
            </p>
            <div className="flex gap-3 w-full mt-2">
              <button onClick={() => setIdAEliminar(null)}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={() => { if (idAEliminar !== null) handleEliminar(idAEliminar); }}
                className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition">
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}