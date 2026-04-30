/**
 * Dev: Gabriel Paredes
 * Date: 18/04/2026
 * Funcionalidad: Paso 6 — Video de la propiedad.
 * @param {VideoFormProps} props - onNext, onBack
 * @return {JSX.Element} Formulario de video
 */
'use client'

import { Label }                 from '@/components/ui/label'
import { Input }                 from '@/components/ui/input'
import { Link2Icon }             from 'lucide-react'
import { useState, ChangeEvent } from 'react'
import { useVideoForm }          from './usevideoform'

interface VideoFormProps {
  onNext: () => void
  onBack: () => void
}

type PreviewData = {
  platform: 'youtube' | 'instagram' | null
  id:       string | null
}

function extractYoutubeId(url: string): string | null {
  if (!url) return null
  const clean = url.trim()
  const main = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})(?:[&?].*)?$/
  const m = clean.match(main)
  if (m?.[1]) return m[1]
  for (const p of [
    /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([\w-]{11})(?:[&?].*)?$/,
    /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([\w-]{11})(?:[&?].*)?$/,
  ]) {
    const r = clean.match(p)
    if (r?.[1]) return r[1]
  }
  return null
}

function extractInstagramId(url: string): string | null {
  if (!url) return null
  const m = url.trim().match(/^(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)(?:[\/?].*)?$/)
  return m?.[1] ?? null
}

function buildPreview(url: string): PreviewData {
  if (!url) return { platform: null, id: null }
  const yt = extractYoutubeId(url)
  if (yt) return { platform: 'youtube', id: yt }
  const ig = extractInstagramId(url)
  if (ig) return { platform: 'instagram', id: ig }
  return { platform: null, id: null }
}

export function VideoForm({ onNext, onBack }: VideoFormProps) {
  const { values, handleURLChange } = useVideoForm()

  const [strUrl,     setStrUrl]     = useState<string>     (() => values.url ?? '')
  const [objPreview, setObjPreview] = useState<PreviewData>(() => buildPreview(values.url ?? ''))

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setStrUrl(val)
    const preview = buildPreview(val)
    setObjPreview(preview)
    handleURLChange(preview.id ? val : '')
  }

  const hasValidPreview = !!objPreview.id

  return (
    <div className="flex flex-col gap-3 h-full">

      {/* Label */}
      <Label htmlFor="video-url" className="text-sm font-semibold text-[#1F3A4D] flex-shrink-0">
        Pega el enlace de video de Youtube o REEL(Instagram) de tu propiedad
      </Label>

      {/* Input URL */}
      <div className="relative flex items-center w-full flex-shrink-0">
        <Input
          id="video-url"
          placeholder="Introduce un enlace de YouTube o Instagram Reel..."
          value={strUrl}
          onChange={handleInputChange}
          className={`pr-10 bg-white text-sm ${
            strUrl && !hasValidPreview ? 'border-red-400 focus-visible:ring-red-400' : ''
          }`}
        />
        <Link2Icon className="absolute right-3 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>

      {/* Error */}
      {strUrl && !hasValidPreview && (
        <p className="text-xs font-medium text-red-500 flex-shrink-0">
          Introduce una URL válida de YouTube o Instagram (Reel/Post).
        </p>
      )}

      {/* Marco — ocupa todo el espacio restante */}
      <div className="flex-1 min-h-0">

        {/* Placeholder */}
        {!hasValidPreview && (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed"
            style={{ borderColor: '#D4B8AE', backgroundColor: '#EDE8E0' }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: '56px', height: '56px', backgroundColor: '#D4B8AE' }}
            >
              <svg viewBox="0 0 24 24" fill="none" style={{ width: '28px', height: '28px' }}>
                <circle cx="12" cy="12" r="10" fill="#C26E5A" opacity="0.25" />
                <polygon points="10,8 18,12 10,16" fill="#C26E5A" />
              </svg>
            </div>
            <div className="text-center px-4">
              <p className="text-sm font-semibold" style={{ color: '#1F3A4D' }}>
                Aquí se visualizará tu video
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#9E8E84' }}>
                Introduce un enlace de YouTube o Instagram Reel
              </p>
            </div>
          </div>
        )}

        {/* Embed YouTube — llena todo el marco */}
        {hasValidPreview && objPreview.platform === 'youtube' && (
          <div
            className="w-full h-full overflow-hidden rounded-xl"
            style={{ border: '2px solid #D4B8AE', backgroundColor: '#000' }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${objPreview.id}`}
              title="YouTube video player"
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}

        {/* Embed Instagram — escalado para caber en el marco fijo */}
        {hasValidPreview && objPreview.platform === 'instagram' && (
          <div
            className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl"
          >
        
            <div style={{ overflow: 'hidden', width: '154px', height: '278px' }}>
              <iframe
                src={`https://www.instagram.com/p/${objPreview.id}/embed`}
                title="Instagram Reel player"
                width="320"
                height="580"
                style={{
                  border:          'none',
                  display:         'block',
                  transformOrigin: 'top left',
                  transform:       'scale(0.48)',
                  pointerEvents:   'auto',
                }}
                scrolling="no"
                allowFullScreen
              />
            </div>
          </div>
        )}

      </div>

      {/* Nota opcional */}
      {!strUrl && (
        <p className="text-xs text-gray-400 flex-shrink-0">
          Puedes dejar este campo en blanco si aún no tienes un video.
        </p>
      )}

    </div>
  )
}