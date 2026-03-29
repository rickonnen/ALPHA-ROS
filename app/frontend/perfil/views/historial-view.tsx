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
export default function HistorialView() {

  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [page, setPage] = useState(1);
  useEffect(() => {
  fetch(`/api/historial?id_usuario=a1b2c3d4-0003-0003-0003-000000000003`)
    .then((res) => res.json())
    .then((data) => {
      console.log("DATA:", data); // para verificar
      setHistorial(data);
    })
    .catch((error) => console.error("Error:", error));
  }, []);
  
  const itemsPerPage = 5;

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  const currentItems = historial.slice(start, end);

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
            {currentItems.map((item) => (
              <div key={item.id_publicacion} className="bg-white text-black p-4 rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <img
                    src={item.Publicacion.Imagen[0]?.url_imagen ?? "https://via.placeholder.com/80"}
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
              onClick={() => setPage(page - 1)} 
              disabled={page === 1}
              className="bg-gray-500 px-3 py-1 rounded"
            >
              anterior
            </button>

            <button 
              onClick={() => setPage(page + 1)} 
              disabled={end >= historial.length}
              className="bg-gray-500 px-3 py-1 rounded"
            >
              posterior
            </button>
          </div>
        </>
      )}
    </div>
  );
}