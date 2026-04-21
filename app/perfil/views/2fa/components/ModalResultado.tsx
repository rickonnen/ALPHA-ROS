"use client";
import { Check, X } from "lucide-react";

interface Props {
  tipo: "success" | "error";
  mensaje: string;
  onClose: () => void;
}

export default function ModalResultado({ tipo, mensaje, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#F4EFE6] rounded-2xl w-full max-w-sm p-8 relative flex flex-col items-center gap-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#1F3A4D]/50 hover:text-[#1F3A4D] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="w-14 h-14 rounded-full border-2 border-[#C26E5A] flex items-center justify-center">
          {tipo === "success" ? (
            <Check className="h-6 w-6 text-[#C26E5A]" />
          ) : (
            <X className="h-6 w-6 text-[#C26E5A]" />
          )}
        </div>

        <h3 className="text-xl font-bold text-[#1F3A4D]">
          {tipo === "success" ? "¡Éxito!" : "¡Ocurrió un error!"}
        </h3>

        <p className="text-sm text-[#1F3A4D]/70 text-center">{mensaje}</p>

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#C26E5A] hover:bg-[#b05e4a] text-white font-bold rounded-xl transition-colors"
        >
          {tipo === "success" ? "Aceptar" : "Reintentar"}
        </button>
      </div>
    </div>
  );
}