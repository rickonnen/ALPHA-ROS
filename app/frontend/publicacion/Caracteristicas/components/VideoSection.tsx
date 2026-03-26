"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link2Icon } from "lucide-react"
import { useState, ChangeEvent } from "react"

export function VideoSection() {
    const [url, setUrl] = useState("")
    const [videoId, setVideoId] = useState<string | null>(null)

const extractYoutubeId = (url: string) => {
    if (!url) return null;

    // 1. Intentar extraer el ID de 11 caracteres usando una Regex universal
    // Esta busca el ID después de v=, embed/, shorts/, live/, o el formato corto
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[7].length === 11) {
        return match[7];
    }

    // 2. Lógica adicional para URLs de Shorts y Live (formatos: /shorts/ID o /live/ID)
    const patterns = [
        /\/shorts\/([a-zA-Z0-9_-]{11})/,
        /\/live\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
        const result = url.match(pattern);
        if (result && result[1]) return result[1];
    }

    return null;
}

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newUrl = e.target.value
        setUrl(newUrl)
        
        const id = extractYoutubeId(newUrl)
        setVideoId(id)
    }

    return (
        <div className="flex flex-col gap-4" style={{ fontFamily: 'var(--font-geist-sans)' }}>
            <Label htmlFor="video">
                <h2 className="text-lg font-bold">
                    URL o REEL (Vista previa de la Propiedad)
                </h2>
            </Label>
            
            <div className="relative flex items-center gap-2">
                <Input 
                    id="video"
                    placeholder="Pega el link de YouTube aquí..." 
                    value={url}
                    onChange={handleInputChange}
                    // Si hay texto pero no hay ID válido, pintamos el borde de rojo
                    className={url && !videoId ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                <Link2Icon className="text-muted-foreground ml-2" />
            </div>

            {/* Mensaje de error solo si el usuario escribió algo que no es válido */}
            {url && !videoId && (
                <p className="text-sm text-red-500">
                    Por favor, introduce una URL válida de YouTube.
                </p>
            )}

            {/* VISTA PREVIA DIRECTA */}
            {videoId && (
                <div className="mt-2 w-full overflow-hidden rounded-xl border border-border bg-black shadow-sm aspect-video">
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                </div>
            )}
        </div>
    )
}