// app/mapas/components/PropertyCard.tsx
"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Location } from "@/lib/locations-placeholder-data"

interface PropertyCardProps {
  loc: Location
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
}

export default function PropertyCard({ loc, isHovered, onMouseEnter, onMouseLeave, onClick }: PropertyCardProps) {
  return (
    <Card
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={`p-4 transition-all cursor-pointer border-2 shadow-sm
        ${isHovered ? "border-blue-500 bg-blue-50/5" : "border-slate-100"}`}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
            {loc.zona}
          </div>
          <h3 className="text-xl font-medium text-slate-800 tracking-tight">{loc.direccion}</h3>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-blue-600 tracking-tighter">{loc.precio}</p>
          <Button variant="link" className="h-auto p-0 text-xs text-slate-400">Detalles</Button>
        </div>
      </div>
    </Card>
  )
}