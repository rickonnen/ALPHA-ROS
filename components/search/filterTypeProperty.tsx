'use client'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Geist } from 'next/font/google'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export type TipoInmueble = {
  id_tipo_inmueble: number
  nombre_inmueble: string | null
}

type Props = {
  tipos: TipoInmueble[]
  selected: number[]
  onChange: (selected: number[]) => void
}

const geist = Geist({
  subsets: ['latin']
})

export function FilterTypeProperty({tipos, selected, onChange }: Props) {

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
    label.length > 30 ? label.slice(0, 20) + '..' : label

  return (  
    
    <div className="rounded-4xl bg-[#f0eeea] p-3 flex flex-col gap-2  ">
      
      <Accordion type="single" collapsible className="w-full flex flex-col gap-2 ">
      <AccordionItem value="tipo-inmueble" className="border-none flex flex-col gap-2 shadow-2xs">
          <AccordionTrigger className="
              bg-white rounded-2xl border border-[#e0d9cc]
              px-4 py-3 text-sm font-medium
              hover:no-underline hover:bg-gray-50 
              text-[#1f3a4d] 
            ">
            <div className={`${geist.className} flex w-full`}> 
              <span className="flex-1 truncate text-left ">{labelTruncated}</span> 
            </div>
          </AccordionTrigger>
        <AccordionContent className={`${geist.className} pb-0`}>
          <div className="bg-white rounded-2xl border-amber-900 p-2 shadow-sm">
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
                      'rounded-2xl ',
                      !isLast && 'border-[#f0ebe0]',
                      isChecked
                        ? 'rounded-2xl' // cuando se hace click mantiene el bg
                        : 'hover:bg-[#f9f7f3ca]'
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