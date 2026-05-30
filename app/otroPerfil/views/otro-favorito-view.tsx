"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MapPin, Square, BedDouble, Bath, Lock } from "lucide-react";

interface Favorito {
  id: string;
  titulo: string;
  tipo: string;
  tipo_operacion: string;
  imagen?: string | null;
  direccion?: string;
  precio?: number;
  superficie?: number;
  habitaciones?: number;
  banos?: number;
  fechaPublicacion?: string;
}

const ITEMS_POR_PAGINA = 10;

export default function OtroFavoritoView({ id_usuario }: { id_usuario: string }) {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [cargando, setCargando] = useState(true);
  const [privado, setPrivado] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        const res = await fetch(`/api/otroPerfil/getFavoritos?id_usuario=${id_usuario}`);
        if (res.status === 403) { setPrivado(true); return; }
        if (!res.ok) throw new Error();
        const json = await res.json();
        setFavoritos(json.data);
      } catch {
        setPrivado(true);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id_usuario]);

  const totalPaginas = Math.ceil(favoritos.length / ITEMS_POR_PAGINA);
  const favoritosPaginados = favoritos.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  return (
    <Card className="border-none bg-transparent shadow-none text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold border-b border-white/20 pb-2 tracking-tight w-full">
          FAVORITOS
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
        {cargando && [1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 mb-2 w-full rounded-md bg-white/10" />
        ))}

        {!cargando && privado && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/50">
            <Lock className="w-10 h-10" />
            <p className="text-sm">Este usuario tiene sus favoritos en privado.</p>
          </div>
        )}

        {!cargando && !privado && favoritos.length === 0 && (
          <p className="text-white/40 text-sm text-center py-8">
            Este usuario no tiene publicaciones en favoritos.
          </p>
        )}

        {!cargando && !privado && favoritosPaginados.length > 0 && (
          <div className="flex flex-col gap-3 overflow-y-auto pr-1 max-h-[50vh] md:max-h-[400px]">
            {favoritosPaginados.map((fav) => {
              const strEtiqueta = [fav.tipo, fav.tipo_operacion]
                .filter(Boolean).join(" en ").toUpperCase();
              return (
                <Card key={fav.id} className="mb-3 border border-black/10 bg-white text-[#2E2E2E] hover:shadow-md transition-all duration-200 rounded-xl ">
                  <CardContent className="flex flex-col min-[480px]:flex-row items-stretch gap-0 p-0">
                    <div className="w-full min-[480px]:w-40 min-[480px]:h-auto min-[480px]:min-w-[10rem] flex-shrink-0 ">
                      {fav.imagen ? (
                        <img src={fav.imagen} alt={fav.titulo}
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
                          className="text-base font-semibold text-[#1F3A4D] leading-snug cursor-pointer hover:underline"
                          onClick={() => window.open(`/publicacion/Vista_del_Inmueble/${fav.id}`, "_blank")}
                        >
                          {fav.titulo}
                        </h3>
                        {fav.direccion && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-[#E05A2B] shrink-0" />
                            <p className="text-xs text-gray-500 truncate">{fav.direccion}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
                        {fav.superficie != null && (
                          <span className="flex items-center gap-1"><Square className="w-3 h-3" />{fav.superficie} m²</span>
                        )}
                        {fav.habitaciones != null && (
                          <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" />{fav.habitaciones} Rec.</span>
                        )}
                        {fav.banos != null && (
                          <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{fav.banos} Baños</span>
                        )}
                      </div>
                      <div className="flex flex-col min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between gap-2 mt-1">
                        <div>
                          {fav.precio != null && (
                            <p className="text-xl font-bold text-[#1F3A4D]">
                              $us {Number(fav.precio).toLocaleString("de-DE")}
                            </p>
                          )}
                          {fav.fechaPublicacion && (
                            <p className="text-[11px] text-gray-400">{fav.fechaPublicacion}</p>
                          )}
                        </div>
                        {/* Botón deshabilitado visualmente, sin interacción */}
                        <div className="flex gap-2 items-center">
                          <Button variant="azul" size="sm"
                            onClick={() => window.open(`/publicacion/Vista_del_Inmueble/${fav.id}`, "_blank")}>
                            Ver Detalle
                          </Button>
                          <div
                            title="Favoritos del usuario"
                            className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-red-500 bg-red-500 shadow-lg shadow-red-500/50"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!cargando && !privado && totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
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