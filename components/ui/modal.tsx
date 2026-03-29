/**
 * Dev: Dylan Coca Beltran
 * Fecha: 27/03/2026
 * Funcionalidad: Modal reutilizable de éxito o error para cualquier vista del proyecto
 * @param type - "success" para éxito, "error" para error
 * @param title - Título principal del modal
 * @param message - Mensaje descriptivo del modal
 * @param onClose - Función que se ejecuta al cerrar el modal
 * @param onRetry - Función opcional para el botón "Reintentar" (solo en error)
 * @return Modal con ícono, mensaje y botones según el tipo
 * 
 * Modificado: TuNombre TuApellido - 28/03/2026
 * Cambio: Se eliminó el botón Cancelar del modal de error
 */
"use client";

import { X, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultModalProps {
  type: "success" | "error";
  title: string;
  message: string;
  onClose: () => void;
  onRetry?: () => void;
}

export default function ResultModal({ type, title, message, onClose, onRetry }: ResultModalProps) {
  // Define si es éxito o error para los estilos
  const bolIsSuccess = type === "success";

  return (
    // Fondo oscuro que cubre toda la pantalla
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      {/* Caja del modal */}
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl relative text-center">

        {/* Botón X para cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X size={18} />
        </button>

        {/* Ícono según el tipo */}
        <div className="flex justify-center mb-4">
          {bolIsSuccess
            ? <CheckCircle size={52} className="text-green-500" />
            : <XCircle size={52} className="text-red-500" />
          }
        </div>

        {/* Título y mensaje */}
        <h3 className="text-lg font-bold mb-2 text-slate-800">{title}</h3>
        <p className="text-slate-500 text-sm mb-6">{message}</p>

        {/* Botones según el tipo */}
        {bolIsSuccess ? (
          <Button className="w-full" onClick={onClose}>Aceptar</Button>
        ) : (
          <div className="flex gap-3">
            {onRetry && (
              <Button variant="destructive" className="w-full" onClick={onRetry}>Reintentar</Button>
            )}
          </div>
        )}

      </div>
    </div>
  );
} 