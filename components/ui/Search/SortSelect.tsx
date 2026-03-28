"use client"

import * as React from "react"
import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronDown } from "lucide-react"

export function SortSelect() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    // Mantenemos tu contenedor exacto
    <div className="w-full md:max-w-[300px] p-4">
      {/* Label superior en gris exacto */}
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
        ORDENAMIENTO
      </p>

      <Select onOpenChange={setIsOpen}>
        <SelectTrigger 
          // Mantenemos todas tus clases de estilo exactas
          className="relative w-full h-12 bg-[#D1D5DB] border-none rounded-lg flex items-center justify-center text-gray-800 focus:ring-0 focus:ring-offset-0 [&>svg]:hidden"
        >
          {/* AQUÍ ESTÁ EL ARREGLO PRINCIPAL: 
              Encapsulamos el SelectValue en un contenedor 
              con padding derecho (pr-10) para proteger el texto.
              Esto asegura que 'justify-center' centre el texto, 
              pero que el texto se corte (aplique truncate) ANTES de chocar con la flecha absoluta.
          */}
          <span className="block truncate text-center pr-10">
            <SelectValue placeholder="Ordenamiento" />
          </span>

          {/* TU ÚNICA FLECHA ABSOLUTA EXACTA */}
          <ChevronDown 
            className={`absolute right-4 h-5 w-5 text-gray-900 transition-transform duration-300 !block ${
              isOpen ? "rotate-180" : "rotate-0"
            }`} 
            aria-hidden="true"
          />
        </SelectTrigger>

        {/* position="popper" para que caiga hacia abajo y NO tape el botón exacto */}
        <SelectContent 
          position="popper" 
          sideOffset={4}
          className="w-[var(--radix-select-trigger-width)] bg-[#E5E7EB] rounded-lg shadow-xl border-none"
        >
          <SelectItem value="precio-asc" className="focus:bg-gray-300 cursor-pointer">Precio (asc)</SelectItem>
          <SelectItem value="precio-des" className="focus:bg-gray-300 cursor-pointer">Precio (des)</SelectItem>
          <SelectItem value="fecha-reciente" className="focus:bg-gray-300 cursor-pointer">Fecha de publicación (mas reciente)</SelectItem>
          <SelectItem value="fecha-antigua" className="focus:bg-gray-300 cursor-pointer">Fecha de publicacion (mas antigua)</SelectItem>
          <SelectItem value="m2-mayor" className="focus:bg-gray-300 cursor-pointer">Superficie m2 (mayor a menor)</SelectItem>
          <SelectItem value="m2-menor" className="focus:bg-gray-300 cursor-pointer">Superficie m2 (menor a mayor)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}