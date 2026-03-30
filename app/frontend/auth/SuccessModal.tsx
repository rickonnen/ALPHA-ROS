"use client";
import { Check } from "lucide-react";
import { useEffect } from "react";

interface SuccessModalProps {
  isOpen: boolean;
  message?: string;
  onClose: () => void;
  autoCloseDuration?: number; // en milisegundos
}

export default function SuccessModal({ 
  isOpen, 
  message = "¡Operación exitosa!", 
  onClose,
  autoCloseDuration = 3000 
}: SuccessModalProps) {
  useEffect(() => {
    if (isOpen && autoCloseDuration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDuration, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Fondo desenfocado */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-[#EAE3D9] rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        {/* Icono de éxito */}
        <div className="flex justify-center mb-4">
          <div className="bg-[#B47B65] rounded-full p-3">
            <Check size={32} className="text-white" />
          </div>
        </div>

        {/* Mensaje */}
        <h2 className="text-[#0F172A] font-bold text-xl mb-2">¡Éxito!</h2>
        <p className="text-[#6B7280] text-sm">{message}</p>

        {/* Botón opcional */}
        <button
          onClick={onClose}
          className="mt-6 bg-[#B47B65] text-white px-6 py-2 rounded-full font-bold hover:bg-[#a86b55] transition"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
