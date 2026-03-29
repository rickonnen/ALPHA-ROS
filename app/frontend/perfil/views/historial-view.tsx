/*  Dev: Luis - xdev/sow-luisc
    Fecha: 28/03/2026
    Funcionalidad: Vista de Historial dentro del perfil del usuario
      - Consume GET /api/historial?id_usuario=...
      - Lista hasta 5 items por página con scroll interno (max-h 300px)
      - Paginación con numeritos si hay más de 5
      - Botón eliminar remueve el item del historial en frontend
      - @param {id_usuario} - ID del usuario autenticado pasado desde page.tsx
*/
"use client";

import { useState, useEffect } from "react";
type HistorialItem = {
  id_publicacion: number;
  fecha: string;
  Publicacion: {
    titulo: string | null;
    precio: number | null;
    Moneda: { simbolo: string } | null;
    TipoOperacion: { nombre_operacion: string | null } | null;
    Imagen: { url_imagen: string | null }[];
  };
};

interface HistorialViewProps {
  id_usuario: string;
}

const ITEMS_POR_PAGINA = 5;

export default function HistorialView({ id_usuario }: HistorialViewProps) {

const [historial, setHistorial] = useState<HistorialItem[]>([]);
const [cargando, setCargando] = useState(true);
const [error, setError] = useState<string | null>(null);
const [paginaActual, setPaginaActual] = useState(1);

useEffect(() => {
  const cargarHistorial = async () => {
    try {
      setCargando(true);
      const res = await fetch(`/api/historial?id_usuario=${id_usuario}`);
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
  .slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

const handleEliminar = (id_publicacion: number) => {
  const nuevos = historial.filter((h) => h.id_publicacion !== id_publicacion);
  setHistorial(nuevos);
  const nuevoTotal = Math.ceil(nuevos.length / ITEMS_POR_PAGINA);
  if (paginaActual > nuevoTotal && nuevoTotal > 0) {
    setPaginaActual(nuevoTotal);
  }
};

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Historial</h2>

      {historial.length === 0 ? (
        <p className="text-center text-gray-300">
          No historial available yet
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {historialPaginado.map((item) => (
              <div key={item.id_publicacion} className="bg-white text-black p-4 rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <img
                    src={item.Publicacion?.Imagen?.[0]?.url_imagen ?? "https://via.placeholder.com/80"}
                    alt={item.Publicacion.titulo ?? ""}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-bold">{item.Publicacion.titulo ?? "Sin título"}</h3>
                    <p>{item.Publicacion.Moneda?.simbolo} {item.Publicacion.precio ?? "Sin precio"}</p>
                    <p className="text-sm text-gray-500">{item.Publicacion.TipoOperacion?.nombre_operacion ?? ""}</p>
                  </div>
                  </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => alert(`Viewing: ${item.Publicacion.titulo}`)}
                    className="bg-blue-500 text-white px-3 py-1 rounded">
                    Info
                  </button>
                    
                  <button
                    onClick={() => {
                      const confirmDelete = confirm("Are you sure you want to delete this item?");
                      if (confirmDelete) {
                        setHistorial(historial.filter(h => h.id_publicacion !== item.id_publicacion));
                      }
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded">
                    Eliminar
                  </button>
                </div>

              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setPaginaActual((p) => p - 1)}
              disabled={paginaActual === 1}
              className="bg-gray-500 px-3 py-1 rounded disabled:opacity-50"
            >
              anterior
            </button>
            <span className="px-3 py-1">Página {paginaActual}</span>
            <button
              onClick={() => setPaginaActual((p) => p + 1)}
              disabled={paginaActual === totalPaginas}
              className="bg-gray-500 px-3 py-1 rounded disabled:opacity-50"
            >
              posterior
            </button>
          </div>
        </>
      )}
    </div>
  );
}