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

export function FilterTypeProperty({ tipos, selected, onChange }: Props) {
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
    <div className="w-full mt-3">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="tipo-inmueble" className="border-none">
          <div className="overflow-hidden rounded-[16px] border border-[#B9B1A5] bg-[#E7E3DD] shadow-sm">
            <AccordionTrigger
              className={cn(
                "w-full px-4 py-3 text-left text-sm font-normal text-[#2E2E2E] hover:no-underline",
                "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 [&>svg]:text-[#4B4B4B]"
              )}
            >
              <div className={`${geist.className} flex w-full`}>
                <span className="flex-1 truncate text-left">
                  {labelTruncated}
                </span>
              </div>
            </AccordionTrigger>
          </div>

          <AccordionContent className={`${geist.className} pt-3 pb-0`}>
            <div className="w-full rounded-[16px] border border-[#C8C0B5] bg-white p-3 shadow-sm">
              <div className="space-y-2">
                {tipos.map((tipo) => {
                  const id = `tipo-inmueble-${tipo.id_tipo_inmueble}`
                  const isChecked = selected.includes(tipo.id_tipo_inmueble)

                  return (
                    <Label
                      key={tipo.id_tipo_inmueble}
                      htmlFor={id}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-[12px] px-4 py-3 text-left text-sm text-[#2E2E2E] transition cursor-pointer font-normal",
                        isChecked
                          ? "bg-[#E7E3DD]"
                          : "bg-transparent hover:bg-[#F4EFE6]"
                      )}
                    >
                      <Checkbox
                        id={id}
                        checked={isChecked}
                        onCheckedChange={() => toggle(tipo.id_tipo_inmueble)}
                        className={cn(
                          "h-[18px] w-[18px] rounded-full border border-[#8A847C] data-[state=checked]:border-[#1F3A4D] data-[state=checked]:bg-[#1F3A4D]",
                          "[&_svg]:text-white"
                        )}
                      />
                      <span className="select-none text-sm text-[#2E2E2E]">
                        {tipo.nombre_inmueble}
                      </span>
                    </Label>
                  )
                })}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}