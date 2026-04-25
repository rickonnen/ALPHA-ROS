'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Paso1Data = {
  titulo?: string
  precio?: string
  tipoPropiedad?: string
  tipoOperacion?: string
  descripcion?: string
}

type Paso2Data = {
  direccion?: string
  superficie?: string
  departamento?: string
  ciudad?: string
  zona?: string
  habitaciones?: string
  banios?: string
  plantas?: string
  garajes?: string
  caracteristicasPersonalizadas?: string[]
}

type SumarioStorageData = {
  paso1: Paso1Data
  paso2: Paso2Data
  imagenesPreview: string[]
  imagenesNombres: string[]
  videoUrl: string
  caracteristicasCustom: string[]
}

interface SumarioModalProps {
  onClose: () => void
  onGoPaso1: () => void
  onGoPaso2: () => void
}

const SUMARIO_TITULO = 'Resumen de Publicación'
const SUMARIO_DESCRIPCION = 'Revisa la información de tu inmueble antes de guardarlo'

const DEPARTAMENTOS_LABELS: Record<string, string> = {
  beni: 'Beni',
  chuquisaca: 'Chuquisaca',
  cochabamba: 'Cochabamba',
  la_paz: 'La Paz',
  oruro: 'Oruro',
  pando: 'Pando',
  potosi: 'Potosi',
  santa_cruz: 'Santa Cruz',
  tarija: 'Tarija',
}

function parseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function getInitialStorageData(): SumarioStorageData {
  if (typeof window === 'undefined') {
    return {
      paso1: {},
      paso2: {},
      imagenesPreview: [],
      imagenesNombres: [],
      videoUrl: '',
      caracteristicasCustom: [],
    }
  }

  const dataPaso1 = parseJSON<Paso1Data>(sessionStorage.getItem('informacionComercial'), {})
  const dataPaso2 = parseJSON<Paso2Data>(sessionStorage.getItem('caracteristicasInmueble'), {})

  const arrPreview = parseJSON<string[]>(sessionStorage.getItem('caracteristicasImagenesPreview'), [])
    .filter((item) => typeof item === 'string' && item.trim().length > 0)

  const arrNombres = parseJSON<string[]>(sessionStorage.getItem('caracteristicasImagenesNombres'), [])
    .filter((item) => typeof item === 'string' && item.trim().length > 0)

  const strVideo = sessionStorage.getItem('videoUrl') ?? ''

  const customFromPaso2 = Array.isArray(dataPaso2.caracteristicasPersonalizadas)
    ? dataPaso2.caracteristicasPersonalizadas
    : []

  const customFromSession = parseJSON<string[]>(sessionStorage.getItem('caracteristicasPersonalizadas'), [])
  const mergedCustom = [...customFromPaso2, ...customFromSession]
    .map((item) => String(item).trim())
    .filter(Boolean)

  return {
    paso1: dataPaso1,
    paso2: dataPaso2,
    imagenesPreview: arrPreview,
    imagenesNombres: arrNombres,
    videoUrl: strVideo,
    caracteristicasCustom: Array.from(new Set(mergedCustom)),
  }
}

function toText(value: unknown, fallback = 'No especificado'): string {
  if (value === null || value === undefined) return fallback
  const strValue = String(value).trim()
  return strValue.length > 0 ? strValue : fallback
}

function formatPrice(value: unknown): string {
  const strValue = String(value ?? '').trim()
  if (!strValue) return 'No especificado'
  const normalized = strValue.replace(/\./g, '').replace(',', '.')
  const numValue = Number(normalized)
  if (!Number.isFinite(numValue)) return strValue
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numValue)
}

function formatSurface(value: unknown): string {
  const strValue = String(value ?? '').trim()
  if (!strValue) return 'No especificado'
  return `${strValue} m2`
}

function toTitleCase(value: string): string {
  if (!value) return 'No especificado'
  return value
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase())
    .join(' ')
}

function normalizeValue(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function getVideoEmbedUrl(videoUrl: string): string | null {
  const strUrl = videoUrl.trim()
  if (!strUrl) return null

  const ytMatch = strUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/)
  if (ytMatch?.[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`
  }

  const igMatch = strUrl.match(/instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)/)
  if (igMatch?.[1]) {
    return `https://www.instagram.com/p/${igMatch[1]}/embed`
  }

  return null
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#E8E2D8] rounded-md px-3 py-2 min-h-[60px]">
      <p className="text-[0.72rem] uppercase tracking-wide text-[#7B7771] font-bold">{label}</p>
      <p className="text-sm text-[#2E2E2E] mt-1 break-words">{value}</p>
    </div>
  )
}

export function SumarioModal({ onClose, onGoPaso1, onGoPaso2 }: SumarioModalProps) {
  const objStorageData = useMemo<SumarioStorageData>(() => getInitialStorageData(), [])
  const objPaso1 = objStorageData.paso1
  const objPaso2 = objStorageData.paso2
  const arrImagenesPreview = objStorageData.imagenesPreview
  const arrImagenesNombres = objStorageData.imagenesNombres
  const [arrImagenesError, setArrImagenesError] = useState<number[]>([])
  const [intImagenActual, setIntImagenActual] = useState(0)
  const strVideoUrl = objStorageData.videoUrl
  const arrCaracteristicasCustom = objStorageData.caracteristicasCustom
  const [strPublicarMsg, setStrPublicarMsg] = useState<string | null>(null)

  const strCiudad = useMemo(() => {
    const rawCiudad = String(objPaso2.ciudad ?? '').trim()
    if (rawCiudad.length > 0) return toTitleCase(rawCiudad)

    const rawDepartamento = String(objPaso2.departamento ?? '').trim()
    if (!rawDepartamento) return 'No especificado'
    return DEPARTAMENTOS_LABELS[rawDepartamento] ?? toTitleCase(rawDepartamento)
  }, [objPaso2.ciudad, objPaso2.departamento])

  const strVideoEmbed = useMemo(() => getVideoEmbedUrl(strVideoUrl), [strVideoUrl])

  const strCaracteristicas = useMemo(() => {
    if (arrCaracteristicasCustom.length === 0) return 'No especificado'
    return arrCaracteristicasCustom.join(', ')
  }, [arrCaracteristicasCustom])

  const bolEsTerreno = useMemo(() => normalizeValue(String(objPaso1.tipoPropiedad ?? '')) === 'terreno', [objPaso1.tipoPropiedad])

  const intTotalImagenes = arrImagenesPreview.length
  const bolTieneImagenes = intTotalImagenes > 0
  const intImagenSafe = bolTieneImagenes ? intImagenActual % intTotalImagenes : 0
  const intPreviewFija = bolTieneImagenes ? 0 : -1

  const strImagenActual = bolTieneImagenes ? arrImagenesPreview[intImagenSafe] : ''

  const onPrevImagen = () => {
    if (intTotalImagenes <= 1) return
    setIntImagenActual((prev) => (prev - 1 + intTotalImagenes) % intTotalImagenes)
  }

  const onNextImagen = () => {
    if (intTotalImagenes <= 1) return
    setIntImagenActual((prev) => (prev + 1) % intTotalImagenes)
  }

  const onImageError = (index: number) => {
    setArrImagenesError((prev) => (prev.includes(index) ? prev : [...prev, index]))
  }

  return (
    <div className="fixed inset-0 z-[120] bg-black/45 p-3 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl border border-[#DDD6CB] bg-[#F4EFE6] shadow-xl">
        <div className="px-5 sm:px-6 pt-5 pb-3 border-b border-[#ECE7DD]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl sm:text-3xl font-bold text-[#1F3A4D]">{SUMARIO_TITULO}</h2>
            <Badge className="bg-[#E7A18F] text-white">Paso final</Badge>
          </div>
          <p className="text-sm text-[#6C6761]">{SUMARIO_DESCRIPCION}</p>
        </div>

        <div className="px-5 sm:px-6 pb-6 pt-4 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 rounded-lg overflow-hidden bg-[#F6F2EA] relative min-h-[210px]">
              {bolTieneImagenes ? (
                <>
                  {!arrImagenesError.includes(intImagenSafe) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={strImagenActual}
                      alt={arrImagenesNombres[intImagenSafe] ?? `Imagen ${intImagenSafe + 1}`}
                      className="w-full h-full object-cover min-h-[210px]"
                      onError={() => onImageError(intImagenSafe)}
                    />
                  ) : (
                    <div className="w-full h-full min-h-[210px] grid place-items-center text-sm text-[#7B7771]">
                      No se pudo cargar la imagen
                    </div>
                  )}

                  {intTotalImagenes > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={onPrevImagen}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white rounded-full p-2 shadow"
                        aria-label="Imagen anterior"
                      >
                        <ChevronLeft className="w-4 h-4 text-[#4A4A4A]" />
                      </button>

                      <button
                        type="button"
                        onClick={onNextImagen}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white rounded-full p-2 shadow"
                        aria-label="Imagen siguiente"
                      >
                        <ChevronRight className="w-4 h-4 text-[#4A4A4A]" />
                      </button>
                    </>
                  )}

                  <Badge className="absolute bottom-3 left-3 bg-[#C26E5A] text-white text-sm px-3 py-1">
                    {formatPrice(objPaso1.precio)}
                  </Badge>
                </>
              ) : (
                <div className="w-full h-full min-h-[210px] grid place-items-center text-sm text-[#7B7771]">
                  Sin imagenes
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="bg-[#F6F2EA] rounded-lg overflow-hidden min-h-[100px]">
                {strVideoEmbed ? (
                  <div className="aspect-video">
                    <iframe
                      src={strVideoEmbed}
                      title="Vista previa video"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="min-h-[100px] grid place-items-center text-sm text-[#7B7771]">Sin video</div>
                )}
              </div>

              <div className="bg-[#F6F2EA] rounded-lg overflow-hidden min-h-[90px]">
                {intPreviewFija >= 0 && !arrImagenesError.includes(intPreviewFija) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={arrImagenesPreview[intPreviewFija]}
                    alt={arrImagenesNombres[intPreviewFija] ?? 'Primera imagen'}
                    className="w-full h-full object-cover min-h-[90px]"
                    onError={() => onImageError(intPreviewFija)}
                  />
                ) : (
                  <div className="min-h-[90px] grid place-items-center text-sm text-[#7B7771]">Sin vista previa</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onGoPaso1}
              className="border-[#C26E5A] text-[#C26E5A] hover:bg-[#C26E5A]/10"
            >
              Editar paso 1
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onGoPaso2}
              className="border-[#C26E5A] text-[#C26E5A] hover:bg-[#C26E5A]/10"
            >
              Editar paso 2
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl sm:text-4xl font-bold text-[#2E2E2E]">{toText(objPaso1.titulo)}</h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="space-y-2">
                <SummaryField label="Tipo de propiedad" value={toText(objPaso1.tipoPropiedad)} />
                <SummaryField label="Direccion" value={toText(objPaso2.direccion)} />
                <SummaryField label="Superficie" value={formatSurface(objPaso2.superficie)} />
                {!bolEsTerreno && <SummaryField label="Habitaciones" value={toText(objPaso2.habitaciones)} />}
                <SummaryField label="Caracteristicas" value={strCaracteristicas} />
              </div>

              <div className="space-y-2">
                <SummaryField label="Tipo de operacion" value={toTitleCase(String(objPaso1.tipoOperacion ?? ''))} />
                <SummaryField label="Ciudad" value={strCiudad} />
                <SummaryField label="Zona" value={toText(objPaso2.zona)} />
                {!bolEsTerreno && <SummaryField label="Garajes" value={toText(objPaso2.garajes)} />}
                {!bolEsTerreno && <SummaryField label="Banos" value={toText(objPaso2.banios)} />}
                {!bolEsTerreno && <SummaryField label="Plantas" value={toText(objPaso2.plantas)} />}
              </div>

              <div className="bg-[#E8E2D8] rounded-md px-3 py-2 min-h-[364px]">
                <p className="text-[0.72rem] uppercase tracking-wide text-[#7B7771] font-bold">Descripcion</p>
                <p className="text-sm text-[#2E2E2E] mt-1 whitespace-pre-line">{toText(objPaso1.descripcion)}</p>
              </div>
            </div>
          </div>

          {strPublicarMsg && (
            <div className="rounded-md border border-[#E9C6BD] bg-[#FFF4F1] px-3 py-2 text-sm text-[#8A4A3B]">
              {strPublicarMsg}
            </div>
          )}

          <div className="flex flex-wrap justify-between gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#C26E5A] text-[#C26E5A] hover:bg-[#C26E5A]/10 px-6 sm:px-8 py-5 text-sm sm:text-base font-semibold"
            >
              Regresar
            </Button>

            <Button
              type="button"
              onClick={() => {
                setStrPublicarMsg('Implementacion HU5 en alcance solo visual: este boton queda listo a nivel UI, sin ejecutar publicacion backend.')
              }}
              className="bg-[#C26E5A] hover:bg-[#a85a48] text-white px-6 sm:px-8 py-5 text-sm sm:text-base font-semibold"
            >
              Publicar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
