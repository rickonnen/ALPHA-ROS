"use client";

import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDown,
  Edit3,
  Loader2,
  Plus,
  Save,
  X,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface Plan {
  id_plan: string | number;
  nombre_plan: string;
  precio_plan: number;
  cant_publicaciones: number;
  activo: boolean;
  tipo: boolean;
}

export default function AdministradorPlanesPage() {
  const [activeTab, setActiveTab] = useState<string>("publicacion");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState({
    nombre_plan: "",
    precio_plan: 0,
    cant_publicaciones: 0,
  });

  const fileInputMensualRef = useRef<HTMLInputElement>(null);
  const fileInputAnualRef = useRef<HTMLInputElement>(null);
  const fileInputPromoRef = useRef<HTMLInputElement>(null);

  const [qrMensual, setQrMensual] = useState<{
    file: File | null;
    preview: string | null;
  }>({ file: null, preview: null });
  const [qrAnual, setQrAnual] = useState<{
    file: File | null;
    preview: string | null;
  }>({ file: null, preview: null });
  const [qrPromo, setQrPromo] = useState<{
    file: File | null;
    preview: string | null;
  }>({ file: null, preview: null });

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
    resetFiles();
    setShowForm(false);
    setEditingId(null);
  }, [activeTab]);

  const resetFiles = () => {
    setQrMensual({ file: null, preview: null });
    setQrAnual({ file: null, preview: null });
    setQrPromo({ file: null, preview: null });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: any,
  ) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setter({ file, preview: URL.createObjectURL(file) });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const data = new FormData();
    data.append("nombre_plan", formData.nombre_plan);
    data.append("precio_plan", String(formData.precio_plan));
    data.append("cant_publicaciones", String(formData.cant_publicaciones));
    data.append("tipo", String(activeTab === "publicacion"));

    if (editingId) data.append("id_plan", String(editingId));

    if (activeTab === "publicacion") {
      if (qrMensual.file) data.append("qr_mensual", qrMensual.file);
      if (qrAnual.file) data.append("qr_anual", qrAnual.file);
    } else {
      if (qrPromo.file) data.append("qr_promo", qrPromo.file);
    }

    try {
      const res = await fetch("/api/admin/publicacion", {
        method: editingId ? "PATCH" : "POST",
        body: data,
      });
      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        resetFiles();
        fetchPlanes();
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setIsSaving(false);
    }
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
          {/* SELECTOR MÓVIL (Estilo del segundo código) */}
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

          {/* TABS DESKTOP (Estilo del segundo código: Cápsulas redondeadas) */}
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

          {/* RESTO DEL CONTENIDO (Formulario y Grid) */}
          {!showForm && (
            <div className="flex justify-end mb-8">
              <Button
                onClick={() => {
                  setShowForm(true);
                  setEditingId(null);
                  resetFiles();
                  setFormData({
                    nombre_plan: "",
                    precio_plan: 0,
                    cant_publicaciones: 0,
                  });
                }}
                className="font-bold gap-2 rounded-xl shadow-md px-6"
              >
                <Plus className="w-5 h-5" /> Nuevo plan
              </Button>
            </div>
          )}

          <TabsContent value={activeTab} className="m-0 outline-none">
            {/* ... Aquí va el Formulario y el Grid de planes ya unificados en el paso anterior ... */}
            {/* (Omitido para brevedad, pero manteniendo la lógica de carga de QR y edición) */}
            {showForm && (
              <div className="mb-12 p-8 border border-border rounded-[2.5rem] bg-card/50 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                <h3 className="text-center font-black mb-8 uppercase opacity-30 tracking-[0.2em] text-sm">
                  {editingId
                    ? `Editando: ${formData.nombre_plan}`
                    : `Crear Nuevo Plan`}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase opacity-50 ml-2 tracking-widest">
                      Nombre del Plan
                    </label>
                    <input
                      className="w-full bg-muted/50 border-2 border-transparent focus:border-primary/20 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-semibold"
                      value={formData.nombre_plan}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nombre_plan: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase opacity-50 ml-2 tracking-widest">
                      Precio ($)
                    </label>
                    <input
                      type="number"
                      className="w-full bg-muted/50 border-2 border-transparent p-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-semibold"
                      value={formData.precio_plan}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          precio_plan: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase opacity-50 ml-2 tracking-widest">
                      {labelDinamica}
                    </label>
                    <input
                      type="number"
                      className="w-full bg-muted/50 border-2 border-transparent p-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-semibold"
                      value={formData.cant_publicaciones}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cant_publicaciones: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="col-span-1 md:col-span-3 pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 justify-items-center border-t border-dashed pt-10">
                      {activeTab === "publicacion" ? (
                        <>
                          <QRBox
                            title="QR Mensual"
                            preview={qrMensual.preview}
                            onClick={() => fileInputMensualRef.current?.click()}
                          />
                          <QRBox
                            title="QR Anual"
                            preview={qrAnual.preview}
                            onClick={() => fileInputAnualRef.current?.click()}
                          />
                        </>
                      ) : (
                        <div className="col-span-1 sm:col-span-2">
                          <QRBox
                            title="QR Promocional Único"
                            preview={qrPromo.preview}
                            onClick={() => fileInputPromoRef.current?.click()}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <input
                  type="file"
                  hidden
                  ref={fileInputMensualRef}
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setQrMensual)}
                />
                <input
                  type="file"
                  hidden
                  ref={fileInputAnualRef}
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setQrAnual)}
                />
                <input
                  type="file"
                  hidden
                  ref={fileInputPromoRef}
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setQrPromo)}
                />

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-14 py-7 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 shadow-lg shadow-primary/20"
                  >
                    {isSaving ? (
                      <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    Guardar Cambios
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowForm(false)}
                    className="px-14 py-7 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-destructive/5 hover:text-destructive transition-colors"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center p-32">
                <Loader2 className="w-12 h-12 animate-spin text-primary/20" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
                {planesFiltrados.map((plan) => (
                  <div
                    key={plan.id_plan}
                    className="relative flex flex-col text-center border-2 border-transparent shadow-sm rounded-[2rem] pt-10 overflow-hidden bg-card hover:border-primary/20 hover:shadow-xl transition-all group"
                  >
                    <div className="absolute top-6 right-6 flex flex-col items-center gap-2">
                      <span className="text-[9px] font-black uppercase opacity-20 tracking-tighter">
                        {plan.activo ? "Activo" : "Inactivo"}
                      </span>
                      <Switch
                        checked={plan.activo}
                        onCheckedChange={() => {
                          /* lógica de toggle */
                        }}
                      />
                    </div>
                    <div className="px-8 pb-3">
                      <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                        {plan.nombre_plan}
                      </h3>
                    </div>
                    <div className="flex flex-col items-center px-8 pb-10">
                      <span className="text-5xl font-black tracking-tighter">
                        $ {plan.precio_plan}
                      </span>
                      <div className="mt-6 text-muted-foreground text-[10px] font-black uppercase tracking-[0.25em] bg-muted/50 px-5 py-2 rounded-full border">
                        {plan.cant_publicaciones} {labelDinamica}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingId(plan.id_plan);
                        setFormData({
                          nombre_plan: plan.nombre_plan,
                          precio_plan: plan.precio_plan,
                          cant_publicaciones: plan.cant_publicaciones,
                        });
                        setShowForm(true);
                      }}
                      className="w-full py-6 border-t bg-muted/5 flex justify-center items-center gap-3 hover:bg-primary hover:text-white transition-all text-xs font-black uppercase tracking-widest"
                    >
                      <Edit3 className="w-4 h-4" /> Editar Plan
                    </button>
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

const QRBox = ({ title, preview, onClick }: any) => (
  <div className="flex flex-col items-center gap-5">
    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
      {title}
    </span>
    <div
      onClick={onClick}
      className="w-52 h-52 border-2 border-dashed rounded-[2.5rem] flex items-center justify-center cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition-all relative overflow-hidden group bg-muted/20 border-muted-foreground/20"
    >
      {preview ? (
        <img
          src={preview}
          className="w-full h-full object-contain p-6 animate-in fade-in zoom-in-95 duration-500"
          alt="qr"
        />
      ) : (
        <div className="flex flex-col items-center opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all">
          <UploadCloud className="w-12 h-12 mb-3 text-primary" />
          <span className="text-[9px] font-black uppercase tracking-widest">
            Subir QR
          </span>
        </div>
      )}
    </div>
  </div>
);
