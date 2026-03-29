'use client';

import React, { useState, useEffect } from 'react';
import { SortSelect } from "@/components/ui/Search/SortSelect";
import { getPublicacionesOrdenadas } from '@/app/backend/filter_search_page/services';

export default function SearchPage() {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSort = async (valor: string) => {
    setLoading(true);
    const data = await getPublicacionesOrdenadas(valor);
    setPublicaciones(data);
    setLoading(false);
  };

  useEffect(() => {
    handleSort('fecha-reciente');
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
      
      {/* --- MÓVIL --- */}
      <div className="flex md:hidden flex-wrap items-center justify-between mb-6 border-b pb-4">
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={isMapOpen} onChange={() => setIsMapOpen(!isMapOpen)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a67c52]"></div>
          </label>
          <span className="text-sm font-medium text-gray-700">Mapa</span>
        </div>
        {/* Tamaño fijo en móvil para que no salte */}
        <div className="w-[380px] max-w-full">
          <SortSelect onSortChange={handleSort} />
        </div>
      </div>

      <div className={`grid grid-cols-1 ${isMapOpen ? 'md:grid-cols-12' : 'md:grid-cols-4'} gap-8`}>
        
        <aside className={`hidden md:block ${isMapOpen ? 'md:col-span-3' : 'md:col-span-1'} space-y-6`}>
          <div className="sticky top-8">
            <h2 className="text-xl font-bold mb-4">FILTROS</h2>
            <div className="flex items-center gap-2 mb-6 border-b pb-4 text-sm font-medium text-gray-700">Mapa</div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-400">[Filtros de Carlos]</div>
          </div>
        </aside>

        <main className={`${isMapOpen ? 'md:col-span-4' : 'md:col-span-3'}`}>
          <div className="hidden md:flex justify-between items-center mb-6">
            <div>
              <nav className="text-sm text-gray-500 mb-1 underline">Casas / Venta / Bolivia</nav>
              <h1 className="text-xl font-bold text-gray-900">{publicaciones.length} Casas en Venta</h1>
            </div>
            {/* TAMAÑO ESTÁNDAR FIJO: 380px asegura que el texto largo entre sin cortes */}
            <div className="w-[380px] flex-shrink-0">
               <SortSelect onSortChange={handleSort} />
            </div>
          </div>

          <div className={`grid grid-cols-1 ${isMapOpen ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} gap-6`}>
            {loading ? (
              <div className="col-span-full text-center py-20 text-gray-400 italic">Cargando...</div>
            ) : (
              publicaciones.map((pub) => (
                <div key={pub.id_publicacion} className="border border-gray-200 rounded-xl p-4 flex flex-col shadow-sm">
                  <div className="bg-gray-100 h-48 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    <img src={pub.imagen_url || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=400"} alt="Inmueble" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[#a67c52] font-bold text-xl">Bs. {pub.precio.toLocaleString()}</span>
                    <h3 className="font-semibold text-gray-800 line-clamp-1">{pub.titulo}</h3>
                    <div className="flex gap-3 mt-2 text-xs text-gray-500">
                      <span>{pub.superficie} m²</span>
                      <span>{pub.habitaciones || 0} Hab.</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}