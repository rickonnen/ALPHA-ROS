"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, Edit3, Trash2, Loader2 } from "lucide-react";

interface Plan {
  id_plan: string | number;
  nombre_plan: string;
  precio_plan: number;
  cant_publicaciones: number;
}

export default function AdministradorPlanesPage() {
  const [activeTab, setActiveTab] = useState<string>("publicacion");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [showNewPlanForm, setShowNewPlanForm] = useState<boolean>(false);

  // Estados para datos
  const [planesPub, setPlanesPub] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Cargar planes desde el endpoint
  const fetchPlanes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/publicacion");
      const data = await res.json();
      if (Array.isArray(data)) {
        setPlanesPub(data);
      }
    } catch (error) {
      console.error("Error cargando planes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "publicacion") {
      fetchPlanes();
    }
    setShowNewPlanForm(false);
  }, [activeTab]);

  return (
    <div className="flex-1 p-4 sm:p-10 lg:p-14 bg-background">
      <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-8 sm:mb-12 text-center tracking-tight uppercase">
        Administrador de planes
      </h2>

      <div className="max-w-5xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* SELECTOR MÓVIL (Dropdown) */}
          <div className="sm:hidden mb-6 relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-card border border-border text-foreground text-sm font-semibold rounded-full p-3.5 shadow-sm flex justify-between items-center outline-none"
            >
              {activeTab === "publicacion"
                ? "Planes de publicación"
                : "Planes de promoción"}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    setActiveTab("publicacion");
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-5 py-3 text-sm font-medium ${activeTab === "publicacion" ? "text-primary bg-muted/20" : "text-muted-foreground"}`}
                >
                  Planes de publicación
                </button>
                <button
                  onClick={() => {
                    setActiveTab("promocion");
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-5 py-3 text-sm font-medium ${activeTab === "promocion" ? "text-primary bg-muted/20" : "text-muted-foreground"}`}
                >
                  Planes de promoción
                </button>
              </div>
            )}
          </div>

          {/* TABS DESKTOP */}
          <TabsList className="hidden sm:flex justify-center bg-transparent h-auto p-0 gap-8 mb-10">
            <TabsTrigger
              value="publicacion"
              className="px-10 py-3 rounded-full bg-muted text-muted-foreground font-bold text-lg data-[state=active]:bg-gray-500 data-[state=active]:text-white transition-all shadow-sm"
            >
              Planes de publicación
            </TabsTrigger>
            <TabsTrigger
              value="promocion"
              className="px-10 py-3 rounded-full bg-muted text-muted-foreground font-bold text-lg data-[state=active]:bg-gray-300 data-[state=active]:text-gray-800 transition-all shadow-sm"
            >
              Planes de promoción
            </TabsTrigger>
          </TabsList>

          {/* BOTÓN NUEVO PLAN */}
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

          {/* CONTENIDO: PUBLICACIÓN */}
          <TabsContent
            value="publicacion"
            className="m-0 focus-visible:outline-none"
          >
            {showNewPlanForm && (
              <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end mb-8">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-extrabold text-center">
                      Nombre
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre del plan"
                      className="bg-gray-200 text-center font-semibold rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-extrabold text-center">
                      Precio
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Precio"
                        className="bg-gray-200 text-center font-semibold rounded-md px-3 py-2.5 w-full outline-none focus:ring-2 focus:ring-black"
                      />
                      <span className="font-extrabold text-lg">$</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-extrabold text-center">
                      Publicaciones
                    </label>
                    <input
                      type="number"
                      placeholder="Cantidad"
                      className="bg-gray-200 text-center font-semibold rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="bg-gray-300 text-foreground font-extrabold rounded-md px-4 py-2.5 hover:bg-gray-400">
                      Adjuntar QR
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-12">
                  <button className="bg-black text-white px-12 py-2.5 rounded-md font-bold hover:bg-gray-800 shadow-md">
                    Guardar
                  </button>
                  <button
                    onClick={() => setShowNewPlanForm(false)}
                    className="bg-black text-white px-12 py-2.5 rounded-md font-bold hover:bg-gray-800 shadow-md"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* LISTA DE TARJETAS */}
            {loading ? (
              <div className="flex justify-center items-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {planesPub.map((plan) => (
                  <div
                    key={plan.id_plan}
                    className="flex flex-col text-center border border-border shadow-sm rounded-2xl pt-6 overflow-hidden bg-card hover:border-primary/50 transition-all"
                  >
                    <div className="px-6 pb-2">
                      <h3 className="text-xl font-black uppercase">
                        {plan.nombre_plan}
                      </h3>
                    </div>
                    <div className="flex flex-col items-center px-6 pb-6">
                      <span className="text-3xl font-black text-foreground">
                        $ {plan.precio_plan.toLocaleString("es-ES")}
                      </span>
                      <div className="mt-4 text-foreground text-md font-bold uppercase tracking-wide">
                        {plan.cant_publicaciones} cupos de publicación
                      </div>
                    </div>

                    {/* ACCIONES ADMIN */}
                    <div className="flex border-t border-border mt-auto bg-muted/30">
                      <button className="flex-1 py-4 flex justify-center items-center gap-2 hover:bg-muted transition-colors border-r border-border text-xs font-black uppercase">
                        <Edit3 className="w-4 h-4" /> Editar
                      </button>
                      <button className="flex-1 py-4 flex justify-center items-center gap-2 hover:bg-destructive/10 text-destructive transition-colors text-xs font-black uppercase">
                        <Trash2 className="w-4 h-4" /> Borrar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* CONTENIDO: PROMOCIÓN */}
          <TabsContent
            value="promocion"
            className="m-0 focus-visible:outline-none"
          >
            {/* Aquí se repetiría la misma lógica con un endpoint de promociones */}
            <div className="p-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl">
              Próximamente: Gestión de Planes de Promoción
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
