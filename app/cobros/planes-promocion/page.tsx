"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

function PlanesPromocionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idPublicacion = searchParams.get('pubId'); 

  // Configuración final de los 5 planes con los colores de marca exactos
  const planesPromocion = [
    { 
      id: '1', 
      nombre: 'Básico', 
      precio: '1.99', 
      dias: 7, 
      prioridad: 'Prioridad Media', 
      visibilidad: 'Visibilidad Estándar',
      color: 'bg-[#1e3a5f]' // Azul Marino Propbol
    },
    { 
      id: '2', 
      nombre: 'Avanzado', 
      precio: '4.99', 
      dias: 15, 
      prioridad: 'Prioridad Alta', 
      visibilidad: 'Visibilidad Destacada',
      color: 'bg-[#bf735c]' // Tono Terracota/Naranja del botón "PUBLICAR"
    },
    { 
      id: '3', 
      nombre: 'Premium', 
      precio: '9.99', 
      dias: 30, 
      prioridad: 'Prioridad Muy Alta', 
      visibilidad: 'Visibilidad Superior',
      color: 'bg-[#1e3a5f]' 
    },
    { 
      id: '4', 
      nombre: 'Elite', 
      precio: '19.99', 
      dias: 60, 
      prioridad: 'Prioridad Máxima (Sobre las demás)', 
      visibilidad: 'Visibilidad Premium',
      color: 'bg-[#bf735c]' 
    },
    
  ];

  const handleSelectPlan = (planId: string) => {
    const url = `/cobros?planId=${planId}&idPublicacion=${idPublicacion}&tipo=0`;
    router.push(url);
  };

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-[#1e3a5f] font-sans">
      {/* max-w-5xl es la clave para juntarlos en el centro */}
        <main className="max-w-5xl mx-auto px-4 pt-10 pb-12">
        
        {/* CABECERA */}
        <div className="relative mb-12 flex flex-col items-center justify-center">
          <div className="md:absolute md:left-0 mb-4 md:mb-0">
            <Button variant="outline" asChild className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white font-bold">
              <Link href="/perfil/publicacion" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4 stroke-[3]" />
                <span className="uppercase text-xs tracking-widest">Volver</span>
              </Link>
            </Button>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-[#1e3a5f] uppercase tracking-tighter text-center italic">
            Planes de Promoción
          </h1>
        </div>

        {/* GRID DE 5 COLUMNAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {planesPromocion.map((plan) => (
            <div 
              key={plan.id} 
              className="w-full h-full border border-gray-300 rounded-lg p-5 flex flex-col items-center text-center bg-white/60 shadow-sm hover:shadow-xl transition-all"
            >
              <span className="text-gray-400 text-xs mb-4 font-bold tracking-[0.3em]">X-----------X</span>
              
              <h2 className="text-xl font-extrabold uppercase mb-6 tracking-tight">Plan {plan.nombre}</h2>
              
              <div className="flex-grow space-y-3 mb-8 text-[#1e3a5f]/80">
                <p className="text-sm font-semibold">{plan.dias} días de promoción</p>
                <p className="text-sm font-semibold">{plan.prioridad}</p>
                <p className="text-sm font-semibold">{plan.visibilidad}</p>
                {plan.id === '3' && <p className="text-sm font-bold italic">Soporte Prioritario</p>}
                {plan.id === '4' && <p className="text-sm font-bold italic">Soporte Exclusivo</p>}
              
              </div>
              
              <div className="mb-6">
                <span className="text-3xl font-black text-[#1e3a5f]">${plan.precio}</span>
                <span className="text-xs font-bold text-gray-500 uppercase"> / {plan.dias} días</span>
              </div>
              
              <Button 
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full py-7 text-sm font-black rounded-md uppercase text-white shadow-lg hover:brightness-110 active:scale-95 transition-all ${plan.color}`}
              >
                Continuar
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function PlanesPromocionPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-[#1e3a5f]" /></div>}>
      <PlanesPromocionContent />
    </Suspense>
  );
}