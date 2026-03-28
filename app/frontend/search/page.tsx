'use client';

import React, { useState } from 'react';
import { SortSelect } from "@/components/ui/Search/SortSelect";

export default function SearchPage() {
  const [isMapOpen, setIsMapOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
      
      {/* --- MÓVIL (Switch de Diego) --- */}
      <div className="flex md:hidden flex-wrap items-center justify-between mb-6 border-b pb-4">
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={isMapOpen} onChange={() => setIsMapOpen(!isMapOpen)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a67c52]"></div>
          </label>
          <span className="text-sm font-medium text-gray-700">Mapa</span>
        </div>
        <SortSelect />
      </div>

      <div className={`grid grid-cols-1 ${isMapOpen ? 'md:grid-cols-12' : 'md:grid-cols-4'} gap-8`}>
        
        {/* SIDEBAR (Desktop) */}
        <aside className={`hidden md:block ${isMapOpen ? 'md:col-span-3' : 'md:col-span-1'} space-y-6`}>
          <div className="sticky top-8">
            <h2 className="text-xl font-bold mb-4">FILTROS</h2>
            
            {/* El Switch del Mapa de Diego que pediste */}
            <div className="flex items-center gap-2 mb-6 border-b pb-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isMapOpen} onChange={() => setIsMapOpen(!isMapOpen)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a67c52]"></div>
              </label>
              <span className="text-sm font-medium text-gray-700">Mapa</span>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-400">
              [Filtros de Carlos]
            </div>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className={`${isMapOpen ? 'md:col-span-4' : 'md:col-span-3'}`}>
          <div className="hidden md:flex justify-between items-center mb-6">
            <div>
              <nav className="text-sm text-gray-500 mb-1 underline">Casas / Venta / Bolivia</nav>
              <h1 className="text-xl font-bold text-gray-900">
                150 Casas en Venta en Bolivia
              </h1>
            </div>
            {/* TU COMPONENTE ORIGINAL */}
            <div className="flex-shrink-0">
               <SortSelect />
            </div>
          </div>

          <div className={`grid grid-cols-1 ${isMapOpen ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} gap-6`}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border-2 border-dashed border-gray-300 rounded-xl h-64 flex flex-col items-center justify-center text-gray-400">
                <span>Inmueble {i}</span>
                {isMapOpen && <span className="text-[10px] mt-1 text-blue-500">(Modo Mapa)</span>}
              </div>
            ))}
          </div>
        </main>

        {/* MAPA DE DIEGO */}
        {isMapOpen && (
          <div className="md:col-span-5 h-[75vh] sticky top-8 bg-gray-100 border-2 border-gray-200 rounded-2xl flex items-center justify-center text-gray-400">
            [Componente Mapa Activo de Diego]
          </div>
        )}
      </div>
    </div>
  );
}