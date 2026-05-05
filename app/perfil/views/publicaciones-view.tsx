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
/* Dev: Camila Magne Hinojosa - xdev/sow-camilaM
    Fecha: 17/04/2026
    Fix: Actualización del título de la sección principal a "Publicaciones".
    Feat: Implementación de estados focus-visible para navegación por teclado en el botón "+ Agregar".
*/
/* Dev: Camila Magne Hinojosa - xdev/sow-camilaM
    Fecha: 18/04/2026
    Feat: Integración del modal de límite de publicaciones (Criterio 11).
*/
/* Dev: Camila Magne Hinojosa - xdev/sow-camilaM
    Fecha: 22/04/2026
    Fix: Se aplicó estado visual "disabled" (grisáceo y cursor bloqueado) en el botón "+ Agregar" cuando el límite de publicaciones llega a 0.
*/
/*
 * Dev: Gustavo Montaño
 * Fecha: 25/04/2026
 * Update: Fix de modales(gratuitos y de planes) y adición de limpieza de sessionStorage en botón "Agregar".
 * Funcionalidad: Vista de modales segun el plan
 - @param {PublicacionesViewProps} id_usuario - ID del usuario actual autenticado.
 - @return {JSX.Element} Interfaz de lista de publicaciones y modales.
 */
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PublicacionCard, { Publicacion } from "./publicacion-card";
import { useAuth } from "@/app/auth/AuthContext";
import { verificarEstadoPublicacion } from "@/features/publicacion/modal/action";
import FreePublicationLimitModal from "@/features/publicacion/components/FreePublicationLimitModal";
import PlanLimitModal from "@/features/publicacion/components/PlanLimitModal";
interface PublicacionesViewProps {
  id_usuario: string;
}

const ITEMS_POR_PAGINA = 5;

export default function PublicacionesView({
  id_usuario,
}: PublicacionesViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [publicacionesRestantes, setPublicacionesRestantes] = useState(0);
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [idAEliminar, setIdAEliminar] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [bolShowModalGratuito, setBolShowModalGratuito] = useState(false);
  const [bolShowModalPlan, setBolShowModalPlan] = useState(false);
  const [bolChecking, setBolChecking] = useState(false);

  useEffect(() => {
    let activo = true;
    const cargarPublicaciones = async () => {
      try {
        setCargando(true);
        const [resPubs, resRestantes] = await Promise.all([
          fetch(
            `/api/perfil/getPublicacion?id_usuario=${id_usuario}&page=${paginaActual}&limit=${ITEMS_POR_PAGINA}`,
          ),
          fetch(`/api/perfil/publicaciones-restantes?id_usuario=${id_usuario}`),
        ]);

        if (!resPubs.ok)
          throw new Error("No se pudieron cargar las publicaciones");

        const jsonPubs = await resPubs.json();
        const jsonRestantes = await resRestantes.json();

        if (activo) {
          setPublicaciones(jsonPubs.data);
          setTotalPaginas(Math.ceil(jsonPubs.total / ITEMS_POR_PAGINA));
          setPublicacionesRestantes(
            jsonRestantes.cant_publicaciones_restantes ?? 0,
          );
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
        `/api/perfil/deletePublicacion?id_publicacion=${idAEliminar}&id_usuario=${id_usuario}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar");
      }

      const nuevas = publicaciones.filter((p) => p.id !== idAEliminar);
      setPublicaciones(nuevas);
      setPublicacionesRestantes((prev) => prev + 1);
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

  const handleCambiarEstado = async (id_pub: string, nuevoEstado: number): Promise<boolean> => {
    try {
      setError(null);
      // Construimos la URL con los parámetros necesarios para tu nueva ruta PATCH
      const url = `/api/perfil/updateEstadoPublicacion?id_publicacion=${id_pub}&id_estado=${nuevoEstado}&id_usuario=${id_usuario}`;

      const res = await fetch(url, { method: "PATCH" });

      if (res.ok) {
        const data = await res.json();
        // Actualización local: buscamos la publicación en el array y cambiamos su id_estado
        setPublicaciones((prev) =>
          prev.map((p) =>
            p.id === id_pub ? { ...p, id_estado: nuevoEstado } : p,
          ),
        );
        return true; 

      } else {
        const errorData = await res.json();

        //console.error("Error desde el servidor:", errorData.error);
        if (res.status === 400) {
           setBolShowModalPlan(true); 
        } else {
           setError(errorData.error || "No se pudo actualizar el estado de la publicación.");
        }
        return false;
      }
    } catch (err) {
      console.error("Error de red:", err);
      setError("Error de conexión al intentar cambiar el estado.");
      return false;
    }
  };
  
  const handleAgregar = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setBolChecking(true);
    try {
      const objEstado = await verificarEstadoPublicacion(user.id);
      if (objEstado.bolLimiteAlcanzado) {
        if (objEstado.strTipoLimite === "plan") {
          setBolShowModalPlan(true);
        } else {
          setBolShowModalGratuito(true);
        }
        return; // Salimos de la función si alcanzó el límite
      }
      // FIX: Limpiar las llaves del sessionStorage del Formulario Dinámico
      const KEYS_TO_CLEAN = [
        'publicacion_currentStep', 
        'publicacion_completedSteps', 
        'datosAviso', 
        'categoriaYEstado', 
        'ubicacion', 
        'caracteristicasDetalle', 
        'imagenesPropiedad_interacted', 
        'caracteristicasImagenesPreview', 
        'caracteristicasImagenesNombres', 
        'videoPropiedad', 
        'descripcionPropiedad', 
        'imagenesIniciales'
      ];
      KEYS_TO_CLEAN.forEach(k => { 
        try { sessionStorage.removeItem(k) } catch { } 
      });

      router.push("/publicacion/formularioPublicacion");
    } catch {
      // FIX: Limpiamos también en caso de error por seguridad antes de redirigir
      const KEYS_TO_CLEAN = [
        'publicacion_currentStep', 'publicacion_completedSteps', 'datosAviso', 
        'categoriaYEstado', 'ubicacion', 'caracteristicasDetalle', 
        'imagenesPropiedad_interacted', 'caracteristicasImagenesPreview', 
        'caracteristicasImagenesNombres', 'videoPropiedad', 
        'descripcionPropiedad', 'imagenesIniciales'
      ];
      KEYS_TO_CLEAN.forEach(k => { 
        try { sessionStorage.removeItem(k) } catch { } 
      });
      
      router.push("/publicacion/formularioPublicacion");
    } finally {
      setBolChecking(false);
    }
  };

  return (
    <>
      <Card className="border-none bg-transparent shadow-none text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-xl font-bold tracking-tight">
              PUBLICACIONES
            </CardTitle>
            <div className="flex items-center justify-center gap-2">
              <span className="text-white/60 text-sm whitespace-nowrap">
                {publicacionesRestantes} publicaciones disponibles
              </span>
  
              <Button
                onClick={handleAgregar}
                disabled={bolChecking}
                size="sm"
                className={`flex-shrink-0 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--secondary)] ${
                  publicacionesRestantes <= 0
                    ? "bg-gray-400 hover:bg-gray-500 cursor-not-allowed opacity-80" 
                    : "bg-[var(--secondary)] hover:bg-[var(--secondary)]/80"
                }`}
              >
                {bolChecking ? "..." : "+ Agregar"}
              </Button>
            </div>
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
            <div className="flex flex-col gap-3 overflow-y-auto pr-1">
              {publicaciones.map((pub) => (
                <PublicacionCard
                  key={pub.id}
                  publicacion={pub}
                  onEliminar={handleEliminar}
                  onCambiarEstado={handleCambiarEstado}
                />
              ))}
            </div>
          )}

          {/* Paginación */}
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

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                (num) => (
                  <Button
                    key={num}
                    variant="ghost"
                    size="sm"
                    onClick={() => setPaginaActual(num)}
                    className={`w-8 h-8 rounded-full text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary)] ${
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

      {/* Modal de confirmación de eliminación */}
      {idAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center gap-4">
            {/* Ícono */}
            <div className="w-14 h-14 rounded-full border-2 border-red-400 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7 text-red-500"
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

            {/* Texto */}
            <h2 className="text-lg font-bold text-gray-900">
              ¿Eliminar publicación?
            </h2>
            <p className="text-sm text-gray-500 text-center">
              ¿Estás seguro de eliminar esta publicación permanentemente?
            </p>

            {/* Botones */}
            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={() => setIdAEliminar(null)}
                disabled={eliminando}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                disabled={eliminando}
                className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition disabled:opacity-50"
              >
                {eliminando ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal límite de publicaciones gratuitas */}
      <FreePublicationLimitModal
        bolOpen={bolShowModalGratuito}
        onBack={() => setBolShowModalGratuito(false)}
      />

      {/* Modal límite de plan activo excedido */}
      <PlanLimitModal
        bolOpen={bolShowModalPlan}
        onBack={() => setBolShowModalPlan(false)}
      />
    </>
  );
}

