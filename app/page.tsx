"use client";

/**
 * @file page.tsx
 * @description Página base para la Guía de Tipografía y pruebas de componentes UI (como el Modal de Límite de Publicaciones).
 */

import { useState } from "react";
import FreePublicationLimitModal from "./frontend/publicacion/components/FreePublicationLimitModal";
import { Button } from "@/components/ui/button";

import { asociarPublicacionExistente } from "@/app/backend/publicacion/modal/action";

export default function GuiaTipografia() {
  // Estados renombrados con prefijos 'int' (integer/number) y 'bol' (boolean) según el estándar
  const [intPublicationCount, setIntPublicationCount] = useState(0);
  const [bolIsPremium, setBolIsPremium] = useState(false);
  const [bolCargando, setBolCargando] = useState(false);

  /**
   * Asocia una publicación de prueba al usuario actual comunicándose con el backend.
   * Maneja los estados de carga y dispara el modal si se alcanza el límite.
   * * @returns {Promise<void>}
   */
  const handlePublicar = async () => {
    setBolCargando(true);
    
    // Uso del prefijo 'int' para esta constante numérica
    const intIdPublicacionSupabase = 12; 
    
    // Uso del prefijo 'obj' para el objeto de respuesta del backend
    const objRespuesta = await asociarPublicacionExistente(intIdPublicacionSupabase);

    if (!objRespuesta.success && objRespuesta.reason === "LIMITE_ALCANZADO") {
      setBolIsPremium(false);
      setIntPublicationCount(2); 
    } else if (objRespuesta.success) {
      alert("¡Éxito! Publicación asociada a tu usuario y cupo descontado.");
    } else {
      alert("Ocurrió un error en el servidor.");
    }

    setBolCargando(false);
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-8 md:p-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 border-b pb-4">Guía de Tipografía del Proyecto</h1>
        <p className="mb-10 text-lg text-slate-600">
          Equipo: Por favor, utilicen estrictamente estas clases de Tailwind para mantener la consistencia en todo el frontend.
        </p>

        {/* SECCIÓN TIPOGRAFÍA */}
        <div className="space-y-6 mb-16">
          {/* H1 - Título Principal */}
          <div className="flex flex-col md:flex-row md:items-center border border-slate-200 p-6 rounded-xl shadow-sm bg-slate-50">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <span className="bg-blue-100 text-blue-800 font-mono text-sm px-2 py-1 rounded font-bold">text-5xl</span>
              <p className="text-sm text-slate-500 mt-2">48px (3rem)</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Títulos Principales (H1)</p>
            </div>
            <div className="md:w-2/3">
              <h1 className="text-5xl font-bold">El veloz murciélago</h1>
            </div>
          </div>

          {/* H2 - Subtítulos de Sección */}
          <div className="flex flex-col md:flex-row md:items-center border border-slate-200 p-6 rounded-xl shadow-sm bg-slate-50">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <span className="bg-blue-100 text-blue-800 font-mono text-sm px-2 py-1 rounded font-bold">text-3xl</span>
              <p className="text-sm text-slate-500 mt-2">30px (1.875rem)</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Secciones (H2)</p>
            </div>
            <div className="md:w-2/3">
              <h2 className="text-3xl font-semibold">El veloz murciélago</h2>
            </div>
          </div>

          {/* H3 - Títulos de Tarjetas */}
          <div className="flex flex-col md:flex-row md:items-center border border-slate-200 p-6 rounded-xl shadow-sm bg-slate-50">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <span className="bg-blue-100 text-blue-800 font-mono text-sm px-2 py-1 rounded font-bold">text-xl</span>
              <p className="text-sm text-slate-500 mt-2">20px (1.25rem)</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Tarjetas o Módulos (H3)</p>
            </div>
            <div className="md:w-2/3">
              <h3 className="text-xl font-medium">El veloz murciélago hindú</h3>
            </div>
          </div>

          {/* P - Texto Base */}
          <div className="flex flex-col md:flex-row md:items-center border border-slate-200 p-6 rounded-xl shadow-sm bg-slate-50">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <span className="bg-green-100 text-green-800 font-mono text-sm px-2 py-1 rounded font-bold">text-base</span>
              <p className="text-sm text-slate-500 mt-2">16px (1rem)</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Párrafos / Texto Normal (p)</p>
            </div>
            <div className="md:w-2/3">
              <p className="text-base text-slate-700">El veloz murciélago hindú comía feliz cardillo y kiwi. La cigüeña tocaba el saxofón detrás del palenque de paja.</p>
            </div>
          </div>

          {/* Small - Texto Pequeño */}
          <div className="flex flex-col md:flex-row md:items-center border border-slate-200 p-6 rounded-xl shadow-sm bg-slate-50">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <span className="bg-purple-100 text-purple-800 font-mono text-sm px-2 py-1 rounded font-bold">text-sm</span>
              <p className="text-sm text-slate-500 mt-2">14px (0.875rem)</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Notas / Metadatos</p>
            </div>
            <div className="md:w-2/3">
              <p className="text-sm text-slate-500">Publicado el 12 de Octubre • 5 min de lectura</p>
            </div>
          </div>
        </div>

        {/* CAMBIO B: Nueva sección de Botones aquí */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Botones (shadcn/ui)</h2>
          
            <p className="text-sm text-slate-600 mb-6">
              Usen estas variantes cambiando la propiedad <strong>variant</strong> del componente Button.
            </p>
            
            <div className="flex flex-wrap gap-4 items-center">
              <Button>Confirmar</Button>
              <Button variant="secondary">cancelar</Button>
              <Button variant="destructive">Eliminar cuenta</Button>
              <Button variant="outline">filtrar</Button>
              <Button variant="outline">descargar</Button>
              <Button variant="outline">exportar a pdf</Button>
              <Button>Confirmar</Button>
              <Button variant="ghost">cancelar2</Button>
              <Button variant="link">ejecutar</Button>
              <Button variant="link">ver mas detalles mas detalles</Button>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                Botón Especial
              </Button>
              
              {/* BOTÓN MODIFICADO PARA LA PRUEBA (usando la variable booleana prefijada) */}
              <Button
                variant="destructive"
                onClick={handlePublicar}
                disabled={bolCargando}
              >
                {bolCargando ? "Cargando..." : "Publicar"}
              </Button>
            </div>

        </section>

      </div>

      <FreePublicationLimitModal
        intPublicationCount={intPublicationCount}
        bolIsPremium={bolIsPremium}
        onBack={() => setIntPublicationCount(1)}
      />
    </main>
  );
}


