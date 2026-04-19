'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// ─────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────
type CaracteristicaExtra = {
    titulo: string
    detalle: string
}

type SumarioStorageData = {
    titulo: string
    tipoOperacion: string
    precio: string
    tipoMoneda: string
    tipoPropiedad: string
    estadoPropiedad: string
    direccion: string
    departamento: string
    zona: string
    habitaciones: string
    banios: string
    garajes: string
    plantas: string
    superficie: string
    imagenesPreview: string[]
    imagenesNombres: string[]
    videoUrl: string
    descripcion: string
    caracteristicas: CaracteristicaExtra[]
}

interface SumarioModalProps {
    onClose: () => void
    onConfirmarPublicar?: () => void
}

// ─────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────
const DEPARTAMENTOS_LABELS: Record<string, string> = {
    beni: 'Beni',
    chuquisaca: 'Chuquisaca',
    cochabamba: 'Cochabamba',
    la_paz: 'La Paz',
    oruro: 'Oruro',
    pando: 'Pando',
    potosi: 'Potosí',
    santa_cruz: 'Santa Cruz',
    tarija: 'Tarija',
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function parseJSON<T>(value: string | null, fallback: T): T {
    if (!value) return fallback
    try { return JSON.parse(value) as T } catch { return fallback }
}

function toText(value: unknown, fallback = 'No especificado'): string {
    if (value === null || value === undefined) return fallback
    const strValue = String(value).trim()
    return strValue.length > 0 ? strValue : fallback
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

function formatSurface(value: unknown): string {
    const strValue = String(value ?? '').trim()
    if (!strValue) return 'No especificado'
    return `${strValue} m²`
}

function formatPrice(precio: string, tipoMoneda: string): string {
    const strValue = String(precio ?? '').trim()
    if (!strValue) return 'No especificado'
    const numValue = Number(strValue.replace(/\./g, '').replace(',', '.'))
    if (!Number.isFinite(numValue)) return strValue

    if (tipoMoneda === 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency', currency: 'USD',
            minimumFractionDigits: 0, maximumFractionDigits: 2,
        }).format(numValue)
    }

    return new Intl.NumberFormat('es-BO', {
        style: 'currency', currency: 'BOB',
        minimumFractionDigits: 0, maximumFractionDigits: 2,
    }).format(numValue)
}

function getVideoEmbedUrl(videoUrl: string): string | null {
    const strUrl = videoUrl.trim()
    if (!strUrl) return null
    const ytMatch = strUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/)
    if (ytMatch?.[1]) return `https://www.youtube.com/embed/${ytMatch[1]}`
    const igMatch = strUrl.match(/instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)/)
    if (igMatch?.[1]) return `https://www.instagram.com/p/${igMatch[1]}/embed`
    return null
}

// ─────────────────────────────────────────────────────────────
// Lectura de sessionStorage
// ─────────────────────────────────────────────────────────────
function getInitialStorageData(): SumarioStorageData {
    const empty: SumarioStorageData = {
        titulo: '', tipoOperacion: '', precio: '', tipoMoneda: 'BOB',
        tipoPropiedad: '', estadoPropiedad: '',
        direccion: '', departamento: '', zona: '',
        habitaciones: '', banios: '', garajes: '', plantas: '', superficie: '',
        imagenesPreview: [], imagenesNombres: [],
        videoUrl: '', descripcion: '', caracteristicas: [],
    }

    if (typeof window === 'undefined') return empty

    const datosAviso = parseJSON<Record<string, string>>(sessionStorage.getItem('datosAviso'), {})
    const categoria = parseJSON<Record<string, string>>(sessionStorage.getItem('categoriaYEstado'), {})
    const ubicacion = parseJSON<Record<string, string>>(sessionStorage.getItem('ubicacion'), {})
    const caracteristicas = parseJSON<Record<string, string>>(sessionStorage.getItem('caracteristicasDetalle'), {})
    const video = parseJSON<Record<string, string>>(sessionStorage.getItem('videoPropiedad'), {})
    const descripcionRaw = parseJSON<{ descripcion?: string; caracteristicas?: CaracteristicaExtra[] }>(
        sessionStorage.getItem('descripcionPropiedad'), {}
    )

    const arrPreview = parseJSON<string[]>(sessionStorage.getItem('caracteristicasImagenesPreview'), [])
        .filter((item) => typeof item === 'string' && item.trim().length > 0)
    const arrNombres = parseJSON<string[]>(sessionStorage.getItem('caracteristicasImagenesNombres'), [])
        .filter((item) => typeof item === 'string' && item.trim().length > 0)

    return {
        titulo: datosAviso.titulo ?? '',
        tipoOperacion: datosAviso.tipoOperacion ?? '',
        precio: String(datosAviso.precio ?? ''),
        tipoMoneda: datosAviso.tipoMoneda ?? 'BOB',
        tipoPropiedad: categoria.tipoPropiedad ?? '',
        estadoPropiedad: categoria.estadoPropiedad ?? '',
        direccion: ubicacion.direccion ?? '',
        departamento: ubicacion.departamento ?? '',
        zona: ubicacion.zona ?? '',
        habitaciones: String(caracteristicas.habitaciones ?? ''),
        banios: String(caracteristicas.banios ?? ''),
        garajes: String(caracteristicas.garajes ?? ''),
        plantas: String(caracteristicas.plantas ?? ''),
        superficie: String(caracteristicas.superficie ?? ''),
        imagenesPreview: arrPreview,
        imagenesNombres: arrNombres,
        videoUrl: video.url ?? '',
        descripcion: descripcionRaw.descripcion ?? '',
        caracteristicas: Array.isArray(descripcionRaw.caracteristicas)
            ? descripcionRaw.caracteristicas
            : [],
    }
}

// ─────────────────────────────────────────────────────────────
// Subcomponente campo
// ─────────────────────────────────────────────────────────────
function SummaryField({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-[#E8E2D8] rounded-md px-3 py-2 min-h-[60px]">
            <p className="text-[0.72rem] uppercase tracking-wide text-[#7B7771] font-bold">{label}</p>
            <p className="text-sm text-[#2E2E2E] mt-1 break-words">{value}</p>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────
export function SumarioModal({ onClose, onConfirmarPublicar }: SumarioModalProps) {
    const data = useMemo<SumarioStorageData>(() => getInitialStorageData(), [])

    const [arrImagenesError, setArrImagenesError] = useState<number[]>([])
    const [intImagenActual, setIntImagenActual] = useState(0)

    const bolEsTerreno = useMemo(
        () => normalizeValue(data.tipoPropiedad) === 'terreno',
        [data.tipoPropiedad],
    )

    const strCiudad = useMemo(() => {
        const rawDep = data.departamento.trim()
        if (!rawDep) return 'No especificado'
        return DEPARTAMENTOS_LABELS[rawDep] ?? toTitleCase(rawDep)
    }, [data.departamento])

    const strVideoEmbed = useMemo(() => getVideoEmbedUrl(data.videoUrl), [data.videoUrl])

    const intTotalImagenes = data.imagenesPreview.length
    const bolTieneImagenes = intTotalImagenes > 0
    const intImagenSafe = bolTieneImagenes ? intImagenActual % intTotalImagenes : 0

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
        <div
            className="fixed inset-0 z-50 bg-black/45 p-3 sm:p-6 flex items-start justify-center pt-20 sm:pt-24"
            onClick={onClose}
        >
            <div
                className="w-full max-w-5xl max-h-[82vh] overflow-y-auto rounded-2xl border border-[#DDD6CB] bg-[#F4EFE6] shadow-xl"
                onClick={e => e.stopPropagation()}
            >

                {/* Cabecera */}
                <div className="px-5 sm:px-6 pt-8 sm:pt-10 pb-3 border-b border-[#ECE7DD]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-xl sm:text-3xl font-bold text-[#1F3A4D]">Resumen de Publicación</h2>
                        <div className="flex items-center gap-2">
                            {data.estadoPropiedad && (
                                <Badge className="bg-[#C26E5A] text-white text-sm px-3 py-1">
                                    {toTitleCase(data.estadoPropiedad)}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-[#6C6761]">Revisa la información de tu inmueble antes de publicarlo.</p>
                </div>

                <div className="px-5 sm:px-6 pb-6 pt-4 space-y-5">

                    {/* Galería + video */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2 rounded-lg overflow-hidden bg-[#F6F2EA] relative min-h-[210px]">
                            {bolTieneImagenes ? (
                                <>
                                    {!arrImagenesError.includes(intImagenSafe) ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={data.imagenesPreview[intImagenSafe]}
                                            alt={data.imagenesNombres[intImagenSafe] ?? `Imagen ${intImagenSafe + 1}`}
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
                                        {formatPrice(data.precio, data.tipoMoneda)}
                                    </Badge>
                                </>
                            ) : (
                                <div className="w-full h-full min-h-[210px] grid place-items-center text-sm text-[#7B7771]">
                                    Sin imágenes
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
                                {bolTieneImagenes && !arrImagenesError.includes(0) ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={data.imagenesPreview[0]}
                                        alt={data.imagenesNombres[0] ?? 'Primera imagen'}
                                        className="w-full h-full object-cover min-h-[90px]"
                                        onError={() => onImageError(0)}
                                    />
                                ) : (
                                    <div className="min-h-[90px] grid place-items-center text-sm text-[#7B7771]">Sin vista previa</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Datos */}
                    <div className="space-y-3">
                        <h3 className="text-2xl sm:text-4xl font-bold text-[#2E2E2E]">{toText(data.titulo)}</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                            {/* Columna 1 */}
                            <div className="space-y-2">
                                <SummaryField label="Tipo de propiedad" value={toText(data.tipoPropiedad)} />
                                <SummaryField label="Dirección" value={toText(data.direccion)} />
                                <SummaryField label="Superficie" value={formatSurface(data.superficie)} />
                                {!bolEsTerreno && <SummaryField label="Habitaciones" value={toText(data.habitaciones)} />}
                            </div>

                            {/* Columna 2 */}
                            <div className="space-y-2">
                                <SummaryField label="Tipo de operación" value={toTitleCase(data.tipoOperacion)} />
                                <SummaryField label="Ciudad" value={strCiudad} />
                                <SummaryField label="Zona" value={toText(data.zona)} />
                                {!bolEsTerreno && <SummaryField label="Garajes" value={toText(data.garajes)} />}
                                {!bolEsTerreno && <SummaryField label="Baños" value={toText(data.banios)} />}
                                {!bolEsTerreno && <SummaryField label="Plantas" value={toText(data.plantas)} />}
                            </div>

                            {/* Columna 3 — descripción */}
                            <div className="bg-[#E8E2D8] rounded-md px-3 py-2 min-h-[364px]">
                                <p className="text-[0.72rem] uppercase tracking-wide text-[#7B7771] font-bold">Descripción</p>
                                <p className="text-sm text-[#2E2E2E] mt-1 whitespace-pre-line">{toText(data.descripcion)}</p>
                            </div>
                        </div>
                        {/* Características extras — tarjetas */}
                        {data.caracteristicas.length > 0 && (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                                {data.caracteristicas.map((c) => (
                                    <div key={c.titulo} className="rounded-lg overflow-hidden border border-[#DDD6CB]">
                                        <div className="bg-[#C26E5A] px-3 py-2">
                                            <p className="text-white text-sm font-bold">{c.titulo}</p>
                                        </div>
                                        <div className="bg-[#EDE8DF] px-3 py-2 min-h-[64px]">
                                            <p className="text-[0.72rem] font-bold text-[#7B7771] uppercase tracking-wide mb-1">Descripcion</p>
                                            <p className="text-sm text-[#2E2E2E]">{c.detalle || 'No especificado'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Botones de acción */}
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
                            onClick={() => onConfirmarPublicar?.()}
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