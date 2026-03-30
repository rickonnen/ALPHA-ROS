/*  Dev: Candy Camila Ordoñez Pinto
    Fecha: 27/03/2026
    Funcionalidad: Vista de Mis Publicaciones dentro del perfil del usuario
      - @param {id_usuario} - ID del usuario autenticado pasado desde page.tsx
      - @return {PublicacionesView} - muestra la lista de publicaciones del usuario
*/
/*  Dev: Candy Camila Ordoñez Pinto
    Fecha: 27/03/2026
    Funcionalidad: Card individual de publicación dentro de Mis Publicaciones
      - @param {publicacion} - datos de la publicación (titulo, zona, tipo, imagen)
      - @param {onEliminar} - función callback para eliminar la publicación
      - @param {onInfo} - función callback para ver el detalle de la publicación
      - @return {PublicacionCard} - muestra miniatura, título, zona, tipo y botones de acción
*/
/*  Dev: Candy Camila Ordoñez Pinto
    Fecha: 28/03/2026
    Funcionalidad: Botón "+ Agregar" en la vista Mis Publicaciones
      - Agrega botón en la parte superior derecha del header de la sección
      - Al hacer clic redirige a /publicaciones/nueva usando useRouter de Next.js
      - @return {void} - solo navegación, no incluye el formulario
*/

/*  Dev: Candy Camila Ordoñez Pinto
    Fecha: 28/03/2026
    Funcionalidad: Vista de Mis Publicaciones dentro del perfil del usuario
      - Consume GET /backend/perfil/misPublicaciones?id_usuario=...&page=...&limit=...
      - Lista hasta 10 publicaciones por página con scroll interno (max-h 300px)
      - Paginación con numeritos si hay más de 10
      - El botón Eliminar (dentro de PublicacionCard) abre un AlertDialog de confirmación
        con ícono de advertencia antes de ejecutar el DELETE
      - Botón "+ Agregar" en el header redirige a /publicaciones/nueva
      - @param {id_usuario} - ID del usuario autenticado pasado desde page.tsx
*/

"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PublicacionCard, { Publicacion } from "./publicacion-card";

interface PublicacionesViewProps {
  id_usuario: string;
}

const ITEMS_POR_PAGINA = 10;

export default function PublicacionesView({
  id_usuario,
}: PublicacionesViewProps) {
  const router = useRouter();
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [idAEliminar, setIdAEliminar] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    let activo = true;
    const cargarPublicaciones = async () => {
      try {
        setCargando(true);
        const res = await fetch(
          `/backend/perfil/misPublicaciones?id_usuario=${id_usuario}&page=${paginaActual}&limit=${ITEMS_POR_PAGINA}`,
        );
        if (!res.ok) throw new Error("No se pudieron cargar las publicaciones");
        const json = await res.json();
        if (activo) {
          setPublicaciones(json.data);
          setTotalPaginas(Math.ceil(json.total / ITEMS_POR_PAGINA));
        }
      } catch (err) {
        console.error("Error al cargar publicaciones:", err);
        if (activo) setError("No se pudieron cargar las publicaciones");
      } finally {
        if (activo) setCargando(false);
      }
    };
    cargarPublicaciones();
    return () => {
      activo = false;
    };
  }, [id_usuario, paginaActual]);

  const handleEliminar = (id: string) => {
    setIdAEliminar(id);
  };

  const confirmarEliminar = async () => {
    if (!idAEliminar) return;
    try {
      setEliminando(true);
      setError(null);

      const res = await fetch(
        `/backend/perfil/deletePublicacion?id_publicacion=${idAEliminar}&id_usuario=${id_usuario}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar");
      }

      const nuevas = publicaciones.filter((p) => p.id !== idAEliminar);
      setPublicaciones(nuevas);
      setIdAEliminar(null);

      const nuevoTotal = Math.ceil(nuevas.length / ITEMS_POR_PAGINA);
      if (paginaActual > nuevoTotal && nuevoTotal > 0) {
        setPaginaActual(nuevoTotal);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la publicación.";
      setError(message);
    } finally {
      setEliminando(false);
    }
  };

  const handleInfo = (id: string) => {
    // TODO: conectar con el equipo de detalle de publicación
    console.log("Ver info de publicación:", id);
  };

  return (
    <>
      <Card className="border-none bg-transparent shadow-none text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-xl font-bold tracking-tight">
              Mis publicaciones
            </CardTitle>
            <Button
              onClick={() => router.push("/publicaciones/nueva")}
              size="sm"
              className="flex-shrink-0 bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200"
            >
              + Agregar
            </Button>
          </div>
          <div className="border-b border-white/20 w-full mt-1" />
        </CardHeader>

        <CardContent className="flex flex-col pt-4">
          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm text-center py-2">{error}</p>
          )}

          {/* Estado de carga */}
          {cargando && (
            <>
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="h-24 mb-2 w-full rounded-md bg-white/10"
                />
              ))}
            </>
          )}

          {/* Lista vacía */}
          {!cargando && publicaciones.length === 0 && (
            <p className="text-white/40 text-sm text-center py-8">
              No tienes publicaciones registradas.
            </p>
          )}

          {/* Lista de publicaciones paginadas */}
          {!cargando && publicaciones.length > 0 && (
            <div className="block gap-2 overflow-y-auto pr-1 max-h-[50vh] md:max-h-[300px]">
              {publicaciones.map((pub) => (
                <PublicacionCard
                  key={pub.id}
                  publicacion={pub}
                  onEliminar={handleEliminar}
                  onInfo={handleInfo}
                />
              ))}
            </div>
          )}

          {/* Paginación */}
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

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                (num) => (
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
                ),
              )}

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

      {/* Modal de confirmación */}
      <AlertDialog
        open={!!idAEliminar}
        onOpenChange={() => setIdAEliminar(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-red-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <AlertDialogTitle>¿Eliminar publicación?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              Esta acción no se puede deshacer. La publicación será eliminada
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={eliminando}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarEliminar}
              disabled={eliminando}
              className="bg-red-500 hover:bg-red-600"
            >
              {eliminando ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
