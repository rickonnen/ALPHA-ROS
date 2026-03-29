"use client";

import { useState } from "react";

export default function HistorialView() {

  const [historial, setHistorial] = useState([
    {
      id: 1,
      titulo: "Casa en venta - Cochabamba",
      precio: "$120,000"
    },
    {
      id: 2,
      titulo: "Departamento en alquiler",
      precio: "$500"
    }
  ]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Historial</h2>

      {historial.length === 0 ? (
        <p>No hay historial</p>
      ) : (
        <div className="space-y-4">
          {historial.map((item) => (
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
      )}
    </div>
  );
}