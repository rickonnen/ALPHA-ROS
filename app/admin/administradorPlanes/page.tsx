"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// Asegúrate de tener lucide-react instalado para el icono de la flechita
import { ChevronDown } from "lucide-react"

export default function AdministradorPlanesPage() {
  const [activeTab, setActiveTab] = useState<string>("publicacion");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  return (
    <div className="flex-1 p-4 sm:p-10 lg:p-14 bg-background">
      {/* Título Principal */}
      <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-8 sm:mb-12 text-center tracking-tight">
        Administrador de planes
      </h2>

      <div className="max-w-5xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          
          {/* ==========================================
              VERSIÓN MÓVIL (Menú desplegable) 
              Reutilizando la lógica optimizada del equipo
          ========================================== */}
          <div className="sm:hidden mb-6 relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-card border border-border text-foreground text-sm font-semibold rounded-full p-3.5 shadow-sm flex justify-between items-center outline-none focus:ring-2 focus:ring-primary"
            >
              {activeTab === 'publicacion' ? 'Planes de publicación' : 'Planes de promoción'}
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                <button
                  onClick={() => { setActiveTab('publicacion'); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors hover:bg-muted/50 ${activeTab === 'publicacion' ? 'text-primary bg-muted/20' : 'text-muted-foreground'}`}
                >
                  Planes de publicación
                </button>
                <div className="border-b border-border/50"></div>
                <button
                  onClick={() => { setActiveTab('promocion'); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors hover:bg-muted/50 ${activeTab === 'promocion' ? 'text-primary bg-muted/20' : 'text-muted-foreground'}`}
                >
                  Planes de promoción
                </button>
              </div>
            )}
          </div>

          {/* ==========================================
              VERSIÓN ESCRITORIO (Pestañas ovaladas) 
              Fiel al wireframe
          ========================================== */}
          <TabsList className="hidden sm:flex justify-center bg-transparent h-auto p-0 gap-8 mb-10">
            <TabsTrigger 
              value="publicacion" 
              className="px-10 py-3 rounded-full bg-muted text-muted-foreground font-bold text-lg data-[state=active]:bg-gray-500 data-[state=active]:text-white transition-all shadow-sm data-[state=active]:shadow-md"
            >
              Planes de publicación
            </TabsTrigger>
            <TabsTrigger 
              value="promocion" 
              className="px-10 py-3 rounded-full bg-muted text-muted-foreground font-bold text-lg data-[state=active]:bg-gray-300 data-[state=active]:text-gray-800 transition-all shadow-sm data-[state=active]:shadow-md"
            >
              Planes de promoción
            </TabsTrigger>
          </TabsList>

          {/* ==========================================
              BOTÓN DE ACCIÓN GLOBAL
          ========================================== */}
          <div className="flex justify-end mb-8">
            <button className="bg-black text-white px-8 py-2.5 rounded-md font-bold text-sm hover:bg-gray-800 transition-colors shadow-sm">
              Nuevo plan
            </button>
          </div>

          {/* ==========================================
              CONTENIDO DE LAS PESTAÑAS (Vacío por ahora)
          ========================================== */}
          <TabsContent value="publicacion" className="m-0 focus-visible:outline-none">
             {/* AQUÍ IRÁN LAS TARJETAS DE LOS PLANES ESTÁNDAR Y AVANZADO */}
             <div className="p-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                Espacio reservado para las tarjetas de Planes de Publicación...
             </div>
          </TabsContent>

          <TabsContent value="promocion" className="m-0 focus-visible:outline-none">
             {/* AQUÍ IRÁ EL FORMULARIO/TARJETAS DE LOS PLANES DE PROMOCIÓN */}
             <div className="p-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                Espacio reservado para las tarjetas de Planes de Promoción...
             </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}