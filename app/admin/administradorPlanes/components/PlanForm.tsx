import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save, UploadCloud, X, ZoomIn } from "lucide-react";
import { Plan } from "../page";

interface PlanFormProps {
  activeTab: string;
  planToEdit: Plan | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function PlanForm({
  activeTab,
  planToEdit,
  onCancel,
  onSuccess,
}: PlanFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedZoomImage, setSelectedZoomImage] = useState<string | null>(
    null,
  );

  const [formData, setFormData] = useState({
    nombre_plan: "",
    precio_plan: "" as string | number,
    cant_publicaciones: "" as string | number,
  });

  // Refs individuales para cada input de archivo
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

  useEffect(() => {
    if (planToEdit) {
      setFormData({
        nombre_plan: planToEdit.nombre_plan,
        precio_plan: planToEdit.precio_plan,
        cant_publicaciones: planToEdit.cant_publicaciones,
      });

      const qrM =
        planToEdit.QrUrl?.find((q) => q.modalidad === "mensual")?.qr_URL ||
        null;
      const qrA =
        planToEdit.QrUrl?.find((q) => q.modalidad === "anual")?.qr_URL || null;
      const qrP =
        planToEdit.QrUrl?.find((q) => q.modalidad === null)?.qr_URL || null;

      setQrMensual({ file: null, preview: qrM });
      setQrAnual({ file: null, preview: qrA });
      setQrPromo({ file: null, preview: qrP });
    } else {
      setFormData({ nombre_plan: "", precio_plan: "", cant_publicaciones: "" });
      setQrMensual({ file: null, preview: null });
      setQrAnual({ file: null, preview: null });
      setQrPromo({ file: null, preview: null });
    }
  }, [planToEdit]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: any,
  ) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setter({ file, preview: URL.createObjectURL(file) });
    }
  };

  const handleRemoveFile = (setter: any) => {
    setter({ file: null, preview: null });
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
      else if (!qrMensual.preview) data.append("delete_qr_mensual", "true");

      if (qrAnual.file) data.append("qr_anual", qrAnual.file);
      else if (!qrAnual.preview) data.append("delete_qr_anual", "true");
    } else {
      if (qrPromo.file) data.append("qr_promo", qrPromo.file);
      else if (!qrPromo.preview) data.append("delete_qr_promo", "true");
    }

    try {
      const res = await fetch("/api/admin/publicacion", {
        method: planToEdit ? "PATCH" : "POST",
        body: data,
      });
      if (res.ok) onSuccess();
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const labelDinamica = activeTab === "publicacion" ? "Publicaciones" : "Días";
  const isFormValid =
    formData.nombre_plan.trim().length > 0 &&
    Number(formData.precio_plan) >= 0 &&
    Number(formData.precio_plan) <= 1000000 &&
    String(formData.precio_plan) !== "" &&
    Number(formData.cant_publicaciones) > 0;

  // Lógica de cálculo de precios dinámicos para los QR
  const basePrice = Number(formData.precio_plan) || 0;
  const precioMensualFormateado =
    basePrice > 0 ? `${basePrice.toFixed(2)} $` : "0.00 $";
  const precioAnualFormateado =
    basePrice > 0 ? `${(basePrice * 12 * 0.9).toFixed(2)} $` : "0.00 $";

  return (
    <div className="mb-12 p-8 border border-border rounded-[2.5rem] bg-card/50 shadow-2xl relative">
      {/* MODAL ZOOM */}
      {selectedZoomImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedZoomImage(null)}
        >
          <div
            className="relative max-w-sm w-full bg-white rounded-[2rem] p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute -top-12 right-0 text-white flex items-center gap-2 font-bold uppercase text-xs hover:text-primary transition-colors"
              onClick={() => setSelectedZoomImage(null)}
            >
              Cerrar <X className="w-6 h-6" />
            </button>
            <img
              src={selectedZoomImage}
              className="w-full h-auto rounded-2xl"
              alt="Preview"
            />
          </div>
        </div>
      )}

      <h3 className="text-center font-black mb-8 uppercase opacity-30 tracking-[0.2em] text-sm">
        {planToEdit ? `Editando: ${formData.nombre_plan}` : `Crear Nuevo Plan`}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase opacity-50 ml-2 tracking-widest">
            Nombre del Plan
          </label>
          <input
            type="text"
            maxLength={30}
            className="w-full bg-muted/50 border-2 border-transparent focus:border-primary/20 p-4 rounded-2xl outline-none transition-all font-semibold uppercase"
            value={formData.nombre_plan}
            onChange={(e) =>
              setFormData({
                ...formData,
                nombre_plan: e.target.value
                  .replace(/[^a-zA-Z0-9\s\-()]/g, "")
                  .toUpperCase(),
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
            min="0"
            max="1000000"
            step="0.01"
            className="w-full bg-muted/50 border-2 border-transparent p-4 rounded-2xl outline-none transition-all font-semibold"
            value={formData.precio_plan}
            onKeyDown={(e) => {
              if (["-", "e", "E", "+"].includes(e.key)) e.preventDefault();
            }}
            onChange={(e) => {
              let val = e.target.value;

              // 1. Quitar ceros a la izquierda
              if (
                val.length > 1 &&
                val.startsWith("0") &&
                !val.startsWith("0.")
              ) {
                val = val.replace(/^0+/, "");
              }

              // 2. Validación de máximo 2 decimales
              if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                if (Number(val) <= 1000000) {
                  setFormData({ ...formData, precio_plan: val });
                }
              }
            }}
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase opacity-50 ml-2 tracking-widest">
            {labelDinamica}
          </label>
          <input
            type="number"
            min="1"
            step="1"
            className="w-full bg-muted/50 border-2 border-transparent p-4 rounded-2xl outline-none transition-all font-semibold"
            value={formData.cant_publicaciones}
            onKeyDown={(e) => {
              if (["-", "e", "E", "+", ".", ","].includes(e.key))
                e.preventDefault();
            }}
            onChange={(e) => {
              let val = e.target.value;
              if (val.length > 1 && val.startsWith("0"))
                val = val.replace(/^0+/, "");
              setFormData({ ...formData, cant_publicaciones: val });
            }}
          />
        </div>

        <div className="col-span-1 md:col-span-3 pt-6 border-t border-dashed">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 justify-items-center pt-4">
            {activeTab === "publicacion" ? (
              <>
                <QRBox
                  title="QR Mensual"
                  price={precioMensualFormateado}
                  preview={qrMensual.preview}
                  onClick={() => fileInputMensualRef.current?.click()}
                  onRemove={() => handleRemoveFile(setQrMensual)}
                  onZoom={setSelectedZoomImage}
                />
                <QRBox
                  title="QR Anual"
                  price={precioAnualFormateado}
                  preview={qrAnual.preview}
                  onClick={() => fileInputAnualRef.current?.click()}
                  onRemove={() => handleRemoveFile(setQrAnual)}
                  onZoom={setSelectedZoomImage}
                />
              </>
            ) : (
              <div className="col-span-1 sm:col-span-2">
                <QRBox
                  title="QR Promocional Único"
                  price={precioMensualFormateado}
                  preview={qrPromo.preview}
                  onClick={() => fileInputPromoRef.current?.click()}
                  onRemove={() => handleRemoveFile(setQrPromo)}
                  onZoom={setSelectedZoomImage}
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
          disabled={isSaving || !isFormValid}
          className="px-14 py-7 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3"
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
          onClick={onCancel}
          className="px-14 py-7 rounded-2xl font-black uppercase tracking-widest text-[10px]"
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}

// COMPONENTE QRBox MODIFICADO (Agregada la prop de precio)
const QRBox = ({ title, price, preview, onClick, onRemove, onZoom }: any) => {
  const handleContainerClick = (e: React.MouseEvent) => {
    if (preview) return;
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
          {title}
        </span>
        {/* Aquí se despliega el precio calculado en tiempo real */}
        <span className="text-xs font-extrabold text-primary tracking-wider bg-primary/10 px-3 py-0.5 rounded-full">
          {price}
        </span>
      </div>

      <div className="relative group w-52 h-52">
        <div
          onClick={handleContainerClick}
          className={`w-full h-full border-2 border-dashed rounded-[2.5rem] flex items-center justify-center transition-all relative overflow-hidden bg-muted/20 
            ${!preview ? "cursor-pointer hover:bg-primary/5 hover:border-primary/40 border-muted-foreground/20" : "border-transparent"}`}
        >
          {preview ? (
            <>
              <img
                src={preview}
                className="w-full h-full object-contain p-6"
                alt="qr"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onZoom(preview);
                  }}
                  className="bg-white p-3 rounded-full text-black hover:scale-110 transition-transform shadow-xl"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="bg-destructive p-3 rounded-full text-white hover:scale-110 transition-transform shadow-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center opacity-30 group-hover:opacity-100 transition-all pointer-events-none">
              <UploadCloud className="w-12 h-12 mb-3 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-widest">
                Subir QR
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
