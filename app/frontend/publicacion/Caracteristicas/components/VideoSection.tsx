"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link2Icon } from "lucide-react"

export function VideoSection() {
    return (
        /* Aplicamos la fuente aquí al div principal */
        <div className="flex flex-col gap-4" style={{ fontFamily: 'var(--font-geist-sans)' }}>

            <Label htmlFor="video">
                <h2 className="text-lg font-bold">
                    URL o REEL (Vista previa de la Propiedad)
                </h2>
            </Label>
            
            <div className="flex items-center gap-2">
                <Input id="video" placeholder="URL del video" />
                <Link2Icon className="text-muted-foreground" />
            </div>
        </div>
    )
}