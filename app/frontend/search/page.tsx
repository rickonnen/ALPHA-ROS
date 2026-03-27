'use client';

import React, { useState } from 'react';
// Importamos tu componente de la flechita
import { SortSelect } from "./componentes/SortSelect"; 

export default function SearchPage() {
  // El estado del mapa que creó Diego
  const [isMapOpen, setIsMapOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 bg-white min-h-screen font-sans">
      
      {/* --- VISTA MÓVIL --- */}
      <div className="flex md:hidden flex-wrap items-center justify-between gap-4 mb-6 border-b pb-4">
        <button 
          onClick={() => setIsMapOpen(!isMapOpen)}
          className="bg-[#E4C5A5] text-[#2C2C2C] px-6 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-[#d4b08c] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          {isMapOpen ? 'Cerrar Mapa' : 'Filtros y Mapa'}
        </button>
        
        {/* Tu SortSelect integrado en móvil */}
        <div className="w-full sm:w-auto">
          <SortSelect />
        </div>
      </div>

      <div className={`grid grid-cols-1 ${isMapOpen ? 'md:grid-cols-12' : 'md:grid-cols-4'} gap-8`}>
        
        {/* --- SIDEBAR (Desktop) --- */}
        <aside className={`hidden md:block ${isMapOpen ? 'md:col-span-3' : 'md:col-span-1'} space-y-6`}>
          <div className="sticky top-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4 uppercase tracking-tight">Filtros</h2>
            <div className="border border-slate-200 rounded-lg p-10 text-center text-slate-400 text-sm border-dashed bg-slate-50">
              [Espacio para Filtros]
            </div>
          </div>
        </aside>

        {/* --- CONTENIDO PRINCIPAL --- */}
        <main className={`${isMapOpen ? 'md:col-span-4' : 'md:col-span-3'}`}>
          <div className="hidden md:flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b pb-4 border-slate-100">
            <div>
              <nav className="text-sm text-slate-500 underline mb-1">Casas / Venta / Bolivia</nav>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight italic">
                150 Propiedades Disponibles
              </h1>
            </div>

            {/* INTEGRACIÓN DE TU COMPONENTE EN DESKTOP */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-600 uppercase tracking-widest">
                Ordenar por:
              </span>
              <SortSelect />
            </div>
          </div>

          {/* GRID DE CARDS (Responsive) */}
          <div className={`grid grid-cols-1 ${isMapOpen ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} gap-6`}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-slate-200 rounded-xl h-64 shadow-sm hover:shadow-md transition-all bg-slate-50 flex flex-col items-center justify-center text-slate-400 group">
                <span className="font-medium text-slate-500 group-hover:text-blue-500 transition-colors italic">
                  Inmueble {i}
                </span>
                {isMapOpen && <span className="text-[10px] mt-1">(Ajustado para Mapa)</span>}
              </div>
            ))}
          </div>
        </main>

        {/* --- MAPA (Solo si está abierto) --- */}
        {isMapOpen && (
          <div className="md:col-span-5 h-[75vh] sticky top-8 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 border-dashed animate-in fade-in zoom-in duration-300">
            <div className="text-center">
               <p className="font-bold text-slate-500">MAPA INTERACTIVO</p>
               <p className="text-xs uppercase mt-1 tracking-widest">Próximamente</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}