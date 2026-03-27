/*  Dev: Candy Camila Ordoñez Pinto
    Fecha: 27/03/2026
    Funcionalidad: Vista de Mis Publicaciones dentro del perfil del usuario
      - @param {call} - espera a ser llamada desde el menú del perfil
      - @return {PublicacionesView} - muestra la lista de publicaciones del usuario
*/
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import PublicacionCard, { Publicacion } from "./publicacion-card";

// ID TEMPORAL: falta el id de los de sign in
const ID_USUARIO_HARDCODEADO = "a1b2c3d4-0003-0003-0003-000000000003";

// Mock de datos hasta que el GET /backend/publicaciones esté listo
const MOCK_PUBLICACIONES: Publicacion[] = [
  {
    id: "1",
    titulo: "Casa en alquiler - Zona Sur",
    zona: "Zona Sur",
    tipo: "Alquiler",
    imagen: null,
  },
  {
    id: "2",
    titulo: "Departamento en venta - Quillacollo",
    zona: "Quillacollo",
    tipo: "Venta",
    imagen: null,
  },
  {
    id: "3",
    titulo: "Terreno en venta - Tiquipaya",
    zona: "Tiquipaya",
    tipo: "Venta",
    imagen: null,
  },
  {
    id: "4",
    titulo: "Oficina en alquiler - Centro",
    zona: "Centro",
    tipo: "Alquiler",
    imagen: null,
  },
];

export default function PublicacionesView() {
  const router = useRouter();
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [idAEliminar, setIdAEliminar] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: reemplazar con GET /backend/publicaciones?id_usuario=... cuando esté listo
    const cargarPublicaciones = async () => {
      try {
        setCargando(true);
        await new Promise((r) => setTimeout(r, 800));
        setPublicaciones(MOCK_PUBLICACIONES);
      } catch (error) {
        console.error("Error al cargar publicaciones:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarPublicaciones();
  }, []);

  // Abre el modal de confirmación
  const handleEliminar = (id: string) => {
    setIdAEliminar(id);
  };

  // Confirma y ejecuta la eliminación
  const confirmarEliminar = async () => {
    if (!idAEliminar) return;
    try {
      setEliminando(true);
      setError(null);

      const res = await fetch(
        `/backend/perfil/delete?id_publicacion=${idAEliminar}&id_usuario=${ID_USUARIO_HARDCODEADO}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar");
      }

      // Actualiza la lista sin recargar
      setPublicaciones((prev) => prev.filter((p) => p.id !== idAEliminar));
      setIdAEliminar(null);
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
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold border-b border-white/20 pb-2 tracking-tight w-full">
            Mis publicaciones
          </CardTitle>
          {/* TODO: feat botón agregar */}
        </CardHeader>

        <CardContent className="flex flex-col gap-3 pt-4">
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
                  className="h-24 w-full rounded-md bg-white/10"
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

          {/* Lista de publicaciones */}
          {!cargando &&
            publicaciones.map((pub) => (
              <PublicacionCard
                key={pub.id}
                publicacion={pub}
                onEliminar={handleEliminar}
                onInfo={handleInfo}
              />
            ))}

          {/* TODO: feat paginación */}
        </CardContent>
      </Card>

      {/* Modal de confirmación */}
      <AlertDialog
        open={!!idAEliminar}
        onOpenChange={() => setIdAEliminar(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar publicación?</AlertDialogTitle>
            <AlertDialogDescription>
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
