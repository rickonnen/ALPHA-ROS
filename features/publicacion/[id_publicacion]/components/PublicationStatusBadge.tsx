/**
 * Dev: Marcela C.
 * Date: 17/04/2026
 * Funcionalidad: Insignia de estado de la publicación (HU7 - Task 7.1)
 * @param strEstado - Nombre del estado: "Activa", "Inactiva" o "Vendida"
 * @return JSX con badge coloreado según el estado
 */
import React from "react";

interface PublicationStatusBadgeProps {
  strEstado?: string | null;
}

const getEstadoStyles = (strEstado?: string | null): string => {
  switch (strEstado) {
    case "Activa":     return "bg-[#1F3A4D] text-white";
    case "Inactiva":   return "bg-gray-200 text-gray-600";
    case "Vendida":    return "bg-[#C26E5A] text-white";
    case "Suspendida": return "bg-gray-200 text-gray-600";
    default:           return "bg-gray-200 text-gray-400";
  }
};

export const PublicationStatusBadge = ({ strEstado }: PublicationStatusBadgeProps) => (
  <span className={`inline-block text-xl font-semibold px-4 py-1.5 rounded-full ${getEstadoStyles(strEstado)}`}>
    {strEstado ?? "Sin estado"}
  </span>
);