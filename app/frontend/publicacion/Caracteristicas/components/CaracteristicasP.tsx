"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Caracteristica {
  id: number;
  titulo: string;
  descripcion?: string;
}

const MAX_EXTRAS = 4;

export default function CaracteristicasExtras() {
  const [caracteristicas, setCaracteristicas] = useState<Caracteristica[]>([]);
  const [nextId, setNextId] = useState(1);

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    showForm: false,
  });

  const [editandoId, setEditandoId] = useState<number | null>(null);

  const limiteAlcanzado = caracteristicas.length >= MAX_EXTRAS;

  // 👉 SOLO aquí se limpia el form
  const handleAbrirFormulario = () => {
    if (limiteAlcanzado) return;

    setEditandoId(null);

    setFormData({
      titulo: "",
      descripcion: "",
      showForm: true,
    });
  };

  const handleGuardar = () => {
    const tituloTrim = formData.titulo.trim();
    if (!tituloTrim) return;

    if (editandoId !== null) {
      // ✏️ EDITAR
      setCaracteristicas((prev) =>
        prev.map((c) =>
          c.id === editandoId
            ? {
                ...c,
                titulo: tituloTrim,
                descripcion: formData.descripcion.trim() || undefined,
              }
            : c
        )
      );
    } else {
      // ➕ NUEVO
      if (limiteAlcanzado) return;

      const newId = nextId;

      setCaracteristicas((prev) => [
        ...prev,
        {
          id: newId,
          titulo: tituloTrim,
          descripcion: formData.descripcion.trim() || undefined,
        },
      ]);

      setNextId((n) => n + 1);
    }

    // ❌ NO se limpia ni se cierra el form
  };

  const handleAbrirEdicion = (c: Caracteristica) => {
    setEditandoId(c.id);

    setFormData({
      titulo: c.titulo,
      descripcion: c.descripcion || "",
      showForm: true,
    });
  };

  const handleEliminar = (id: number) => {
    setCaracteristicas((prev) => prev.filter((c) => c.id !== id));

    if (editandoId === id) {
      setEditandoId(null);
    }
  };

  return (
    <div className="w-full max-w-xl p-6 bg-[#f4efe6] border border-gray-200 rounded-xl font-sans space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-semibold text-gray-900">
            Características Extras
          </Label>
          <span className="text-[#e35336] text-xs font-medium">(Opcional)</span>
        </div>

        <span className="text-xs font-medium px-3 py-1 rounded-full border border-[#e35336] text-[#e35336]">
          {caracteristicas.length}/{MAX_EXTRAS}
        </span>
      </div>

      {/* + y Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {!limiteAlcanzado && (
          <Button
            type="button"
            onClick={handleAbrirFormulario}
            className="flex items-center justify-center w-10 h-10 p-0 bg-transparent border border-[#e35336] text-[#e35336] hover:bg-[#e35336]/10"
          >
            <Plus size={18} />
          </Button>
        )}

        {caracteristicas.map((c) => (
          <span
            key={c.id}
            onClick={() => handleAbrirEdicion(c)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e35336]/10 border border-[#e35336] text-[#e35336] text-xs font-medium cursor-pointer hover:bg-[#e35336]/20 transition-colors"
          >
            {c.titulo}

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEliminar(c.id);
              }}
              className="ml-1 hover:text-red-700"
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>

      {/* FORMULARIO */}
      {formData.showForm && (
        <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-[#e35336]" />
            <Label className="text-sm font-medium text-gray-700">
              ¿Qué título de característica desea colocar?
            </Label>
          </div>

          <Input
            value={formData.titulo}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, titulo: e.target.value }))
            }
            onKeyDown={(e) => e.key === "Enter" && handleGuardar()}
            placeholder="Ej. Piscina"
            autoFocus
            className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-[#e35336]"
          />

          <Label className="text-sm font-medium text-gray-700">
            Ingrese una descripción de la característica
          </Label>

          <Input
            value={formData.descripcion}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, descripcion: e.target.value }))
            }
            onKeyDown={(e) => e.key === "Enter" && handleGuardar()}
            placeholder="Ej. Piscina climatizada..."
            className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-[#e35336]"
          />

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              onClick={handleGuardar}
              className="bg-[#e35336] hover:bg-[#e35336]/90 text-white"
            >
              {editandoId !== null ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}