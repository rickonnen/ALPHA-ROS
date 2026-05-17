/*  Dev: David Chavez Totora - xdev/davidc
    Fecha: 28/03/2026
    Funcionalidad: Vista de Mis Favoritos dentro del perfil del usuario
      - Consume GET /backend/perfil/getFavoritos?id_usuario=...
      - Lista hasta 10 favoritos por página con scroll interno (max-h 300px)
      - Paginación con numeritos si hay más de 10
      - El botón corazón (FavButton dentro de FavCard) maneja la confirmación y el DELETE
      - @param {id_usuario} - ID del usuario autenticado pasado desde page.tsx
*/
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import FavCard, { Favorito } from "./fav-card";

interface FavoritoViewProps {
  id_usuario: string;
}

const ITEMS_POR_PAGINA = 10;

export default function FavoritoView({ id_usuario }: FavoritoViewProps) {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [favPublico, setFavPublico] = useState(false);
  const [cargandoPriv, setCargandoPriv] = useState(true);

  useEffect(() => {
    const cargarFavoritos = async () => {
      try {
        setCargando(true);
        const res = await fetch(
          `/api/perfil/getFavoritos?id_usuario=${id_usuario}`
        );
        if (!res.ok) throw new Error("No se pudieron cargar los favoritos");
        const json = await res.json();
        setFavoritos(json.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargarFavoritos();
  }, [id_usuario]);

  const totalPaginas = Math.ceil(favoritos.length / ITEMS_POR_PAGINA);
  const favoritosPaginados = favoritos.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  const handleRemoved = (id_publicacion: string) => {
    const nuevos = favoritos.filter((f) => f.id !== id_publicacion);
    setFavoritos(nuevos);

    const nuevoTotal = Math.ceil(nuevos.length / ITEMS_POR_PAGINA);
    if (paginaActual > nuevoTotal && nuevoTotal > 0) {
      setPaginaActual(nuevoTotal);
    }
  };

  useEffect(() => {
    const cargarPriv = async () => {
      try {
        const res = await fetch(`/api/perfil/getPrivacidad?id_usuario=${id_usuario}`);
        if (res.ok) {
          const json = await res.json();
          setFavPublico(json.data?.favorito ?? false);
        }
      } finally {
        setCargandoPriv(false);
      }
    };
    cargarPriv();
  }, [id_usuario]);

  const toggleFavPublico = async (valor: boolean) => {
    setFavPublico(valor);
    await fetch("/api/perfil/getPrivacidad", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario, favorito: valor }),
    });
  };

  return (
    <Card className="border-none bg-transparent shadow-none text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader>
        <div className="flex items-center justify-between border-b border-white/20 pb-2">
          <CardTitle className="text-xl font-bold tracking-tight">FAVORITOS</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">{favPublico ? "Público" : "Privado"}</span>
            <button
              disabled={cargandoPriv}
              onClick={() => toggleFavPublico(!favPublico)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none disabled:opacity-50 ${
                favPublico ? "bg-white" : "bg-white/20"
              }`}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-[var(--primary)] shadow-lg transition duration-200 ${
                favPublico ? "translate-x-4" : "translate-x-0"
              }`} />
            </button>
          </div>
        </div>
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

        {!cargando && favoritos.length === 0 && (
          <p className="text-white/40 text-sm text-center py-8">
            No tienes publicaciones en favoritos.
          </p>
        )}

        {!cargando && favoritosPaginados.length > 0 && (
          <div
            className="block gap-2 overflow-y-auto pr-1 max-h-[50vh] md:max-h-[400px]"
          >
            {favoritosPaginados.map((fav) => (
              <FavCard
                key={fav.id}
                favorito={fav}
                id_usuario={id_usuario}
                onRemoved={handleRemoved}
              />
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
