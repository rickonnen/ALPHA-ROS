"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Importamos nuestros componentes modulares
import PlanCard from "./components/PlanCard";
import PlanForm from "./components/PlanForm";

export interface Plan {
  id_plan: number;
  nombre_plan: string;
  precio_plan: number;
  cant_publicaciones: number;
  activo: boolean;
  tipo: boolean;
  QrUrl?: { qr_URL: string; modalidad: string | null }[]; // Añadir esto
}

export default function AdministradorPlanesPage() {
  const [activeTab, setActiveTab] = useState<string>("publicacion");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Guardamos el objeto completo del plan a editar, en lugar de solo el ID
  const [planToEdit, setPlanToEdit] = useState<Plan | null>(null);

  const fetchPlanes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/publicacion");
      const data = await res.json();
      if (Array.isArray(data)) setPlanes(data);
    } catch (error) {
      console.error("Error cargando planes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanes();
    setShowForm(false);
    setPlanToEdit(null);
  }, [activeTab]);

  const handleEditPlan = (plan: Plan) => {
    setPlanToEdit(plan);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setPlanToEdit(null);
    fetchPlanes(); // Recargamos los datos tras guardar
  };

  const planesFiltrados = planes.filter((p) =>
    activeTab === "publicacion" ? p.tipo === true : p.tipo === false,
  );

  const labelDinamica = activeTab === "publicacion" ? "Publicaciones" : "Días";

  return (
    <div className="flex-1 p-4 sm:p-10 lg:p-14 bg-background text-foreground">
      <h2 className="text-2xl sm:text-4xl font-extrabold mb-8 text-center tracking-tighter uppercase">
        Administrador de planes
      </h2>

      <div className="max-w-5xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* SELECTOR MÓVIL */}
          <div className="sm:hidden mb-6 relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-card border border-input text-sm font-semibold rounded-full p-4 shadow-sm flex justify-between items-center outline-none focus:ring-2 focus:ring-primary transition-all"
            >
              {activeTab === "publicacion"
                ? "Planes de publicación"
                : "Planes de promoción"}
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => {
                    setActiveTab("publicacion");
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-6 py-4 text-sm font-bold transition-colors hover:bg-accent ${activeTab === "publicacion" ? "text-primary bg-accent/50" : "text-muted-foreground"}`}
                >
                  Planes de publicación
                </button>
                <button
                  onClick={() => {
                    setActiveTab("promocion");
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-6 py-4 text-sm font-bold transition-colors hover:bg-accent ${activeTab === "promocion" ? "text-primary bg-accent/50" : "text-muted-foreground"}`}
                >
                  Planes de promoción
                </button>
              </div>
            )}
          </div>

          {/* TABS DESKTOP */}
          <TabsList className="hidden sm:flex justify-center bg-transparent h-auto p-0 gap-8 mb-12">
            <TabsTrigger
              value="publicacion"
              className="px-10 py-3.5 rounded-full bg-muted text-muted-foreground font-bold text-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all shadow-sm hover:bg-muted/80"
            >
              Planes de publicación
            </TabsTrigger>
            <TabsTrigger
              value="promocion"
              className="px-10 py-3.5 rounded-full bg-muted text-muted-foreground font-bold text-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all shadow-sm hover:bg-muted/80"
            >
              Planes de promoción
            </TabsTrigger>
          </TabsList>

          {!showForm && (
            <div className="flex justify-end mb-8">
              <Button
                onClick={() => {
                  setPlanToEdit(null);
                  setShowForm(true);
                }}
                className="font-bold gap-2 rounded-xl shadow-md px-6"
              >
                <Plus className="w-5 h-5" /> Nuevo plan
              </Button>
            </div>
          )}

          <TabsContent value={activeTab} className="m-0 outline-none">
            {showForm && (
              <PlanForm
                activeTab={activeTab}
                planToEdit={planToEdit}
                onCancel={() => {
                  setShowForm(false);
                  setPlanToEdit(null);
                }}
                onSuccess={handleFormSuccess}
              />
            )}

            {loading ? (
              <div className="flex justify-center p-32">
                <Loader2 className="w-12 h-12 animate-spin text-primary/20" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
                {planesFiltrados.map((plan) => (
                  <PlanCard
                    key={plan.id_plan}
                    plan={plan}
                    labelDinamica={labelDinamica}
                    onEdit={handleEditPlan}
                    onSuccess={fetchPlanes} // IMPORTANTE: Pasar la función de refresco
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
