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

import { useState , useEffect } from "react";
import { Heart } from "lucide-react";
import ResultModal from "@/components/ui/modal";
import { useAuth } from "@/app/auth/AuthContext";

interface FavButtonProps {
  id_publicacion: string;
  initialFav?: boolean;
  onRemoved?: (id_publicacion: string) => void;
}

export default function FavButton({id_publicacion, initialFav, onRemoved }: FavButtonProps) {
  const { user } = useAuth();
  const id_usuario = user?.id ?? "";

  const [esFavorito, setEsFavorito] = useState(initialFav ?? false);
  const [cargandoEstado, setCargandoEstado] = useState(initialFav === undefined);

  const [cargando, setCargando] = useState(false);
  const [mostrarConfirm, setMostrarConfirm] = useState(false);
  const [modal, setModal] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (initialFav !== undefined || !id_usuario) {
      setCargandoEstado(false);
      return;
    }

    const verificar = async () => {
      try {
        const res = await fetch(`/api/perfil/checkFav?id_usuario=${id_usuario}&id_publicacion=${id_publicacion}`);
        if (res.ok) {
          const json = await res.json();
          setEsFavorito(json.esFavorito);
        }
      } catch {
        // Si falla, queda en false (safe default)
      } finally {
        setCargandoEstado(false);
      }
    };

    verificar();
  }, [id_usuario, id_publicacion, initialFav]);

  const agregarFavorito = async () => {
    if (!id_usuario) {
      setModal({ type: "error", title: "Error", message: "Debes iniciar sesión para guardar favoritos." });
      return;
    }
    try {
      setCargando(true);
      const res = await fetch("/api/perfil/addFav", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id_usuario, id_publicacion }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "No se pudo agregar a favoritos");
      }
      setEsFavorito(true);
      setModal({ type: "success", title: "¡Agregado!", message: "La publicación fue añadida a tus favoritos." });
    } catch (err: any) {
      setModal({ type: "error", title: "Error", message: err.message || "No se pudo agregar a favoritos." });
    } finally {
      setCargando(false);
    }
  };

  const confirmarQuitar = async () => {
    setMostrarConfirm(false);
    try {
      setCargando(true);
      const res = await fetch(
        `/api/perfil/deleteFav?id_usuario=${id_usuario}&id_publicacion=${id_publicacion}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "No se pudo quitar de favoritos");
      }
      setEsFavorito(false);
      onRemoved?.(id_publicacion);
    } catch (err: any) {
      setModal({type: "error", title: "Error", message: err.message || "No se pudo quitar de favoritos."});
    } finally {
      setCargando(false);
    }
  };

  const handleClick = () => {
    if (cargando) return;
    esFavorito ? setMostrarConfirm(true) : agregarFavorito();
  };

  const btnBase = "flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all duration-200";
  const btnActivo  = "border-red-500 bg-red-500 hover:bg-red-600 hover:border-red-600 shadow-lg shadow-red-500/50 hover:shadow-red-500/70";
const btnInactivo = "border-gray-400 bg-gray-400 hover:bg-gray-500 hover:border-gray-500 shadow-md shadow-gray-400/30";

  return (
    <>
      <button
        onClick={handleClick}
        disabled={cargando || cargandoEstado}
        title={esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
        className={`
          ${btnBase}
          ${esFavorito ? btnActivo : btnInactivo}
          ${(cargando || cargandoEstado) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        {cargandoEstado
          ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <Heart size={16} className="fill-white text-white" />
        }
      </button>

      {mostrarConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl text-center">
            <Heart size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2 text-slate-800">¿Quitar de favoritos?</h3>
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
