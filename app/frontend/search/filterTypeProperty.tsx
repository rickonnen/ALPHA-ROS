'use client'
import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type TipoInmueble = {
  id_tipo_inmueble: number
  nombre_inmueble: string | null
}

type Props = {
  selected: number[]
  onChange: (selected: number[]) => void
}

const MOCK_TIPOS: TipoInmueble[] = [
  { id_tipo_inmueble: 1, nombre_inmueble: 'Casa' },
  { id_tipo_inmueble: 2, nombre_inmueble: 'Departamento' },
  { id_tipo_inmueble: 3, nombre_inmueble: 'Cuarto' },
  { id_tipo_inmueble: 4, nombre_inmueble: 'Lote o Terreno' },
  { id_tipo_inmueble: 5, nombre_inmueble: 'Terreno Mortuorio' },
]

export function FilterTipoInmueble2({ selected, onChange }: Props) {

  const [tipos, setTipos] = useState<TipoInmueble[]>(MOCK_TIPOS)
  
  // useEffect(()=> {
  //   fetch('api/filter_search_page/tipos-inmueble')
  //     .then((r)=> r.json())
  //     .then(setTipos)
  // }, [])

  const toggle = (id: number) => {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id]
    )
  }
  const label =
    selected.length === 0
      ? 'Tipo Inmueble'
      : tipos
          .filter((t) => selected.includes(t.id_tipo_inmueble))
          .map((t) => t.nombre_inmueble)
          .join(', ')

  const labelTruncated =
    label.length > 30 ? label.slice(0, 30) + '..' : label

  return (  
    <div className="rounded-xl bg-[#f0ebe0] p-3 flex flex-col gap-2">

      <Accordion type="single" collapsible className="w-full flex flex-col gap-2">
      <AccordionItem value="tipo-inmueble" className="border-none flex flex-col gap-2 ">
        
          <AccordionTrigger className="
              bg-white rounded-2xl border border-[#e0d9cc]
              px-4 py-3 text-sm font-normal text-foreground
              hover:no-underline hover:bg-gray-50 
            ">
            
            <span className="truncate text-left">{labelTruncated}</span>
            
          </AccordionTrigger>
        
        <AccordionContent className="pb-0">
          <div className="bg-white rounded-2xl border p-5 shadow-sm">
            {tipos.map((tipo, index) => {
              const id = `tipo-inmueble-${tipo.id_tipo_inmueble}`
              const isChecked = selected.includes(tipo.id_tipo_inmueble)
              const isLast = index === tipos.length - 1 
              return (             
                <Label 
                  key={tipo.id_tipo_inmueble}
                  htmlFor={id}
                  className={cn(
                      'flex items-center gap-3 px-4 py-3',
                      'cursor-pointer transition-colors font-normal',
                      'rounded-2xl',
                      !isLast && 'border-[#f0ebe0]',
                      isChecked
                        ? 'bg-[#f5f1ea] rounded-2xl'
                        : 'hover:bg-[#f9f7f3]'
                    )}
                >
                  <Checkbox
                  id={id}
                  checked={isChecked}
                  onCheckedChange={() => toggle(tipo.id_tipo_inmueble)}
                  className={cn(
                        'h-5 w-5 border-[#b0a898]',
                        'rounded-full',
                        // sobreescribe el rounded del span interno de shadcn
                        '[&_button]:rounded-full',
                        'data-[state=checked]:bg-[#1e3a4f]',
                        'data-[state=checked]:border-[#1e3a4f]',
                      )}
                  />
                  <span className="text-sm text-foreground select-none">{tipo.nombre_inmueble}</span>
                </Label>
              )
            })}    
          </div>
        </AccordionContent>
      </AccordionItem>
     </Accordion>
    </div>
    
  
  )
}