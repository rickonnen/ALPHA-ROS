"use client";


import Link from "next/link";
import React, { useState } from "react";

interface HelpTopic {
  id: string;
  title: string;
  breadcrumb: string;
  icon: React.ReactNode;
}

const arrHelpTopics: HelpTopic[] = [
  { id: "identificar", title: "Cómo identificar propiedades", breadcrumb: "Identificar propiedades", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
  { id: "mapa", title: "Visualización en el mapa", breadcrumb: "Uso del Mapa", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg> },
  { id: "coincidencias", title: "Sistema de coincidencias", breadcrumb: "Coincidencias", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
  { id: "pagos", title: "Cómo realizar pagos", breadcrumb: "Realizar pagos", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
  { id: "verificar", title: "Verificación de pagos", breadcrumb: "Verificar pagos", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
];

export default function HelpContentClient() {
  const [strActiveTopicId, setStrActiveTopicId] = useState<string>(arrHelpTopics[0].id);
  const objActiveTopic = arrHelpTopics.find(t => t.id === strActiveTopicId) || arrHelpTopics[0];

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center gap-2 text-sm text-[#8b8276]">
        <Link href="/" className="hover:text-[#1F3A4D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] rounded px-1">
          Inicio
        </Link>
        <span>/</span>
        <button 
          onClick={() => setStrActiveTopicId(arrHelpTopics[0].id)}
          className="hover:text-[#1F3A4D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] rounded px-1"
        >
          Guía de Ayuda
        </button>
        <span>/</span>
        <span className="text-[#2E2E2E] font-semibold">{objActiveTopic.breadcrumb}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <aside className="w-full md:w-1/3 lg:w-1/4 relative md:sticky md:top-24 flex flex-col gap-2 bg-[#E7E1D7] p-4 rounded-2xl border border-[#C4BAA8] shadow-sm">
          <h2 className="text-lg font-bold text-[#2E2E2E] mb-2 px-2">Temas de ayuda</h2>
          
          {arrHelpTopics.map((objTopic) => (
            <button
              key={objTopic.id}
              onClick={() => setStrActiveTopicId(objTopic.id)}
              className={`flex items-center gap-3 px-4 py-4 rounded-xl text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7] ${
                strActiveTopicId === objTopic.id
                  ? "bg-[#1F3A4D] text-[#E7E1D7] shadow-md"
                  : "text-[#2E2E2E] hover:bg-[#F4EFE6]"
              }`}
            >
              {objTopic.icon}
              {objTopic.title}
            </button>
          ))}
        </aside>

        <main 
          key={strActiveTopicId} 
          className="w-full md:w-2/3 lg:w-3/4 bg-[#E7E1D7] p-6 sm:p-8 rounded-2xl border border-[#C4BAA8] shadow-md animate-in fade-in duration-500 slide-in-from-bottom-2"
        >
          <h1 className="text-2xl sm:text-5xl font-bold text-[#2E2E2E] mb-6">
            {objActiveTopic.title}
          </h1>

          <div className="text-[#2E2E2E] text-lg space-y-5 mb-10 leading-relaxed">
            <p className="font-semibold text-[#C26E5A]">
             Aqui vendrá la explicación real para {objActiveTopic.title}.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>

          <div className="mt-8 border-t border-[#C4BAA8] pt-8">
            <h3 className="text-lg font-bold text-[#2E2E2E] mb-4">Ejemplo Visual</h3>
            
            <div className="w-full aspect-[16/9] bg-[#F4EFE6] rounded-xl border-2 border-dashed border-[#C4BAA8] flex flex-col items-center justify-center text-[#8b8276] hover:bg-[#E7E1D7] transition-colors cursor-pointer">
               <svg className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
               <span className="text-sm font-medium">José: Inserta aquí la captura real (`{"<img src='...' />"}`)</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}