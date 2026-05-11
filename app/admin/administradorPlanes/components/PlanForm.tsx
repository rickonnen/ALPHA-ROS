import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save, UploadCloud } from "lucide-react";
import { Plan } from "../page";

interface PlanFormProps {
  activeTab: string;
  planToEdit: Plan | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function PlanForm({ activeTab, planToEdit, onCancel, onSuccess }: PlanFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre_plan: "",
    precio_plan: 0,
    cant_publicaciones: 0,
  });

  const fileInputMensualRef = useRef<HTMLInputElement>(null);
  const fileInputAnualRef = useRef<HTMLInputElement>(null);
  const fileInputPromoRef = useRef<HTMLInputElement>(null);

  const [qrMensual, setQrMensual] = useState<{ file: File | null; preview: string | null }>({ file: null, preview: null });
  const [qrAnual, setQrAnual] = useState<{ file: File | null; preview: string | null }>({ file: null, preview: null });
  const [qrPromo, setQrPromo] = useState<{ file: File | null; preview: string | null }>({ file: null, preview: null });

  // Si hay un plan para editar, llenamos el formulario. Si no, lo limpiamos.
  useEffect(() => {
    if (planToEdit) {
      setFormData({
        nombre_plan: planToEdit.nombre_plan,
        precio_plan: planToEdit.precio_plan,
        cant_publicaciones: planToEdit.cant_publicaciones,
      });
    } else {
      setFormData({ nombre_plan: "", precio_plan: 0, cant_publicaciones: 0 });
    }
  }, [planToEdit]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: any) => {
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

    if (planToEdit) data.append("id_plan", String(planToEdit.id_plan));

    if (activeTab === "publicacion") {
      if (qrMensual.file) data.append("qr_mensual", qrMensual.file);
      if (qrAnual.file) data.append("qr_anual", qrAnual.file);
    } else {
      if (qrPromo.file) data.append("qr_promo", qrPromo.file);
    }

    try {
      const res = await fetch("/api/admin/publicacion", {
        method: planToEdit ? "PATCH" : "POST",
        body: data,
      });
      if (res.ok) {
        onSuccess(); // Le avisa al page.tsx que debe recargar la lista
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const labelDinamica = activeTab === "publicacion" ? "Publicaciones" : "Días";

  return (
    <div className="mb-12 p-8 border border-border rounded-[2.5rem] bg-card/50 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
      <h3 className="text-center font-black mb-8 uppercase opacity-30 tracking-[0.2em] text-sm">
        {planToEdit ? `Editando: ${formData.nombre_plan}` : `Crear Nuevo Plan`}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase opacity-50 ml-2 tracking-widest">Nombre del Plan</label>
          <input
            className="w-full bg-muted/50 border-2 border-transparent focus:border-primary/20 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-semibold"
            value={formData.nombre_plan}
            onChange={(e) => setFormData({ ...formData, nombre_plan: e.target.value })}
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase opacity-50 ml-2 tracking-widest">Precio ($)</label>
          <input
            type="number"
            className="w-full bg-muted/50 border-2 border-transparent p-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-semibold"
            value={formData.precio_plan}
            onChange={(e) => setFormData({ ...formData, precio_plan: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase opacity-50 ml-2 tracking-widest">{labelDinamica}</label>
          <input
            type="number"
            className="w-full bg-muted/50 border-2 border-transparent p-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-semibold"
            value={formData.cant_publicaciones}
            onChange={(e) => setFormData({ ...formData, cant_publicaciones: Number(e.target.value) })}
          />
        </div>

        <div className="col-span-1 md:col-span-3 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 justify-items-center border-t border-dashed pt-10">
            {activeTab === "publicacion" ? (
              <>
                <QRBox title="QR Mensual" preview={qrMensual.preview} onClick={() => fileInputMensualRef.current?.click()} />
                <QRBox title="QR Anual" preview={qrAnual.preview} onClick={() => fileInputAnualRef.current?.click()} />
              </>
            ) : (
              <div className="col-span-1 sm:col-span-2">
                <QRBox title="QR Promocional Único" preview={qrPromo.preview} onClick={() => fileInputPromoRef.current?.click()} />
              </div>
            )}
          </div>
        </div>
      </div>

      <input type="file" hidden ref={fileInputMensualRef} accept="image/*" onChange={(e) => handleFileChange(e, setQrMensual)} />
      <input type="file" hidden ref={fileInputAnualRef} accept="image/*" onChange={(e) => handleFileChange(e, setQrAnual)} />
      <input type="file" hidden ref={fileInputPromoRef} accept="image/*" onChange={(e) => handleFileChange(e, setQrPromo)} />

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button onClick={handleSave} disabled={isSaving} className="px-14 py-7 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 shadow-lg shadow-primary/20">
          {isSaving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
          Guardar Cambios
        </Button>
        <Button variant="ghost" onClick={onCancel} className="px-14 py-7 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-destructive/5 hover:text-destructive transition-colors">
          Cancelar
        </Button>
      </div>
    </div>
  );
}

// QRBox ahora vive únicamente aquí adentro
const QRBox = ({ title, preview, onClick }: any) => (
  <div className="flex flex-col items-center gap-5">
    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{title}</span>
    <div
      onClick={onClick}
      className="w-52 h-52 border-2 border-dashed rounded-[2.5rem] flex items-center justify-center cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition-all relative overflow-hidden group bg-muted/20 border-muted-foreground/20"
    >
      {preview ? (
        <img src={preview} className="w-full h-full object-contain p-6 animate-in fade-in zoom-in-95 duration-500" alt="qr" />
      ) : (
        <div className="flex flex-col items-center opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all">
          <UploadCloud className="w-12 h-12 mb-3 text-primary" />
          <span className="text-[9px] font-black uppercase tracking-widest">Subir QR</span>
        </div>
      )}
    </div>
  </div>
);