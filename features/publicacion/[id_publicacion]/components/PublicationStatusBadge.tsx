/**
 * Dev: Marcela C.
 * Date: 17/04/2026
 * Funcionalidad: Insignia de estado de la publicación (HU7 - Task 7.1)
 * @param strEstado - Nombre del estado: "Activa", "Inactiva" o "Vendida"
 * @return JSX con badge coloreado según el estado
 */
/**
 * Modificacion
 * Dev: [tu nombre]
 * Date: 09/05/2026
 * Funcionalidad: Agrega DestacadaBadge — se exporta para usarse en la vista privada
 *                del propietario cuando existe una PromocionPublicacion vigente.
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

export const DestacadaBadge = () => (
  <span className="inline-flex items-center gap-1.5 text-xl font-semibold px-4 py-1.5 rounded-full bg-amber-400 text-amber-900">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
    Propiedad Destacada
  </span>
);