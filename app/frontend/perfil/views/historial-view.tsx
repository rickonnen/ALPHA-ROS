"use client";

import { useState, useEffect } from "react";
type HistorialItem = {
  id: number;
  titulo: string;
  precio: string;
};
export default function HistorialView() {

  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [page, setPage] = useState(1);
  useEffect(() => {
  fetch("/api/historial")
    .then((res) => res.json())
    .then((data) => {
      console.log("DATA:", data); // para verificar
      setHistorial(data);
    })
    .catch((error) => console.error("Error:", error));
  }, []);
  
  const itemsPerPage = 1;

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
              <div key={item.id} className="bg-white text-black p-4 rounded-lg flex justify-between items-center">
                
                <div>
                  <h3 className="font-bold">{item.titulo}</h3>
                  <p>{item.precio}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => alert(`Viewing: ${item.titulo}`)} 
                    className="bg-blue-500 text-white px-3 py-1 rounded">
                    Info
                  </button>
                    
                  <button
                    onClick={() => {
                      const confirmDelete = confirm("Are you sure you want to delete this item?");
                      if (confirmDelete) {
                        setHistorial(historial.filter(h => h.id !== item.id));
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