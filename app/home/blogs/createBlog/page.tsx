"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImagePlus, Loader2, X, Send, Ban } from "lucide-react";

// Componentes básicos de interfaz
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Interface para los valores del formulario en camelCase
interface blogFormValues {
  StrTitleBlo: string;
  StrDescriptionBlo: string;
  StrContentBlo: string;
}

/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 29/04/2026
 * funcionalidad: Formulario de creación de blogs con validación manual y soporte de Cloudinary
 */
export default function CreateBlogPage() {
  const objRouterBlo = useRouter();
  
  // Estados con prefijo de tipo y sufijo de entidad
  const [bolIsLoadingBlo, setBolIsLoadingBlo] = useState<boolean>(false);
  const [objSelectedImageBlo, setObjSelectedImageBlo] = useState<File | null>(null);
  const [strImagePreviewBlo, setStrImagePreviewBlo] = useState<string | null>(null);
  const [objFormValuesBlo, setObjFormValuesBlo] = useState<blogFormValues>({
    StrTitleBlo: "",
    StrDescriptionBlo: "",
    StrContentBlo: "",
  });

  // Estado para el manejo de errores de validación
  const [objErrorsBlo, setObjErrorsBlo] = useState<Partial<blogFormValues>>({});

  /**
   * Actualiza los valores del formulario y limpia errores al escribir
   */
  const fnHandleChangeBlo = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setObjFormValuesBlo((prev) => ({ ...prev, [name]: value }));
    if (objErrorsBlo[name as keyof blogFormValues]) {
      setObjErrorsBlo((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Procesa la previsualización de la imagen local
   */
  const fnHandleImageChangeBlo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const objFileBlo = e.target.files?.[0];
    if (objFileBlo) {
      setObjSelectedImageBlo(objFileBlo);
      const strReaderBlo = new FileReader();
      strReaderBlo.onloadend = () => setStrImagePreviewBlo(strReaderBlo.result as string);
      strReaderBlo.readAsDataURL(objFileBlo);
    }
  };

  /**
   * Sube la imagen a Cloudinary (Paso 1 del flujo)
   */
  const fnUploadToCloudinaryBlo = async (objFileBlo: File): Promise<string | null> => {
    const strCloudNameBlo = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const strUploadPresetBlo = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!strCloudNameBlo || !strUploadPresetBlo) return null;

    const objFormDataBlo = new FormData();
    objFormDataBlo.append("file", objFileBlo);
    objFormDataBlo.append("upload_preset", strUploadPresetBlo);

    try {
      const objResponseBlo = await fetch(
        `https://api.cloudinary.com/v1_1/${strCloudNameBlo}/image/upload`,
        { method: "POST", body: objFormDataBlo }
      );
      const objDataBlo = await objResponseBlo.json();
      return objDataBlo.secure_url;
    } catch (objErrorBlo) {
      console.error("[CLOUDINARY_ERROR]", objErrorBlo);
      return null;
    }
  };

  /**
   * Valida los criterios de aceptación antes del envío [cite: 1, 53-61]
   */
  const fnValidateFormBlo = (): boolean => {
    const objNewErrorsBlo: Partial<blogFormValues> = {};
    let bolIsValidBlo = true;

    if (!objFormValuesBlo.StrTitleBlo.trim()) {
      objNewErrorsBlo.StrTitleBlo = "El título es obligatorio [cite: 3, 73]";
      bolIsValidBlo = false;
    } else if (objFormValuesBlo.StrTitleBlo.length > 100) {
      objNewErrorsBlo.StrTitleBlo = "El título excede los 100 caracteres permitidos";
      bolIsValidBlo = false;
    }

    if (!objFormValuesBlo.StrDescriptionBlo.trim()) {
      objNewErrorsBlo.StrDescriptionBlo = "La descripción es obligatoria [cite: 3, 74]";
      bolIsValidBlo = false;
    } else if (objFormValuesBlo.StrDescriptionBlo.length > 120) {
      objNewErrorsBlo.StrDescriptionBlo = "La descripción excede los 120 caracteres permitidos";
      bolIsValidBlo = false;
    }

    if (!objFormValuesBlo.StrContentBlo.trim()) {
      objNewErrorsBlo.StrContentBlo = "El contenido no puede estar vacío [cite: 3, 76]";
      bolIsValidBlo = false;
    } else if (objFormValuesBlo.StrContentBlo.length > 400) {
      objNewErrorsBlo.StrContentBlo = "El contenido excede los 400 caracteres permitidos";
      bolIsValidBlo = false;
    }

    setObjErrorsBlo(objNewErrorsBlo);
    return bolIsValidBlo;
  };

  /**
   * Ejecuta el envío de datos a la API del servidor
   */
  const fnOnSubmitBlo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fnValidateFormBlo()) return;

    setBolIsLoadingBlo(true);
    try {
      // Manejo de imagen opcional: enlace por defecto si no hay selección 
      let strImageUrlBlo = "https://via.placeholder.com/150?text=Sin+Imagen";
      
      if (objSelectedImageBlo) {
        const strUploadedUrlBlo = await fnUploadToCloudinaryBlo(objSelectedImageBlo);
        if (strUploadedUrlBlo) strImageUrlBlo = strUploadedUrlBlo;
      }

      // Consumo de la API interna del proyecto
      const objResponseBlo = await fetch("/api/home/blogs/createBlog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          StrTitleBlo: objFormValuesBlo.StrTitleBlo,
          StrDescriptionBlo: objFormValuesBlo.StrDescriptionBlo,
          StrContentBlo: objFormValuesBlo.StrContentBlo,
          StrImageUrlBlo: strImageUrlBlo,
        }),
      });

      const objDataBlo = await objResponseBlo.json();

      if (!objResponseBlo.ok) {
        throw new Error(objDataBlo.error || "Error al procesar la solicitud");
      }

      alert("¡Blog creado con éxito!");
      objRouterBlo.push("/home/blogs");
    } catch (objErrorBlo: any) {
      console.error("[SUBMIT_ERROR]", objErrorBlo);
      alert(objErrorBlo.message || "Error en el envío.");
    } finally {
      setBolIsLoadingBlo(false);
    }
  };

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Crea tu propio mini-blog</CardTitle>
            <CardDescription>Comparte información o debate temas del rubro inmobiliario[cite: 1, 2].</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={fnOnSubmitBlo} className="space-y-6">
              
              <div className="space-y-2">
                <label className="font-semibold text-sm">Título</label>
                <Input
                  name="StrTitleBlo"
                  value={objFormValuesBlo.StrTitleBlo}
                  onChange={fnHandleChangeBlo}
                  placeholder="Título del blog..."
                  className={objErrorsBlo.StrTitleBlo ? "border-red-500" : ""}
                />
                {objErrorsBlo.StrTitleBlo && <p className="text-xs text-red-500">{objErrorsBlo.StrTitleBlo}</p>}
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-sm">Descripción breve</label>
                <Input
                  name="StrDescriptionBlo"
                  value={objFormValuesBlo.StrDescriptionBlo}
                  onChange={fnHandleChangeBlo}
                  placeholder="Resumen para la comunidad..."
                  className={objErrorsBlo.StrDescriptionBlo ? "border-red-500" : ""}
                />
                {objErrorsBlo.StrDescriptionBlo && <p className="text-xs text-red-500">{objErrorsBlo.StrDescriptionBlo}</p>}
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-sm">Contenido</label>
                <Textarea
                  name="StrContentBlo"
                  value={objFormValuesBlo.StrContentBlo}
                  onChange={fnHandleChangeBlo}
                  placeholder="Redacta tu mensaje aquí... [cite: 1, 58]"
                  className={`min-h-[150px] ${objErrorsBlo.StrContentBlo ? "border-red-500" : ""}`}
                />
                {objErrorsBlo.StrContentBlo && <p className="text-xs text-red-500">{objErrorsBlo.StrContentBlo}</p>}
              </div>

              <div className="space-y-3">
                <label className="font-semibold text-sm">Imagen (Opcional)</label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-muted/5">
                  {strImagePreviewBlo ? (
                    <div className="relative w-full aspect-video">
                      <img src={strImagePreviewBlo} className="rounded-md object-cover w-full h-full" alt="Preview" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 rounded-full w-8 h-8"
                        onClick={() => { setStrImagePreviewBlo(null); setObjSelectedImageBlo(null); }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-2 cursor-pointer">
                      <div className="p-4 bg-background rounded-full border shadow-sm">
                        <ImagePlus className="w-8 h-8 text-[#E2725B]" />
                      </div>
                      <span className="text-sm text-muted-foreground">Seleccionar imagen</span>
                      <input type="file" className="hidden" accept="image/*" onChange={fnHandleImageChangeBlo} />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                <Button type="submit" disabled={bolIsLoadingBlo} className="flex-1 bg-[#E2725B] hover:bg-[#C85A46] text-white font-bold h-11">
                  {bolIsLoadingBlo ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</> : <><Send className="mr-2 h-4 w-4" /> Crear Blog</>}
                </Button>
                <Link href="/home/blogs" className="flex-1">
                  <Button type="button" variant="outline" className="w-full h-11 border-[#E2725B] text-[#E2725B] font-semibold hover:bg-[#E2725B]/10">
                    <Ban className="mr-2 h-4 w-4" /> Cancelar [cite: 1, 62]
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}