"use client"

/**
 * @Dev: StefanyS, AndresC
 * @Fecha: 28/03/2026
 * @Funcionalidad: Componente de sección de video para el formulario de publicación de inmueble.
 * Permite al usuario ingresar una URL de YouTube o Instagram Reel y muestra una vista previa.
 * @param {VideoSectionProps} onURLChange - Callback que notifica al componente padre la URL válida ingresada.
 * @param {VideoSectionProps} defaultUrl - URL inicial para restaurar el valor guardado en sessionStorage.
 * @return {JSX.Element} Sección con input de URL y vista previa del video.
 */

import { Input }                        from "@/components/ui/input"
import { Label }                        from "@/components/ui/label"
import { Link2Icon }                    from "lucide-react"
import { useState, ChangeEvent, useEffect } from "react"

// PascalCase para tipos e interfaces - Estándar Alpha-Ros
type PreviewData = {
  platform: 'youtube' | 'instagram' | null;
  id: string | null;
};

interface VideoSectionProps {
  onURLChange: (url: string) => void;
  defaultUrl?: string;
}

export function VideoSection({ onURLChange, defaultUrl = "" }: VideoSectionProps) {

  /**
   * @Dev: StefanyS
   * @Fecha: 28/03/2026
   * @Funcionalidad: Extrae el ID de un video de YouTube desde distintos formatos de URL.
   * @param {string} strInputUrl - URL ingresada por el usuario.
   * @return {string | null} ID del video si la URL es válida, null si no lo es.
   */
  const extractYoutubeId = (strInputUrl: string) => {
    if (!strInputUrl) return null;
    const strCleanUrl = strInputUrl.trim();
    // Regex principal: cubre formatos watch, embed y el formato corto youtu.be
    const regExpMain = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})(?:[&?].*)?$/;
    const match = strCleanUrl.match(regExpMain);
    if (match && match[1]) return match[1];
    // Patrones adicionales para Shorts y En vivo (Live)
    const arrPatterns = [
      /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([\w-]{11})(?:[&?].*)?$/,
      /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([\w-]{11})(?:[&?].*)?$/
    ];
    for (const pattern of arrPatterns) {
      const result = strCleanUrl.match(pattern);
      if (result && result[1]) return result[1];
    }
    return null;
  }

  /**
   * @Dev: AndresC
   * @Fecha: 28/03/2026
   * @Funcionalidad: Extrae el ID de un Reel o post de Instagram desde la URL.
   * @param {string} strInputUrl - URL ingresada por el usuario.
   * @return {string | null} ID del reel si la URL es válida, null si no lo es.
   */
  const extractInstagramId = (strInputUrl: string) => {
    if (!strInputUrl) return null;
    const strCleanUrl = strInputUrl.trim();
    // Regex estricto para Reels y Posts de Instagram
    const regExp = /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)(?:[\/?].*)?$/;
    const match = strCleanUrl.match(regExp);
    if (match && match[1]) return match[1];
    return null;
  }

  /**
   * @Funcionalidad: Calcula el preview a partir de una URL para restaurar la vista previa
   * cuando el usuario vuelve a esta sección desde sessionStorage.
   * @param {string} strDefault - URL guardada en sessionStorage.
   * @return {PreviewData} Objeto con plataforma e ID del video, o null si no hay URL válida.
   */
  const getInitialPreview = (strDefault: string): PreviewData => {
    if (!strDefault) return { platform: null, id: null };
    const strYtId = extractYoutubeId(strDefault);
    if (strYtId) return { platform: 'youtube', id: strYtId };
    const strIgId = extractInstagramId(strDefault);
    if (strIgId) return { platform: 'instagram', id: strIgId };
    return { platform: null, id: null };
  }

  // Iniciar vacío para evitar hydration error — se restaura en el useEffect
  const [strUrl, setStrUrl]         = useState("")
  const [objPreview, setObjPreview] = useState<PreviewData>({ platform: null, id: null })

  // Restaurar URL y vista previa desde defaultUrl tras el montaje en cliente
  // Evita hydration error al no usar sessionStorage en el servidor
  useEffect(() => {
    if (defaultUrl) {
      setStrUrl(defaultUrl)
      setObjPreview(getInitialPreview(defaultUrl))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultUrl])

  /**
   * @Dev: StefanyS
   * @Fecha: 28/03/2026
   * @Funcionalidad: Maneja el cambio en el input de URL, valida la plataforma y actualiza la vista previa.
   * @param {ChangeEvent<HTMLInputElement>} e - Evento de cambio del input.
   * @return {void}
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const strNewUrl = e.target.value
    setStrUrl(strNewUrl)
    // Verificar YouTube primero
    const strYtId = extractYoutubeId(strNewUrl);
    if (strYtId) {
      setObjPreview({ platform: 'youtube', id: strYtId })
      onURLChange(strNewUrl);
      return;
    }
    // Verificar Instagram si no es link de YouTube
    const strIgId = extractInstagramId(strNewUrl);
    if (strIgId) {
      setObjPreview({ platform: 'instagram', id: strIgId });
      onURLChange(strNewUrl);
      return;
    }
    // La URL no es válida: reiniciar vista previa y notificar al padre
    setObjPreview({ platform: null, id: null });
    onURLChange("");
  }

  return (
    /**
     * @Dev: AndresC
     * @Fecha: 28/03/2026
     * @Funcionalidad: Renderiza el label e input vacío base del componente (Shadcn UI).
     */
    <div className="flex flex-col gap-4" style={{ fontFamily: 'var(--font-geist-sans)' }}>
      <Label htmlFor="video" className="text-sm font-medium text-[#2E2E2E]">
        URL o Reel (Vista previa de la propiedad)
      </Label>

      <div className="relative flex items-center gap-2">
        <Input
          id="video"
          placeholder="Pega el link de youtube o instagram aquí..."
          value={strUrl}
          onChange={handleInputChange}
          className={strUrl && !objPreview.id ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
        <Link2Icon className="text-muted-foreground ml-2" />
      </div>

      {/* Mostrar error solo cuando hay entrada pero no hay una vista previa válida */}
      {strUrl && !objPreview.id && (
        <p className="text-sm text-red-500">
          Por favor, introduce una URL válida de YouTube o Instagram (Reel/Post).
        </p>
      )}

      {objPreview.id && (
        <div className="flex justify-center mt-2">
          {/* YouTube: ancho completo, relación de aspecto 16:9 */}
          {objPreview.platform === 'youtube' && (
            <div className="w-full overflow-hidden rounded-xl border border-border shadow-md bg-black aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${objPreview.id}`}
                title="YouTube video player"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          )}
          {/* Instagram: ancho compacto fijo, centrado */}
          {objPreview.platform === 'instagram' && (
            <div className="w-[320px] overflow-hidden rounded-xl border border-border shadow-md bg-white aspect-4/5">
              <iframe
                src={`https://www.instagram.com/p/${objPreview.id}/embed`}
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