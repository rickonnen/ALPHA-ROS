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
    <div className="w-full md:max-w-[300px] p-4">
      {/* Label superior en gris */}
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
        ORDENAMIENTO
      </p>

      <Select onOpenChange={setIsOpen}>
        {/* 1. 'justify-center' centra el texto "Ordenamiento" perfectamente.
          2. '[&>svg]:hidden' MATA la flecha que Shadcn pone por defecto.
        */}
        <SelectTrigger 
          className="relative w-full h-12 bg-[#D1D5DB] border-none rounded-lg flex items-center justify-center text-gray-800 focus:ring-0 focus:ring-offset-0 [&>svg]:hidden"
        >
          {/* El texto se queda en el centro total */}
          <SelectValue placeholder="Ordenamiento" />

          {/* TU ÚNICA FLECHA: 
              - 'absolute right-4' para que no empuje el texto y se quede a la derecha.
              - '!block' para que no se esconda con el comando anterior.
              - La lógica de rotación que me pediste.
          */}
          <ChevronDown 
            className={`absolute right-4 h-5 w-5 text-gray-900 transition-transform duration-300 !block ${
              isOpen ? "rotate-180" : "rotate-0"
            }`} 
          />
        </SelectTrigger>

        {/* position="popper" para que caiga hacia abajo y NO tape el botón */}
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