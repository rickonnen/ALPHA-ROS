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
/*  Dev: Luis - xdev/sow-luisc
    Fecha: 22/04/2026
    Funcionalidad: Fix historial - card igual a publicaciones
      - Elimina botón Eliminar y modal
      - Card con imagen, métricas, precio, dirección
*/
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MapPin, Square, BedDouble, Bath, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

type HistorialItem = {
  id_publicacion: number;
  fecha: string;
  Publicacion: {
    titulo: string | null;
    precio: number | null;
    tipo: string | null;
    direccion: string | null;
    superficie: number | null;
    habitaciones: number | null;
    banos: number | null;
    Moneda: { simbolo: string } | null;
    TipoOperacion: { nombre_operacion: string | null } | null;
    Imagen: { url_imagen: string | null }[];
  };
};

interface HistorialViewProps {
  id_usuario: string;
}

const ITEMS_POR_PAGINA = 5

export default function HistorialView({ id_usuario }: HistorialViewProps) {
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const router = useRouter();

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
    .slice((paginaActual - 1) * ITEMS_POR_PAGINA, paginaActual * ITEMS_POR_PAGINA);

  const handleVerDetalle = async (id: string) => {
    await fetch("/api/perfil/addHistorial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario, id_publicacion: Number(id) }),
    });
    window.open(`/publicacion/Vista_del_Inmueble/${id}`, "_blank");
  };

  return (
    <Card className="border-none bg-transparent shadow-none text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold tracking-tight border-b border-white/20 pb-2 w-full">
          HISTORIAL
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col pt-4">
        {error && <p className="text-red-400 text-sm text-center py-2">{error}</p>}

        {cargando && (
          <>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 mb-3 w-full rounded-xl bg-white/10" />
            ))}
          </>
        )}

        {!cargando && historial.length === 0 && (
          <p className="text-white/40 text-sm text-center py-8">
            No hay publicaciones en tu historial.
          </p>
        )}

        {!cargando && historialPaginado.length > 0 && (
          <div className="flex flex-col gap-3 overflow-y-auto pr-1">
            {historialPaginado.map((item) => (
              <div
                key={item.id_publicacion}
                className="relative border border-black/10 bg-white text-[#2E2E2E] hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden"
              >
                <div className="flex flex-col min-[480px]:flex-row items-stretch gap-0 p-0">
                  {/* Imagen */}
                  <div className="w-full h-40 min-[480px]:w-40 min-[480px]:h-auto min-[480px]:min-w-[10rem] flex-shrink-0 overflow-hidden">
                    {item.Publicacion?.Imagen?.[0]?.url_imagen ? (
                      <img
                        src={item.Publicacion.Imagen[0].url_imagen}
                        alt={item.Publicacion.titulo ?? ""}
                        className="object-cover w-full h-full"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400 text-xs text-center px-2">Sin imagen</span>
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="flex flex-col justify-between flex-1 min-w-0 p-4 gap-2">
                    {/* Encabezado */}
                    <div>
                      <p className="text-[11px] font-bold text-[#E05A2B] uppercase tracking-wide">
                        {[item.Publicacion.tipo, item.Publicacion.TipoOperacion?.nombre_operacion]
                          .filter(Boolean).join(" en ").toUpperCase()}
                      </p>
                      <h3 className="text-base font-semibold text-[#1F3A4D] leading-snug truncate">
                        {item.Publicacion.titulo ?? "Sin título"}
                      </h3>
                      {item.Publicacion.direccion && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-[#E05A2B] shrink-0" />
                          <p className="text-xs text-gray-500 truncate">{item.Publicacion.direccion}</p>
                        </div>
                      )}
                    </div>

                    {/* Métricas */}
                    <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
                      {item.Publicacion.superficie != null && (
                        <span className="flex items-center gap-1">
                          <Square className="w-3 h-3" />{item.Publicacion.superficie} m² Terreno
                        </span>
                      )}
                      {item.Publicacion.habitaciones != null && (
                        <span className="flex items-center gap-1">
                          <BedDouble className="w-3 h-3" />{item.Publicacion.habitaciones} Rec.
                        </span>
                      )}
                      {item.Publicacion.banos != null && (
                        <span className="flex items-center gap-1">
                          <Bath className="w-3 h-3" />{item.Publicacion.banos} Baños
                        </span>
                      )}
                    </div>

                    {/* Precio + fecha + botón */}
                    <div className="flex flex-col min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between gap-2 mt-1">
                      <div>
                        <p className="text-xl font-bold text-[#1F3A4D]">
                          {item.Publicacion.Moneda?.simbolo}{" "}
                          {item.Publicacion.precio != null
                            ? Number(item.Publicacion.precio).toLocaleString("de-DE")
                            : "Sin precio"}
                        </p>
                        {item.fecha && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <p className="text-[11px] text-gray-400">
                              Visto: {new Date(item.fecha).toLocaleDateString("es-BO", {
                                day: "2-digit", month: "short", year: "numeric"
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="azul"
                        size="sm"
                        className="flex-1 min-[480px]:flex-none"
                        onClick={() => handleVerDetalle(item.id_publicacion.toString())}
                      >
                        Ver Detalle
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!cargando && totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4 border-t border-white/10 mt-2">
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
