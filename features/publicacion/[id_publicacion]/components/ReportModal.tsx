"use client";
/**
 * @Dev: [tu nombre]
 * @Fecha: 10/05/2026
 * @Funcionalidad: Modal para reportar una publicación.
 *   - Muestra una lista de motivos de reporte
 *   - Permite al usuario seleccionar un motivo y añadir un comentario opcional
 *   - Envía el reporte a la API
 * @param {number} id_publicacion - ID de la publicación a reportar
 */
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Flag } from "lucide-react";

const MOTIVOS = [
  "Información falsa o engañosa",
  "Las fotos no corresponden al inmueble",
  "Precio incorrecto o abusivo",
  "El inmueble ya fue vendido o alquilado",
  "Datos de contacto incorrectos",
  "Publicación duplicada",
  "Contenido inapropiado u ofensivo",
  "Otro",
];

interface ReportModalProps {
  id_publicacion: number;
}

export default function ReportModal({ id_publicacion }: ReportModalProps) {
  const [abierto, setAbierto]         = useState(false);
  const [motivoSel, setMotivoSel]     = useState<string | null>(null);
  const [comentario, setComentario]   = useState("");
  const [enviando, setEnviando]       = useState(false);
  const [enviado, setEnviado]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const handleAbrir = () => {
    setMotivoSel(null);
    setComentario("");
    setEnviado(false);
    setError(null);
    setAbierto(true);
  };

  const handleEnviar = async () => {
    if (!motivoSel) {
      setError("Por favor selecciona un motivo.");
      return;
    }
    setEnviando(true);
    setError(null);

    try {
      // TODO: reemplazar con la ruta real de la API cuando esté lista
      const res = await fetch("/api/publicacion/reportar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_publicacion,
          motivo: motivoSel,
          comentario: comentario.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Error al enviar el reporte.");
      setEnviado(true);
    } catch {
      setError("No se pudo enviar el reporte. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      {/* Botón que abre el modal */}
      <button
        onClick={handleAbrir}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#C26E5A] transition-colors"
      >
        <Flag className="w-4 h-4" />
        Reportar publicación
      </button>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="sm:max-w-md bg-[#F4EFE6] text-[#2E2E2E] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#1F3A4D] text-xl font-bold flex items-center gap-2">
              <Flag className="w-5 h-5 text-[#C26E5A]" />
              Reportar publicación
            </DialogTitle>
          </DialogHeader>

          {enviado ? (
            /* ── Estado: reporte enviado ── */
            <div className="py-6 text-center space-y-3">
              <p className="text-2xl">✅</p>
              <p className="font-semibold text-[#1F3A4D]">
                Reporte enviado correctamente
              </p>
              <p className="text-sm text-gray-500">
                Revisaremos tu reporte a la brevedad. Gracias por ayudarnos a
                mantener la plataforma confiable.
              </p>
              <Button
                variant="azul"
                className="mt-2"
                onClick={() => setAbierto(false)}
              >
                Cerrar
              </Button>
            </div>
          ) : (
            /* ── Formulario de reporte ── */
            <>
              <div className="space-y-3 py-2">
                <p className="text-sm text-gray-500">
                  Selecciona el motivo de tu reporte:
                </p>

                <ul className="space-y-2">
                  {MOTIVOS.map((motivo) => (
                    <li key={motivo}>
                      <button
                        onClick={() => setMotivoSel(motivo)}
                        className={`w-full text-left text-sm px-4 py-2.5 rounded-xl border transition-all ${
                          motivoSel === motivo
                            ? "border-[#1F3A4D] bg-[#1F3A4D] text-white font-semibold"
                            : "border-black/10 bg-white hover:border-[#1F3A4D]/40"
                        }`}
                      >
                        {motivo}
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="pt-1">
                  <label className="text-sm text-gray-500 mb-1 block">
                    Comentario adicional{" "}
                    <span className="text-gray-400">(opcional)</span>
                  </label>
                  <Textarea
                    placeholder="Describe brevemente el problema..."
                    className="resize-none bg-white border-black/10 focus:border-[#1F3A4D] rounded-xl text-sm"
                    rows={3}
                    maxLength={300}
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                  />
                  <p className="text-[11px] text-gray-400 text-right mt-1">
                    {comentario.length}/300
                  </p>
                </div>

                {error && (
                  <p className="text-sm text-red-500 font-medium">{error}</p>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="ghost"
                  onClick={() => setAbierto(false)}
                  disabled={enviando}
                >
                  Cancelar
                </Button>
                <Button
                  variant="azul"
                  onClick={handleEnviar}
                  disabled={enviando || !motivoSel}
                >
                  {enviando ? "Enviando..." : "Enviar reporte"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}