'use client'
import { useState, useEffect, useRef } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'


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

export function FilterTipoInmueble({ selected, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [tipos, setTipos] = useState<TipoInmueble[]>(MOCK_TIPOS)

  // Cuando tengas el endpoint listo, descomenta esto y borra MOCK_TIPOS:
  // useEffect(() => {
  //   fetch('/api/filter_search_page/tipos-inmueble')
  //     .then((r) => r.json())
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

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
              setOpen(false)
          }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
          document.removeEventListener('mousedown', handleClickOutside)
      }
  }, [])

  return (
    <div className="relative w-full " ref={dropdownRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex w-full items-center justify-between',
          'rounded-md border border-input bg-background',
          'px-3 py-2 text-sm text-foreground',
          'hover:bg-accent transition-colors'
        )}
      >
        <span className="truncate">{labelTruncated}</span>
        <ChevronDown
          className={cn(
            'ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150  ',
            open && 'rotate-180'
          )}
        />
      </button>

      {/* Lista desplegable */}
      {open && (
        <div
          className={cn(
            'absolute z-10 mt-1 w-full',
            'rounded-md border border-input bg-background shadow-sm'
          )}
        >
          {tipos.map((tipo) => {
            const id = `tipo-inmueble-${tipo.id_tipo_inmueble}`
            const isChecked = selected.includes(tipo.id_tipo_inmueble)

            return (
              <label 
                key={tipo.id_tipo_inmueble}
                htmlFor={id}
                className={cn(
                  'flex items-center gap-3 px-3 py-2',
                  'border-b border-input last:border-b-0',
                  'cursor-pointer hover:bg-accent transition-colors',
                  'text-left'
                )}
              >
                <Checkbox
                  id={id}
                  checked={isChecked}
                  onCheckedChange={() => toggle(tipo.id_tipo_inmueble)}
                />
                <span className="text-sm select-none flex-1">{tipo.nombre_inmueble}</span>
              </label> 
            )
          })}
        </div>
      )}
    </div>
  )
}