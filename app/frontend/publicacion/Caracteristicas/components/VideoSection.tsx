"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link2Icon } from "lucide-react"
import { useState, ChangeEvent } from "react"

type PreviewData = {
  platform: 'youtube' | 'instagram' | null;
  id: string | null;
};

interface VideoSectionProps {
  onURLChange: (url: string) => void;
}

export function VideoSection({ onURLChange }: VideoSectionProps) {
  const [url, setUrl] = useState("")
  const [preview, setPreview] = useState<PreviewData>({ platform: null, id: null })

  const extractYoutubeId = (url: string) => {
    if (!url) return null;
    const cleanUrl = url.trim();

    const regExpMain = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})(?:[&?].*)?$/;
    const match = cleanUrl.match(regExpMain);
    if (match && match[1]) return match[1];

    const patterns = [
      /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([\w-]{11})(?:[&?].*)?$/,
      /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([\w-]{11})(?:[&?].*)?$/
    ];
    for (const pattern of patterns) {
      const result = cleanUrl.match(pattern);
      if (result && result[1]) return result[1];
    }
    return null;
  }

  const extractInstagramId = (url: string) => {
    if (!url) return null;
    const cleanUrl = url.trim();
    const regExp = /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)(?:[\/?].*)?$/;
    const match = cleanUrl.match(regExp);
    if (match && match[1]) return match[1];
    return null;
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setUrl(newUrl)

    const ytId = extractYoutubeId(newUrl);
    if (ytId) {
      setPreview({ platform: 'youtube', id: ytId })
      onURLChange(newUrl);
      return;
    }

    const igId = extractInstagramId(newUrl);
    if (igId) {
      setPreview({ platform: 'instagram', id: igId });
      onURLChange(newUrl);
      return;
    }

    setPreview({ platform: null, id: null });
    onURLChange("");
  }

  return (
    <div className="flex flex-col gap-4" style={{ fontFamily: 'var(--font-geist-sans)' }}>
      <Label htmlFor="video" className="text-sm font-medium text-[#2E2E2E]">
        URL o Reel (Vista previa de la propiedad)
      </Label>

      <div className="relative flex items-center gap-2">
        <Input
          id="video"
          placeholder="Pega el link de youtube o instagram aquí..."
          value={url}
          onChange={handleInputChange}
          className={url && !preview.id ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
        <Link2Icon className="text-muted-foreground ml-2" />
      </div>

      {url && !preview.id && (
        <p className="text-sm text-red-500">
          Por favor, introduce una URL válida de YouTube o Instagram (Reel/Post).
        </p>
      )}

      {preview.id && (
        <div className="flex justify-center mt-2">

          {/* YouTube: ocupa todo el ancho del contenedor padre, proporción 16:9 */}
          {preview.platform === 'youtube' && (
            <div className="w-full overflow-hidden rounded-xl border border-border shadow-md bg-black aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${preview.id}`}
                title="YouTube video player"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          )}

          {/* Instagram: ancho fijo compacto en todos los tamaños, centrado */}
          {preview.platform === 'instagram' && (
            <div className="w-[320px] overflow-hidden rounded-xl border border-border shadow-md bg-white aspect-4/5">
              <iframe
                src={`https://www.instagram.com/p/${preview.id}/embed`}
                title="Instagram Reel player"
                className="w-full h-full border-0"
                scrolling="no"
              ></iframe>
            </div>
          )}
        </div>
      )}
    </div>
  )
}