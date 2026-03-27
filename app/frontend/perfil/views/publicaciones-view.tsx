/*  Dev: Candy Camila Ordoñez Pinto
    Fecha: 25/03/2026
    Funcionalidad: Vista de Mis Publicaciones dentro del perfil del usuario
      - @param {call} - espera a ser llamada desde el menú del perfil
      - @return {PublicacionesView} - muestra la lista de publicaciones del usuario
*/
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PublicacionCard, { Publicacion } from "./publicacion-card";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
    // TODO: reemplazar con GET /api/publicaciones cuando la BD esté lista
    const cargarPublicaciones = async () => {
      try {
        setCargando(true);
        // Simulación de llamada a la BD
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

  const handleEliminar = (id: string) => {
    // TODO: feat eliminar — conectar con DELETE /api/publicaciones/:id
    console.log("Eliminar publicación:", id);
  };

  const handleInfo = (id: string) => {
    // TODO: feat botones — redirigir a /publicaciones/:id
    router.push(`/publicaciones/${id}`);
  };

  return (
    <Card className="border-none bg-transparent shadow-none text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold border-b border-white/20 pb-2 tracking-tight w-full">
          Mis publicaciones
        </CardTitle>
        {/* TODO: feat botón agregar — botón + Agregar va aquí */}
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pt-4">
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

        {/* TODO: feat paginación — componente Paginacion va aquí */}
      </CardContent>
    </Card>
  );
}
