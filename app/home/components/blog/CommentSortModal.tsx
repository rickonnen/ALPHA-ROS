"use client";
/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 15/05/2026
 * funcionalidad: Dropdown desplegable para seleccionar el tipo de ordenamiento de los comentarios en el frontend
 */
import { Check } from "lucide-react";

interface CommentSortModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSort: string;
  onSortChange: (newSort: string) => void;
}

export default function CommentSortModal({ isOpen, onClose, currentSort, onSortChange }: CommentSortModalProps) {
  if (!isOpen) return null;

  const ArrSortOptions = [
    { id: "popular", label: "Populares" },
    { id: "reciente", label: "Más recientes" },
    { id: "antiguo", label: "Más antiguos" },
    { id: "mis_comentarios", label: "Mis comentarios" },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[55]" onClick={onClose} />
      <div 
        className="absolute top-full mt-3 left-1/2 -translate-x-1/2 z-[60] w-[210px] bg-card-bg border border-card-border rounded-xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col py-2">
          {ArrSortOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onSortChange(option.id)}
              className="flex items-center justify-between px-4 py-3 transition-colors text-[15px] hover:bg-secondary-fund text-foreground"
            >
              <span className={currentSort === option.id ? "font-bold text-primary" : "font-medium"}>
                {option.label}
              </span>
              {currentSort === option.id && <Check className="w-4 h-4 text-primary" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}