'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

//import { Badge } from '@/components/ui/badge'
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
    modoEdicion?: boolean
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

    const datosAviso      = parseJSON<Record<string, string>>(sessionStorage.getItem('datosAviso'),             {})
    const categoria       = parseJSON<Record<string, string>>(sessionStorage.getItem('categoriaYEstado'),       {})
    const ubicacion       = parseJSON<Record<string, string>>(sessionStorage.getItem('ubicacion'),              {})
    const caracteristicas = parseJSON<Record<string, string>>(sessionStorage.getItem('caracteristicasDetalle'), {})
    const video           = parseJSON<Record<string, string>>(sessionStorage.getItem('videoPropiedad'),         {})
    const descripcionRaw  = parseJSON<{ descripcion?: string; caracteristicas?: CaracteristicaExtra[] }>(
        sessionStorage.getItem('descripcionPropiedad'), {}
    )

    const arrPreview = parseJSON<string[]>(sessionStorage.getItem('caracteristicasImagenesPreview'), [])
        .filter((item) => typeof item === 'string' && item.trim().length > 0)
    const arrNombres = parseJSON<string[]>(sessionStorage.getItem('caracteristicasImagenesNombres'), [])
        .filter((item) => typeof item === 'string' && item.trim().length > 0)

    const arrImagenesIniciales = parseJSON<string[]>(
        sessionStorage.getItem('imagenesIniciales'), []
    ).filter((item) => typeof item === 'string' && item.trim().length > 0)

    const arrPreviewFinal = [
        ...arrImagenesIniciales,
        ...arrPreview,
    ].filter((url, index, self) => self.indexOf(url) === index)

    return {
        titulo:          datosAviso.titulo           ?? '',
        tipoOperacion:   datosAviso.tipoOperacion    ?? '',
        precio:          String(datosAviso.precio    ?? ''),
        tipoMoneda:      datosAviso.tipoMoneda       ?? 'BOB',
        tipoPropiedad:   categoria.tipoPropiedad     ?? '',
        estadoPropiedad: categoria.estadoPropiedad   ?? '',
        direccion:       ubicacion.direccion         ?? '',
        departamento:    ubicacion.departamento      ?? '',
        zona:            ubicacion.zona              ?? '',
        habitaciones:    String(caracteristicas.habitaciones ?? ''),
        banios:          String(caracteristicas.banios       ?? ''),
        garajes:         String(caracteristicas.garajes      ?? ''),
        plantas:         String(caracteristicas.plantas      ?? ''),
        superficie:      String(caracteristicas.superficie   ?? ''),
        imagenesPreview: arrPreviewFinal,
        imagenesNombres: [
            ...arrImagenesIniciales.map((_, i) => `Imagen original ${i + 1}`),
            ...arrNombres,
        ],
        videoUrl:        video.url                              ?? '',
        descripcion:     descripcionRaw.descripcion             ?? '',
        caracteristicas: Array.isArray(descripcionRaw.caracteristicas)
            ? descripcionRaw.caracteristicas
            : [],
    }
}

// ─────────────────────────────────────────────────────────────
// Subcomponente: campo desktop (caja con label + valor)
// ─────────────────────────────────────────────────────────────
function FieldDesktop({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-[#EDE8DF] rounded-md px-3 py-2">
            <p className="text-[0.65rem] uppercase tracking-wide text-[#7B7771] font-bold">{label}</p>
            <p className="text-sm text-[#2E2E2E] mt-0.5 break-words">{value}</p>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// Subcomponente: campo mobile (fila label + valor con separador)
// ─────────────────────────────────────────────────────────────
function FieldMobile({ label, value }: { label: string; value: string }) {
    return (
        <div className="py-2.5 border-b border-[#DDD6CB] last:border-0">
            <p className="text-[0.7rem] uppercase tracking-wide text-[#9B9791] font-semibold">{label}</p>
            <p className="text-sm text-[#2E2E2E] mt-0.5">{value}</p>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────
export function SumarioModal({ onClose, onConfirmarPublicar, modoEdicion }: SumarioModalProps) {
    const data = useMemo<SumarioStorageData>(() => getInitialStorageData(), [])

    const [arrImagenesError, setArrImagenesError] = useState<number[]>([])
    const [intImagenActual,  setIntImagenActual]  = useState(0)

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

    const intTotalImagenes     = data.imagenesPreview.length
    const bolTieneImagenes     = intTotalImagenes > 0
    // En mobile el video cuenta como un slide extra al final
    const intTotalSlidesMobile = intTotalImagenes + (strVideoEmbed ? 1 : 0)
    const intImagenSafe        = bolTieneImagenes
        ? intImagenActual % intTotalImagenes
        : 0

    const onPrevImagen = () => {
        if (intTotalSlidesMobile <= 1) return
        setIntImagenActual((prev) => (prev - 1 + intTotalSlidesMobile) % intTotalSlidesMobile)
    }
    const onNextImagen = () => {
        if (intTotalSlidesMobile <= 1) return
        setIntImagenActual((prev) => (prev + 1) % intTotalSlidesMobile)
    }
    const onImageError = (index: number) => {
        setArrImagenesError((prev) => (prev.includes(index) ? prev : [...prev, index]))
    }

    // Slide actual en mobile: ¿es el slide de video?
    const bolEsSlideVideo = strVideoEmbed !== null && intImagenActual === intTotalImagenes

    // Campos comunes a ambos layouts
    const camposCol1 = [
        { label: 'Tipo de Propiedad',  value: toText(data.tipoPropiedad) },
        { label: 'Dirección',          value: toText(data.direccion) },
        { label: 'Superficie',         value: formatSurface(data.superficie) },
        ...(!bolEsTerreno ? [{ label: 'Habitaciones', value: toText(data.habitaciones) }] : []),
        ...(!bolEsTerreno ? [{ label: 'Plantas',      value: toText(data.plantas) }] : []),
    ]
    const camposCol2 = [
        { label: 'Tipo de Operación', value: toTitleCase(data.tipoOperacion) },
        { label: 'Ciudad',            value: strCiudad },
        { label: 'Zona',              value: toText(data.zona) },
        ...(!bolEsTerreno ? [{ label: 'Garajes', value: toText(data.garajes) }] : []),
        ...(!bolEsTerreno ? [{ label: 'Baños',   value: toText(data.banios) }] : []),
    ]

    return (
        <div
            className="fixed inset-0 z-50 bg-black/45 flex items-start justify-center overflow-y-auto p-3 md:p-6 pt-20 md:pt-24"
            onClick={onClose}
        >
            <div
                className="w-full max-w-5xl rounded-2xl bg-[#F4EFE6] shadow-xl border border-[#DDD6CB] mb-8"
                onClick={e => e.stopPropagation()}
            >

                {/* ── Cabecera ────────────────────────────────────── */}
                <div className="px-5 md:px-8 pt-6 md:pt-8 pb-4 border-b border-[#ECE7DD]">
                    {/* Desktop: título izq, badge der */}
                    <div className="hidden md:flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-2xl font-bold text-[#1F3A4D]">Resumen de Publicación</h2>
                            <p className="text-sm text-[#6C6761] mt-0.5">
                                {modoEdicion
                                    ? 'Revisa la información de tu inmueble antes de guardarlo.'
                                    : 'Revisa la información de tu inmueble antes de publicarlo.'}
                            </p>
                        </div>
                        {data.estadoPropiedad && (
                            <span
                                className="bg-[#C26E5A] text-white text-sm font-semibold rounded-lg shrink-0 whitespace-nowrap inline-flex items-center justify-center"
                                style={{ padding: '2px 10px', minWidth: '132px', height: '39px' }}
                            >
                                {toTitleCase(data.estadoPropiedad)}
                            </span>
                        )}
                    </div>
                    {/* Mobile: centrado */}
                    <div className="md:hidden text-center">
                        <h2 className="text-xl font-bold text-[#1F3A4D]">Resumen de Publicación</h2>
                        <p className="text-xs text-[#6C6761] mt-0.5">
                            {modoEdicion
                                ? 'Revisa la información antes de guardar.'
                                : 'Revisa la información de tu inmueble antes de publicarlo.'}
                        </p>
                    </div>
                </div>

                <div className="px-5 md:px-8 py-5 space-y-5">

                    {/* ── Galería ────────────────────────────────────────
                        Desktop: 2/3 imagen + 1/3 video y thumbnail
                        Mobile:  carrusel con imágenes + video como último slide
                    ─────────────────────────────────────────────────── */}

                    {/* DESKTOP galería */}
                    <div className="hidden md:grid grid-cols-3 gap-3">
                        {/* Imagen principal — 2/3 */}
                        <div className="col-span-2 relative bg-[#EDE8DF] min-h-[240px] rounded-xl overflow-hidden">
                            {bolTieneImagenes && !arrImagenesError.includes(intImagenSafe) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={data.imagenesPreview[intImagenSafe]}
                                    alt={data.imagenesNombres[intImagenSafe] ?? `Imagen ${intImagenSafe + 1}`}
                                    className="w-full h-full object-cover min-h-[240px]"
                                    onError={() => onImageError(intImagenSafe)}
                                />
                            ) : (
                                <div className="w-full min-h-[240px] grid place-items-center text-sm text-[#7B7771]">
                                    Sin imágenes
                                </div>
                            )}

                            {intTotalImagenes > 1 && (
                                <>
                                    <button type="button" onClick={onPrevImagen}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white rounded-full p-2 shadow"
                                        aria-label="Imagen anterior">
                                        <ChevronLeft className="w-4 h-4 text-[#4A4A4A]" />
                                    </button>
                                    <button type="button" onClick={onNextImagen}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white rounded-full p-2 shadow"
                                        aria-label="Imagen siguiente">
                                        <ChevronRight className="w-4 h-4 text-[#4A4A4A]" />
                                    </button>
                                </>
                            )}

                            <span
                                className="absolute bottom-3 left-3 bg-[#C26E5A] text-white text-sm font-semibold rounded-lg whitespace-nowrap"
                                style={{ padding: '8px 16px' }}
                            >
                                {formatPrice(data.precio, data.tipoMoneda)}
                            </span>
                        </div>

                        {/* 1/3 derecha: video arriba + thumbnail abajo */}
                        <div className="flex flex-col gap-3">
                            <div className="bg-[#EDE8DF] rounded-lg overflow-hidden flex-1 min-h-[120px]">
                                {strVideoEmbed ? (
                                    <iframe
                                        src={strVideoEmbed}
                                        title="Vista previa video"
                                        className="w-full h-full border-0 min-h-[120px]"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen loading="lazy"
                                    />
                                ) : (
                                    <div className="min-h-[120px] grid place-items-center text-sm text-[#7B7771]">
                                        Sin video
                                    </div>
                                )}
                            </div>
                            {/* Thumbnail: solo si hay 2+ imágenes, muestra la siguiente a la actual */}
                            <div className="bg-[#EDE8DF] rounded-lg overflow-hidden flex-1 min-h-[100px]">
                                {intTotalImagenes > 1 ? (() => {
                                    const indexSiguiente = (intImagenSafe + 1) % intTotalImagenes
                                    return !arrImagenesError.includes(indexSiguiente) ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={data.imagenesPreview[indexSiguiente]}
                                            alt={data.imagenesNombres[indexSiguiente] ?? `Imagen ${indexSiguiente + 1}`}
                                            className="w-full h-full object-cover min-h-[100px]"
                                            onError={() => onImageError(indexSiguiente)}
                                        />
                                    ) : (
                                        <div className="min-h-[100px] grid place-items-center text-sm text-[#7B7771]">
                                            No se pudo cargar
                                        </div>
                                    )
                                })() : (
                                    <div className="min-h-[100px]" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* MOBILE galería — imágenes + video como último slide */}
                    <div className="md:hidden">
                        <div className="relative bg-[#EDE8DF] rounded-xl overflow-hidden min-h-[200px]">

                            {bolEsSlideVideo ? (
                                /* Slide de video — último */
                                <iframe
                                    src={strVideoEmbed!}
                                    title="Vista previa video"
                                    className="w-full border-0"
                                    style={{ height: '200px' }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    loading="lazy"
                                />
                            ) : bolTieneImagenes && !arrImagenesError.includes(intImagenActual) ? (
                                /* Slide de imagen */
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={data.imagenesPreview[intImagenActual]}
                                    alt={data.imagenesNombres[intImagenActual] ?? `Imagen ${intImagenActual + 1}`}
                                    className="w-full object-cover min-h-[200px]"
                                    onError={() => onImageError(intImagenActual)}
                                />
                            ) : (
                                <div className="min-h-[200px] grid place-items-center text-sm text-[#7B7771]">
                                    Sin imágenes
                                </div>
                            )}

                            {/* Flechas — aparecen si hay más de 1 slide (imágenes + video) */}
                            {intTotalSlidesMobile > 1 && (
                                <>
                                    <button type="button" onClick={onPrevImagen}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/85 rounded-full p-1.5 shadow">
                                        <ChevronLeft className="w-4 h-4 text-[#4A4A4A]" />
                                    </button>
                                    <button type="button" onClick={onNextImagen}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/85 rounded-full p-1.5 shadow">
                                        <ChevronRight className="w-4 h-4 text-[#4A4A4A]" />
                                    </button>
                                </>
                            )}

                            {/* Indicador de slide — puntos */}
                            {intTotalSlidesMobile > 1 && (
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {Array.from({ length: intTotalSlidesMobile }).map((_, i) => (
                                        <span
                                            key={i}
                                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                                                i === intImagenActual
                                                    ? 'bg-white scale-125'
                                                    : 'bg-white/50'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Título ───────────────────────────────────────── */}
                    <h3 className="text-2xl md:text-3xl font-bold text-[#2E2E2E]">{toText(data.titulo)}</h3>

                    {/* Precio + badge — MOBILE: debajo del título / DESKTOP: en la imagen */}
                    <div className="md:hidden flex items-center justify-between gap-3">
                        <span className="bg-[#C26E5A] text-white text-sm font-semibold px-5 py-2.5 rounded-full whitespace-nowrap">
                            {formatPrice(data.precio, data.tipoMoneda)}
                        </span>
                        {data.estadoPropiedad && (
                            <span className="bg-[#C26E5A] text-white text-sm font-semibold px-5 py-2.5 rounded-full whitespace-nowrap">
                                {toTitleCase(data.estadoPropiedad)}
                            </span>
                        )}
                    </div>

                    {/* ── Campos de datos ───────────────────────────────
                        Desktop: 3 columnas (col1 + col2 + descripción)
                        Mobile:  cuadros uno debajo del otro + descripción
                    ─────────────────────────────────────────────────── */}

                    {/* DESKTOP campos */}
                    <div className="hidden md:grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                            {camposCol1.map(f => <FieldDesktop key={f.label} label={f.label} value={f.value} />)}
                        </div>
                        <div className="space-y-2">
                            {camposCol2.map(f => <FieldDesktop key={f.label} label={f.label} value={f.value} />)}
                        </div>
                        {/* Columna 3: descripción con overflow controlado */}
                        <div className="bg-[#EDE8DF] rounded-md px-3 py-2 min-h-[200px] overflow-hidden">
                            <p className="text-[0.65rem] uppercase tracking-wide text-[#7B7771] font-bold">Descripción</p>
                            <p className="text-sm text-[#2E2E2E] mt-1 whitespace-pre-wrap break-words overflow-wrap-anywhere">{toText(data.descripcion)}</p>
                        </div>
                    </div>

                    {/* MOBILE campos */}
                    <div className="md:hidden space-y-2">
                        {[...camposCol1, ...camposCol2].map(f => (
                            <FieldDesktop key={f.label} label={f.label} value={f.value} />
                        ))}
                        {/* Descripción full width */}
                        <div className="bg-[#EDE8DF] rounded-md px-3 py-2 overflow-hidden">
                            <p className="text-[0.65rem] uppercase tracking-wide text-[#7B7771] font-bold">Descripción</p>
                            <p className="text-sm text-[#2E2E2E] mt-1 whitespace-pre-wrap break-words overflow-wrap-anywhere">{toText(data.descripcion)}</p>
                        </div>
                    </div>

                    {/* ── Características extras ────────────────────────
                        Desktop: 4 columnas
                        Mobile:  2 columnas
                    ─────────────────────────────────────────────────── */}
                    {data.caracteristicas.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {data.caracteristicas.map((c) => (
                                <div key={c.titulo} className="rounded-lg overflow-hidden border border-[#DDD6CB]">
                                    <div className="bg-[#C26E5A] px-3 py-2">
                                        <p className="text-white text-sm font-bold">{c.titulo}</p>
                                    </div>
                                    <div className="bg-[#EDE8DF] px-3 py-2 min-h-[56px]">
                                        <p className="text-[0.65rem] font-bold text-[#7B7771] uppercase tracking-wide mb-1">Descripción</p>
                                        <p className="text-sm text-[#2E2E2E]">{c.detalle || 'No especificado'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Botones ───────────────────────────────────────
                        Desktop: Regresar izq + Publicar/Guardar der
                        Mobile:  misma fila pero más compactos
                    ─────────────────────────────────────────────────── */}
                    <div className="flex justify-between gap-3 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="border-[#C26E5A] text-[#C26E5A] hover:bg-[#C26E5A]/10 px-5 md:px-8 py-2.5 text-sm md:text-base font-semibold w-32 md:w-40"
                        >
                            Regresar
                        </Button>

                        <Button
                            type="button"
                            onClick={() => onConfirmarPublicar?.()}
                            className="bg-[#C26E5A] hover:bg-[#a85a48] text-white px-5 md:px-8 py-2.5 text-sm md:text-base font-semibold w-32 md:w-40"
                        >
                            {modoEdicion ? 'Guardar' : 'Publicar'}
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    )
}