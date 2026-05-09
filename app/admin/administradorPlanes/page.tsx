"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, Edit3, Loader2, Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface Plan {
  id_plan: string | number;
  nombre_plan: string;
  precio_plan: number;
  cant_publicaciones: number; // Representa cupos o días según el tipo
  activo: boolean;
  tipo: boolean; // true = Publicación, false = Promoción
}

export default function AdministradorPlanesPage() {
  const [activeTab, setActiveTab] = useState<string>("publicacion");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [planes, setPlanes] = useState<Plan[]>([]); // Estado único para todos los planes
  const [loading, setLoading] = useState<boolean>(true);

  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState({
    nombre_plan: "",
    precio_plan: 0,
    cant_publicaciones: 0,
  });

  const fetchPlanes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/publicacion");
      const data = await res.json();
      if (Array.isArray(data)) {
        setPlanes(data);
      }
    } catch (error) {
      console.error("Error cargando planes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanes();
    setShowForm(false);
    setEditingId(null);
  }, [activeTab]);

  const toggleActivo = async (id: string | number, currentStatus: boolean) => {
    try {
      await fetch("/api/admin/publicacion", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_plan: id, activo: !currentStatus }),
      });
      fetchPlanes();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  const prepararEdicion = (plan: Plan) => {
    setEditingId(plan.id_plan);
    setFormData({
      nombre_plan: plan.nombre_plan,
      precio_plan: plan.precio_plan,
      cant_publicaciones: plan.cant_publicaciones,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    const method = editingId ? "PATCH" : "POST";
    // Si es nuevo, asignamos el tipo según la pestaña activa
    const payload = editingId
      ? { id_plan: editingId, ...formData }
      : { ...formData, tipo: activeTab === "publicacion" };

    try {
      await fetch("/api/admin/publicacion", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setShowForm(false);
      setEditingId(null);
      fetchPlanes();
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  // Filtrado dinámico según la pestaña activa
  const planesFiltrados = planes.filter((plan) =>
    activeTab === "publicacion" ? plan.tipo === true : plan.tipo === false,
  );

  const labelDinamica = activeTab === "publicacion" ? "Publicaciones" : "Días";

  return (
    <div className="flex-1 p-4 sm:p-10 lg:p-14 bg-background text-foreground">
      <h2 className="text-2xl sm:text-4xl font-extrabold mb-8 sm:mb-12 text-center tracking-tight uppercase">
        Administrador de planes
      </h2>

      <div className="max-w-5xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* SELECTOR MÓVIL */}
          <div className="sm:hidden mb-6 relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-card border border-input text-sm font-semibold rounded-full p-3.5 shadow-sm flex justify-between items-center outline-none focus:ring-2 focus:ring-ring transition-all"
            >
              {activeTab === "publicacion"
                ? "Planes de publicación"
                : "Planes de promoción"}
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => {
                    setActiveTab("publicacion");
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors hover:bg-accent ${activeTab === "publicacion" ? "text-primary bg-accent/50" : "text-muted-foreground"}`}
                >
                  Planes de publicación
                </button>
                <button
                  onClick={() => {
                    setActiveTab("promocion");
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors hover:bg-accent ${activeTab === "promocion" ? "text-primary bg-accent/50" : "text-muted-foreground"}`}
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
              className="px-10 py-3 rounded-full bg-muted text-muted-foreground font-bold text-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all shadow-sm"
            >
              Planes de publicación
            </TabsTrigger>
            <TabsTrigger
              value="promocion"
              className="px-10 py-3 rounded-full bg-muted text-muted-foreground font-bold text-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all shadow-sm"
            >
              Planes de promoción
            </TabsTrigger>
          </TabsList>

          {/* BOTÓN NUEVO PLAN */}
          {!showForm && (
            <div className="flex justify-end mb-8">
              <Button
                onClick={() => {
                  setShowForm(true);
                  setEditingId(null);
                  setFormData({
                    nombre_plan: "",
                    precio_plan: 0,
                    cant_publicaciones: 0,
                  });
                }}
                className="font-bold gap-2 rounded-md shadow-sm"
              >
                <Plus className="w-4 h-4" /> Nuevo plan
              </Button>
            </div>
          )}

          {/* CONTENIDO ÚNICO (Para ambas pestañas) */}
          <TabsContent value={activeTab} className="m-0 outline-none">
            {showForm && (
              <div className="mb-12 p-6 border border-border rounded-2xl bg-card/50 animate-in fade-in slide-in-from-top-4 duration-300">
                <h3 className="text-center font-bold mb-4 uppercase opacity-70">
                  {editingId
                    ? `Editar Plan de ${activeTab}`
                    : `Nuevo Plan de ${activeTab}`}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-8">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-center opacity-80 uppercase tracking-tighter">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={formData.nombre_plan}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nombre_plan: e.target.value,
                        })
                      }
                      placeholder="Ej: Plan Pro"
                      className="bg-muted text-center font-medium rounded-md px-3 py-2.5 border border-input focus:ring-2 focus:ring-ring outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-center opacity-80 uppercase tracking-tighter">
                      Precio
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.precio_plan}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            precio_plan: Number(e.target.value),
                          })
                        }
                        placeholder="0"
                        className="bg-muted text-center font-medium rounded-md px-3 py-2.5 w-full border border-input focus:ring-2 focus:ring-ring outline-none"
                      />
                      <span className="font-bold text-lg">$</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-center opacity-80 uppercase tracking-tighter">
                      {labelDinamica}
                    </label>
                    <input
                      type="number"
                      value={formData.cant_publicaciones}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cant_publicaciones: Number(e.target.value),
                        })
                      }
                      placeholder={
                        activeTab === "publicacion" ? "Cantidad" : "Días"
                      }
                      className="bg-muted text-center font-medium rounded-md px-3 py-2.5 border border-input focus:ring-2 focus:ring-ring outline-none"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button
                    onClick={handleSave}
                    className="px-12 font-bold uppercase tracking-widest text-xs gap-2"
                  >
                    <Save className="w-4 h-4" />{" "}
                    {editingId ? "Actualizar Plan" : "Guardar Plan"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="px-12 font-bold uppercase tracking-widest text-xs gap-2"
                  >
                    <X className="w-4 h-4" /> Cancelar
                  </Button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {planesFiltrados.map((plan) => (
                  <div
                    key={plan.id_plan}
                    className="relative flex flex-col text-center border border-border shadow-sm rounded-2xl pt-6 overflow-hidden bg-card hover:border-primary/40 transition-all group"
                  >
                    <div className="absolute top-4 right-4 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold uppercase opacity-40">
                        {plan.activo ? "Activo" : "Inactivo"}
                      </span>
                      <Switch
                        checked={plan.activo}
                        onCheckedChange={() =>
                          toggleActivo(plan.id_plan, plan.activo)
                        }
                      />
                    </div>

                    <div className="px-6 pb-2">
                      <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                        {plan.nombre_plan}
                      </h3>
                    </div>
                    <div className="flex flex-col items-center px-6 pb-6">
                      <span className="text-3xl font-black">
                        $ {plan.precio_plan.toLocaleString()}
                      </span>
                      <div className="mt-4 text-muted-foreground text-xs font-bold uppercase tracking-widest bg-muted px-3 py-1 rounded-full">
                        {plan.cant_publicaciones} {labelDinamica}
                      </div>
                    </div>

                    <div className="flex border-t border-border mt-auto bg-muted/10">
                      <button
                        onClick={() => prepararEdicion(plan)}
                        className="w-full py-4 flex justify-center items-center gap-2 hover:bg-accent hover:text-accent-foreground transition-colors text-xs font-bold uppercase tracking-tighter"
                      >
                        <Edit3 className="w-4 h-4 text-primary" /> Editar Plan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
