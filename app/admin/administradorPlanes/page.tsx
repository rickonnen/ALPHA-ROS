"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDown } from "lucide-react"

export default function AdministradorPlanesPage() {
  const [activeTab, setActiveTab] = useState<string>("publicacion");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  
  // Estado para controlar la visibilidad del formulario de "Nuevo plan"
  const [showNewPlanForm, setShowNewPlanForm] = useState<boolean>(false);

  // Efecto para cerrar el formulario si el usuario cambia de pestaña
  useEffect(() => {
    setShowNewPlanForm(false);
  }, [activeTab]);

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
          {!showNewPlanForm && (
            <div className="flex justify-end mb-8">
              <button 
                onClick={() => setShowNewPlanForm(true)}
                className="bg-black text-white px-8 py-2.5 rounded-md font-bold text-sm hover:bg-gray-800 transition-colors shadow-sm"
              >
                Nuevo plan
              </button>
            </div>
          )}

          {/* ==========================================
              CONTENIDO: PLANES DE PUBLICACIÓN
          ========================================== */}
          <TabsContent value="publicacion" className="m-0 focus-visible:outline-none">
             
             {/* FORMULARIO DE NUEVO PLAN (Visible según estado) */}
             {showNewPlanForm && (
                <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end mb-8">
                    
                    {/* Campo Nombre */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-extrabold text-center text-foreground">Nombre</label>
                      <input 
                        type="text" 
                        placeholder="Ingrese Nombre del Plan" 
                        className="bg-gray-200 text-center font-semibold rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400" 
                      />
                    </div>

                    {/* Campo Precio */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-extrabold text-center text-foreground">Precio</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          placeholder="Ingrese Precio" 
                          className="bg-gray-200 text-center font-semibold rounded-md px-3 py-2.5 w-full outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400" 
                        />
                        <span className="font-extrabold text-lg">$</span>
                      </div>
                    </div>

                    {/* Campo Cantidad */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-extrabold text-center text-foreground">Cantidad de Publicaciones</label>
                      <input 
                        type="number" 
                        placeholder="Ingrese Cantidad" 
                        className="bg-gray-200 text-center font-semibold rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400" 
                      />
                    </div>

                    {/* Botón Adjuntar QR */}
                    <div className="flex flex-col gap-2">
                      <button className="bg-gray-300 text-foreground font-extrabold rounded-md px-4 py-2.5 hover:bg-gray-400 transition-colors whitespace-nowrap">
                        Adjuntar QR
                      </button>
                    </div>

                  </div>

                  {/* Botones de Acción */}
                  <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-12">
                    <button className="bg-black text-white px-12 py-2.5 rounded-md font-bold hover:bg-gray-800 transition-colors shadow-md">
                      Guardar
                    </button>
                    <button 
                      onClick={() => setShowNewPlanForm(false)} 
                      className="bg-black text-white px-12 py-2.5 rounded-md font-bold hover:bg-gray-800 transition-colors shadow-md"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
             )}

             {/* ESPACIO PARA LAS TARJETAS */}
             <div className="p-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                Espacio reservado para las tarjetas de Planes de Publicación...
             </div>
          </TabsContent>

          {/* ==========================================
              CONTENIDO: PLANES DE PROMOCIÓN
          ========================================== */}
          <TabsContent value="promocion" className="m-0 focus-visible:outline-none">
             {/* ESPACIO PARA EL FORMULARIO/TARJETAS DE PROMOCIÓN */}
             <div className="p-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                Espacio reservado para las tarjetas de Planes de Promoción...
             </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}