/*  Dev: David Chavez Totora - xdev/davidc
    Fecha: 28/03/2026
    Funcionalidad: Botón de corazón reutilizable para marcar/desmarcar favoritos
      - @param {id_usuario}     - UUID del usuario autenticado
      - @param {id_publicacion} - ID de la publicación
      - @param {initialFav}     - si ya está en favoritos al renderizar (default: true
                                  porque se usa dentro de favorito-view donde ya son favs)
      - @param {onRemoved}      - callback cuando se confirma quitar el favorito
                                  (lo usa favorito-view para sacar la card de la lista)
      - @return Corazón rojo relleno (en favoritos) / contorno rojo (no en favoritos)
*/
"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import ResultModal from "@/components/ui/modal";

interface FavButtonProps {
  id_usuario: string;
  id_publicacion: string;
  initialFav?: boolean;
  onRemoved?: (id_publicacion: string) => void;
}

export default function FavButton({
  id_usuario,
  id_publicacion,
  initialFav = true,
  onRemoved,
}: FavButtonProps) {
  const [esFavorito, setEsFavorito] = useState(initialFav);
  const [cargando, setCargando] = useState(false);

  const [mostrarConfirm, setMostrarConfirm] = useState(false);

  const [modal, setModal] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const agregarFavorito = async () => {
    try {
      setCargando(true);
      const res = await fetch("/backend/perfil/addFav", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario, id_publicacion }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "No se pudo agregar a favoritos");
      }

      setEsFavorito(true);
      setModal({
        type: "success",
        title: "¡Agregado!",
        message: "La publicación fue añadida a tus favoritos.",
      });
    } catch (err: any) {
      setModal({
        type: "error",
        title: "Error",
        message: err.message || "No se pudo agregar a favoritos.",
      });
    } finally {
      setCargando(false);
    }
  };

  const confirmarQuitar = async () => {
    setMostrarConfirm(false);
    try {
      setCargando(true);
      const res = await fetch(
        `/backend/perfil/deleteFav?id_usuario=${id_usuario}&id_publicacion=${id_publicacion}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "No se pudo quitar de favoritos");
      }

      setEsFavorito(false);
      onRemoved?.(id_publicacion);
    } catch (err: any) {
      setModal({
        type: "error",
        title: "Error",
        message: err.message || "No se pudo quitar de favoritos.",
      });
    } finally {
      setCargando(false);
    }
  };

  const handleClick = () => {
    if (cargando) return;
    if (esFavorito) {
      setMostrarConfirm(true);
    } else {
      agregarFavorito();
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={cargando}
        title={esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
        className={`
          flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all duration-200
          ${esFavorito
            ? "border-red-500 bg-red-500 hover:bg-red-600 hover:border-red-600"
            : "border-red-500 bg-transparent hover:bg-red-500/10"
          }
          ${cargando ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <Heart
          size={16}
          className={esFavorito ? "fill-white text-white" : "fill-transparent text-red-500"}
        />
      </button>

      {mostrarConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl text-center">
            <Heart size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2 text-slate-800">
              ¿Quitar de favoritos?
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              ¿Estás seguro de quitar esta publicación de tus favoritos?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setMostrarConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarQuitar}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                Sí, quitar
              </button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <ResultModal
          type={modal.type}
          title={modal.title}
          message={modal.message}
          onClose={() => setModal(null)}
          onRetry={
            modal.type === "error"
              ? () => { setModal(null); esFavorito ? setMostrarConfirm(true) : agregarFavorito(); }
              : undefined
          }
        />
      )}
    </>
  );
}
