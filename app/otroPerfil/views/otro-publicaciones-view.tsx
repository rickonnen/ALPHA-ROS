"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MapPin, Square, BedDouble, Bath } from "lucide-react";

interface Publicacion {
  id: string;
  titulo: string;
  tipo: string;
  tipoOperacion?: string;
  imagen: string | null;
  precio?: number;
  superficie?: number;
  habitaciones?: number;
  banos?: number;
  direccion?: string;
  fechaPublicacion?: string;
}

const ITEMS_POR_PAGINA = 5;

export default function OtroPublicacionesView({ id_usuario }: { id_usuario: string }) {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      try {
        setCargando(true);
        const res = await fetch(
          `/api/otroPerfil/getPublicaciones?id_usuario=${id_usuario}&page=${paginaActual}&limit=${ITEMS_POR_PAGINA}`
        );
        if (!res.ok) throw new Error();
        const json = await res.json();
        if (activo) {
          setPublicaciones(json.data);
          setTotalPaginas(Math.ceil(json.total / ITEMS_POR_PAGINA));
        }
      } catch {
        // silencioso
      } finally {
        if (activo) setCargando(false);
      }
    };
    cargar();
    return () => { activo = false; };
  }, [id_usuario, paginaActual]);

  return (
    <Card className="border-none bg-transparent shadow-none text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold tracking-tight border-b border-white/20 pb-2">
          PUBLICACIONES
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col pt-4">
        {cargando && [1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 mb-2 w-full rounded-md bg-white/10" />
        ))}

        {!cargando && publicaciones.length === 0 && (
          <p className="text-white/40 text-sm text-center py-8">
            Este usuario no tiene publicaciones activas.
          </p>
        )}

        {!cargando && publicaciones.length > 0 && (
          <div className="flex flex-col gap-3 overflow-y-auto pr-1">
            {publicaciones.map((pub) => {
              const strEtiqueta = [pub.tipo, pub.tipoOperacion]
                .filter(Boolean).join(" en ").toUpperCase();
              return (
                <Card key={pub.id} className="border border-black/10 bg-white text-[#2E2E2E] hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden">
                  <CardContent className="flex flex-col min-[480px]:flex-row items-stretch gap-0 p-0">
                    <div className="w-full h-40 min-[480px]:w-40 min-[480px]:h-auto min-[480px]:min-w-[10rem] flex-shrink-0 overflow-hidden">
                      {pub.imagen ? (
                        <img src={pub.imagen} alt={pub.titulo}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <span className="text-gray-400 text-xs text-center px-2">Sin imagen</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-between flex-1 min-w-0 p-4 gap-2">
                      <div>
                        {strEtiqueta && (
                          <p className="text-[11px] font-bold text-[#E05A2B] uppercase tracking-wide mb-1">{strEtiqueta}</p>
                        )}
                        <h3
                          className="text-base font-semibold text-[#1F3A4D] leading-snug cursor-pointer hover:underline truncate"
                          onClick={() => window.open(`/publicacion/Vista_del_Inmueble/${pub.id}`, "_blank")}
                        >
                          {pub.titulo}
                        </h3>
                        {pub.direccion && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-[#E05A2B] shrink-0" />
                            <p className="text-xs text-gray-500 truncate">{pub.direccion}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
                        {pub.superficie != null && (
                          <span className="flex items-center gap-1"><Square className="w-3 h-3" />{pub.superficie} m² Terreno</span>
                        )}
                        {pub.habitaciones != null && (
                          <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" />{pub.habitaciones} Rec.</span>
                        )}
                        {pub.banos != null && (
                          <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{pub.banos} Baños</span>
                        )}
                      </div>
                      <div className="flex flex-col min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between gap-2 mt-1">
                        <div>
                          {pub.precio != null && (
                            <p className="text-xl font-bold text-[#1F3A4D]">
                              $us {Number(pub.precio).toLocaleString("de-DE")}
                            </p>
                          )}
                          {pub.fechaPublicacion && (
                            <p className="text-[11px] text-gray-400">{pub.fechaPublicacion}</p>
                          )}
                        </div>
                        <Button variant="azul" size="sm"
                          onClick={() => window.open(`/publicacion/Vista_del_Inmueble/${pub.id}`, "_blank")}>
                          Ver Detalle
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!cargando && totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4 border-t border-white/10 mt-2">
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white disabled:opacity-30"
              onClick={() => setPaginaActual((p) => p - 1)} disabled={paginaActual === 1}>‹</Button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
              <Button key={num} variant="ghost" size="sm" onClick={() => setPaginaActual(num)}
                className={`w-8 h-8 rounded-full text-sm font-bold transition-all ${
                  paginaActual === num ? "bg-white text-[var(--primary)]" : "text-white/60 hover:text-white"
                }`}>{num}</Button>
            ))}
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white disabled:opacity-30"
              onClick={() => setPaginaActual((p) => p + 1)} disabled={paginaActual === totalPaginas}>›</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}