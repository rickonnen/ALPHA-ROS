"use client";

import { useRef, useEffect, useState, KeyboardEvent, useCallback } from "react";
import { useRouter } from "next/navigation";
// ¡OJO! Asegúrate de que este import de UI coincida con tu proyecto. 
// Si te da error, coméntalo temporalmente.
import { Button } from "@/components/ui/button"; 

// ── 1. TIPOS Y CONSTANTES ──────────────────────────────────────────────────────
export type Operacion = "Venta" | "Alquiler" | "Anticrético";
export type TipoInmueble = "Casa" | "Departamento" | "Cuarto" | "Terreno" | "Espacio de cementerio";

const OPERACIONES: Operacion[] = ["Venta", "Alquiler", "Anticrético"];
const TIPOS_INMUEBLE: TipoInmueble[] = ["Casa", "Departamento", "Cuarto", "Terreno", "Espacio de cementerio"];

export interface FiltersState {
  operaciones: Operacion[];
  tipoInmueble: TipoInmueble | null;
  ciudad: string;
}

const initialState: FiltersState = {
  operaciones: [],
  tipoInmueble: null,
  ciudad: "",
};

// ── 2. LÓGICA (El Hook integrado en el mismo archivo) ────────────────────────
function useFiltersLocal() {
  const [filters, setFilters] = useState<FiltersState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleOperacion = useCallback((op: Operacion) => {
    setFilters((prev) => ({
      ...prev,
      operaciones: prev.operaciones.includes(op)
        ? prev.operaciones.filter((o) => o !== op)
        : [...prev.operaciones, op],
    }));
  }, []);

  const removeOperacion = useCallback((op: Operacion) => {
    setFilters((prev) => ({
      ...prev,
      operaciones: prev.operaciones.filter((o) => o !== op),
    }));
  }, []);

  const setTipoInmueble = useCallback((tipo: TipoInmueble | null) => {
    setFilters((prev) => ({ ...prev, tipoInmueble: tipo }));
  }, []);

  const setCiudad = useCallback((ciudad: string) => {
    setFilters((prev) => ({ ...prev, ciudad }));
    if (error) setError(null);
  }, [error]);

  const clearFilters = useCallback(() => {
    setFilters(initialState);
    setError(null);
  }, []);

  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simula carga
      const params = new URLSearchParams();
      if (filters.operaciones.length > 0) params.set("operaciones", filters.operaciones.join(","));
      if (filters.tipoInmueble) params.set("tipo", filters.tipoInmueble);
      if (filters.ciudad.trim()) params.set("ciudad", filters.ciudad.trim());
      return params.toString();
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  return {
    filters,
    isLoading,
    error,
    toggleOperacion,
    removeOperacion,
    setTipoInmueble,
    setCiudad,
    clearFilters,
    handleSearch,
  };
}

// ── 3. SUB-COMPONENTES VISUALES ──────────────────────────────────────────────
function useClickOutside(ref: React.RefObject<HTMLElement>, onClose: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#F4EFE6] border border-[#C4BAA8] text-[#1F3A4D]">
      {label}
      <button type="button" onClick={onRemove} aria-label={`Quitar ${label}`} className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[#1F3A4D]/60 hover:bg-[#1F3A4D] hover:text-white transition-colors">
        ✕
      </button>
    </span>
  );
}

// Definimos los tipos exactos que recibe el Dropdown
interface DropdownProps {
    label: string;
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    children: React.ReactNode;
  }
  
  function Dropdown({ label, isOpen, onToggle, onClose, children }: DropdownProps) {
    const ref = useRef<HTMLDivElement>(null!);
    useClickOutside(ref, onClose);
    
    return (
      // ... el resto del código del Dropdown sigue exactamente igual ...
      <div ref={ref} className="relative">
        <button type="button" onClick={onToggle} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${isOpen ? "bg-[#F4EFE6] text-[#1F3A4D] border-[#C4BAA8] shadow-sm" : "bg-[#1F3A4D] text-[#F4EFE6] border-[#1F3A4D] hover:bg-[#162d3d]"}`}>
          {label}
          <svg className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute top-[calc(100%+8px)] left-0 z-50 min-w-[210px] bg-[#F4EFE6] rounded-xl border border-[#C4BAA8] shadow-lg overflow-hidden">
            {children}
          </div>
        )}
      </div>
    );
  }

// ── 4. COMPONENTE PRINCIPAL (La interfaz) ────────────────────────────────────
export default function FilterPanel() {
  const router = useRouter();
  const {
    filters, isLoading, error, toggleOperacion, removeOperacion,
    setTipoInmueble, setCiudad, clearFilters, handleSearch,
  } = useFiltersLocal();

  const [openDropdown, setOpenDropdown] = useState<"operacion" | "tipo" | null>(null);
  const close = () => setOpenDropdown(null);
  const toggle = (name: "operacion" | "tipo") => setOpenDropdown((prev) => (prev === name ? null : name));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") doSearch();
  };

  const doSearch = async () => {
    const query = await handleSearch();
    if (query !== undefined) router.push(`/busqueda?${query}`);
  };

  return (
    <section aria-label="Filtros de búsqueda" className="w-full space-y-3">
      {/* Barra principal de filtros */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#E7E1D7] border border-[#C4BAA8] shadow-[0_4px_20px_rgba(31,58,77,0.12)]">
        <Dropdown label={filters.operaciones.length > 0 ? `Operación (${filters.operaciones.length})` : "Seleccionar Operación"} isOpen={openDropdown === "operacion"} onToggle={() => toggle("operacion")} onClose={close}>
          {OPERACIONES.map((op) => {
            const selected = filters.operaciones.includes(op);
            return (
              <button key={op} type="button" onClick={() => toggleOperacion(op)} className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left ${selected ? "bg-[#E7E1D7] text-[#1F3A4D] font-medium" : "text-[#2E2E2E] hover:bg-[#E7E1D7]/60"}`}>
                {op}
                <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ml-6 ${selected ? "bg-[#1F3A4D] border-[#1F3A4D]" : "border-[#A89F92] bg-[#F4EFE6]"}`} />
              </button>
            );
          })}
        </Dropdown>

        <div className="w-px h-5 bg-[#C4BAA8] flex-shrink-0" />

        <Dropdown label={filters.tipoInmueble ?? "Seleccionar Inmueble"} isOpen={openDropdown === "tipo"} onToggle={() => toggle("tipo")} onClose={close}>
          {TIPOS_INMUEBLE.map((tipo) => {
            const selected = filters.tipoInmueble === tipo;
            return (
              <button key={tipo} type="button" onClick={() => { setTipoInmueble(selected ? null : tipo); close(); }} className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left ${selected ? "bg-[#E7E1D7] text-[#1F3A4D] font-medium" : "text-[#2E2E2E] hover:bg-[#E7E1D7]/60"}`}>
                {tipo}
                {selected && <svg className="w-3.5 h-3.5 text-[#1F3A4D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
              </button>
            );
          })}
        </Dropdown>

        <div className="w-px h-5 bg-[#C4BAA8] flex-shrink-0" />

        <input type="text" value={filters.ciudad} onChange={(e) => setCiudad(e.target.value)} onKeyDown={handleKeyDown} placeholder="Search..." maxLength={30} className="flex-1 min-w-0 bg-transparent text-[#2E2E2E] placeholder:text-[#A89F92] text-sm focus:outline-none px-2 py-1" />

        <button type="button" onClick={doSearch} disabled={isLoading} className="flex-shrink-0 w-8 h-8 rounded-full bg-[#C26E5A] hover:bg-[#b05f4c] active:scale-95 flex items-center justify-center transition-all disabled:opacity-50">
          {isLoading ? (
            <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
          ) : (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" /></svg>
          )}
        </button>
      </div>

      {/* Fila secundaria: Chips y botones */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex flex-wrap gap-2">
          {filters.operaciones.map((op) => <Chip key={op} label={op} onRemove={() => removeOperacion(op)} />)}
          {filters.tipoInmueble && <Chip label={filters.tipoInmueble} onRemove={() => setTipoInmueble(null)} />}
        </div>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={clearFilters} className="rounded-lg text-xs border-[#C4BAA8] text-[#2E2E2E] hover:bg-[#E7E1D7]">Limpiar</Button>
          <Button size="sm" onClick={() => router.push("/busqueda?avanzado=true")} className="rounded-lg text-xs bg-[#1F3A4D] text-white hover:bg-[#162d3d]">Avanzado</Button>
        </div>
      </div>
      {error && <p className="text-xs text-[#C26E5A] px-1">{error}</p>}
    </section>
  );
}