"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface IconDefaultWithGetIconUrl extends L.Icon.Default {
  _getIconUrl?: string
}
delete (L.Icon.Default.prototype as IconDefaultWithGetIconUrl)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ""

const DEPTO_COORDS: Record<string, [number, number]> = {
  "Cochabamba": [-17.3943, -66.1569],
  "La Paz":     [-16.5000, -68.1193],
  "Santa Cruz": [-17.7833, -63.1821],
  "Oruro":      [-17.9833, -67.1500],
  "Potosí":     [-19.5836, -65.7531],
  "Chuquisaca": [-19.0431, -65.2592],
  "Tarija":     [-21.5355, -64.7296],
  "Beni":       [-14.8333, -64.9000],
  "Pando":      [-11.0289, -68.7692],
}

const DEPTO_BBOX: Record<string, [number, number, number, number]> = {
  "Cochabamba": [-67.0, -18.2, -64.5, -16.2],
  "La Paz":     [-69.6, -17.5, -67.5, -14.5],
  "Santa Cruz": [-63.5, -20.5, -57.5, -13.5],
  "Oruro":      [-68.5, -19.5, -66.5, -17.0],
  "Potosí":     [-67.5, -22.9, -64.5, -18.5],
  "Chuquisaca": [-66.0, -20.5, -64.5, -18.5],
  "Tarija":     [-65.5, -22.9, -63.5, -21.0],
  "Beni":       [-67.0, -15.0, -63.0,  -9.7],
  "Pando":      [-69.6, -12.5, -65.5,  -9.7],
}

function detectarDepartamento(lat: number, lng: number): string {
  let closest = ""
  let minDist = Infinity
  for (const [nombre, [dLat, dLng]] of Object.entries(DEPTO_COORDS)) {
    const dist = Math.sqrt((lat - dLat) ** 2 + (lng - dLng) ** 2)
    if (dist < minDist) { minDist = dist; closest = nombre }
  }
  return closest
}

const getCenter = (depto?: string): [number, number] => {
  if (!depto) return DEPTO_COORDS["Cochabamba"]
  const entry = Object.entries(DEPTO_COORDS).find(
    ([k]) => k.toLowerCase() === depto.toLowerCase()
  )
  return entry ? entry[1] : DEPTO_COORDS["Cochabamba"]
}

type MapCommand =
  | { type: "flyTo";     center: [number, number]; zoom: number; trigger: number }
  | { type: "fitBounds"; bounds: [[number,number],[number,number]]; trigger: number }

function MapController({ cmd }: { cmd: MapCommand }) {
  const map  = useMap()
  const prev = useRef<number>(-1)

  useEffect(() => {
    if (cmd.trigger === prev.current) return
    prev.current = cmd.trigger
    if (cmd.type === "flyTo") {
      map.flyTo(cmd.center, cmd.zoom, { animate: true, duration: 0.8 })
    } else if (cmd.type === "fitBounds") {
      map.flyToBounds(cmd.bounds, { animate: true, duration: 0.8, maxZoom: 15, padding: [30, 30] })
    }
  }, [cmd, map])

  return null
}

function ClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onLocationSelect(e.latlng.lat, e.latlng.lng) } })
  return null
}

export interface LocationData {
  lat:          number
  lng:          number
  direccion:    string
  ciudad:       string
  pais:         string
  departamento: string
}

interface MapboxContext  { id: string; text: string }
interface MapboxFeature  {
  id: string; place_name: string; text: string; center: [number, number]
  bbox?: [number, number, number, number]; context?: MapboxContext[]
  properties: Record<string, unknown>
}
interface MapboxResponse { features: MapboxFeature[] }

interface LocationPickerProps {
  deptoActual?: string
  onChange:     (data: LocationData) => void
}

export default function LocationPicker({ deptoActual, onChange }: LocationPickerProps) {
  const [markerPos,       setMarkerPos]       = useState<[number, number] | null>(null)
  const [mapCmd,          setMapCmd]          = useState<MapCommand>({
    type: "flyTo", center: getCenter(deptoActual), zoom: 13, trigger: 0,
  })
  const [isLoading,       setIsLoading]       = useState(true)
  const [isGeocoding,     setIsGeocoding]     = useState(false)
  const [isSearching,     setIsSearching]     = useState(false)
  const [direccion,       setDireccion]       = useState("")
  const [ciudad,          setCiudad]          = useState("")
  const [query,           setQuery]           = useState("")
  const [suggestions,     setSuggestions]     = useState<MapboxFeature[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // ✅ Fix: useState con inicializador en lugar de useRef para valores usados en render
  const [initialCenter] = useState<[number, number]>(() => getCenter(deptoActual))
  const [initialZoom]   = useState(13)

  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchTimer     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevDepto       = useRef(deptoActual)
  const seleccionado    = useRef(false)
  const markerPosRef    = useRef<[number, number] | null>(null)

  useEffect(() => {
    loadingTimerRef.current = setTimeout(() => setIsLoading(false), 800)
    return () => { if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current) }
  }, [])

  const handleMapReady = useCallback(() => {
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (deptoActual === prevDepto.current) return
    prevDepto.current = deptoActual
    if (markerPosRef.current) return
    setMapCmd(prev => ({ type: "flyTo", center: getCenter(deptoActual), zoom: 12, trigger: prev.trigger + 1 }))
  }, [deptoActual])

  useEffect(() => {
    if (seleccionado.current) return
    if (query.length < 2) { setSuggestions([]); setShowSuggestions(false); return }
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const center    = getCenter(deptoActual)
        const bbox      = deptoActual && DEPTO_BBOX[deptoActual] ? DEPTO_BBOX[deptoActual].join(",") : "-69.6,-22.9,-57.5,-9.7"
        const proximity = `${center[1]},${center[0]}`
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
          `?access_token=${MAPBOX_TOKEN}&country=bo&language=es&limit=6&proximity=${proximity}&bbox=${bbox}`
        const res  = await fetch(url)
        const data = await res.json() as MapboxResponse
        setSuggestions(Array.isArray(data.features) ? data.features : [])
        setShowSuggestions(true)
      } catch (e) {
        console.error("Mapbox autocompletado:", e)
      } finally {
        setIsSearching(false)
      }
    }, 350)
  }, [query, deptoActual])

  const handleMapClick = useCallback(async (latVal: number, lngVal: number) => {
    const lat = parseFloat(latVal.toFixed(6))
    const lng = parseFloat(lngVal.toFixed(6))
    markerPosRef.current = [lat, lng]
    setMarkerPos([lat, lng])
    setShowSuggestions(false)
    setSuggestions([])
    seleccionado.current = true
    setMapCmd(prev => ({ type: "flyTo", center: [lat, lng], zoom: 15, trigger: prev.trigger + 1 }))
    setIsGeocoding(true)
    try {
      const url  = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=es`
      const res  = await fetch(url)
      const data = await res.json() as MapboxResponse
      const feature        = data.features?.[0]
      const direccionStr   = feature?.text ?? ""
      const ciudadStr      = feature?.context?.find(c => c.id.startsWith("place"))?.text ?? ""
      const deptoDetectado = detectarDepartamento(lat, lng)
      setDireccion(direccionStr)
      setCiudad(ciudadStr)
      setQuery(feature?.place_name?.split(",")[0] ?? direccionStr)
      onChange({ lat, lng, direccion: direccionStr, ciudad: ciudadStr, pais: "Bolivia", departamento: deptoDetectado })
    } catch (e) {
      console.error("Mapbox reverse:", e)
    } finally {
      setIsGeocoding(false)
    }
  }, [onChange])

  const handleSuggestionClick = useCallback((f: MapboxFeature) => {
    const lng = f.center[0]; const lat = f.center[1]
    const direccionStr   = f.text ?? f.place_name.split(",")[0]
    const ciudadStr      = f.context?.find(c => c.id.startsWith("place"))?.text ?? ""
    const deptoDetectado = detectarDepartamento(lat, lng)
    seleccionado.current = true
    markerPosRef.current = [lat, lng]
    setShowSuggestions(false); setSuggestions([])
    setMarkerPos([lat, lng])
    if (f.bbox) {
      const [minLng, minLat, maxLng, maxLat] = f.bbox
      const latSpan = Math.abs(maxLat - minLat); const lngSpan = Math.abs(maxLng - minLng)
      if (latSpan > 0.02 || lngSpan > 0.02) {
        const bounds: [[number,number],[number,number]] = [[minLat, minLng], [maxLat, maxLng]]
        setMapCmd(prev => ({ type: "fitBounds", bounds, trigger: prev.trigger + 1 }))
      } else {
        setMapCmd(prev => ({ type: "flyTo", center: [lat, lng], zoom: 15, trigger: prev.trigger + 1 }))
      }
    } else {
      setMapCmd(prev => ({ type: "flyTo", center: [lat, lng], zoom: 15, trigger: prev.trigger + 1 }))
    }
    setQuery(f.place_name.split(",")[0]); setDireccion(direccionStr); setCiudad(ciudadStr)
    onChange({ lat, lng, direccion: direccionStr, ciudad: ciudadStr, pais: "Bolivia", departamento: deptoDetectado })
  }, [onChange])

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seleccionado.current = false
    setQuery(e.target.value)
  }

  const inputClass        = "h-9 px-3 text-sm rounded-md border border-border bg-background text-foreground outline-none w-full placeholder:text-muted-foreground focus:border-primary transition-colors"
  const inputReadonlyClass = "h-9 px-3 text-sm rounded-md border border-border bg-muted outline-none w-full overflow-hidden text-ellipsis whitespace-nowrap"

  return (
    <div className="flex flex-col gap-2.5">

      {/* Buscador */}
      <div className="relative z-[10000]">
        <label className="text-xs font-medium text-foreground mb-0.5 block">
          Buscar dirección
          {isGeocoding && <span className="text-muted-foreground font-normal"> — obteniendo dirección...</span>}
          {isSearching && !isGeocoding && <span className="text-muted-foreground font-normal"> — buscando...</span>}
        </label>
        <input
          value={query}
          onChange={handleQueryChange}
          onFocus={() => { if (!seleccionado.current && suggestions.length > 0) setShowSuggestions(true) }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Ej: Av. Blanco Galindo"
          className={inputClass}
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md z-[99999] shadow-lg mt-0.5 max-h-[220px] overflow-y-auto">
            {suggestions.map((f, i) => (
              <div
                key={f.id}
                onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(f) }}
                className={`flex items-start gap-2 px-3 py-2.5 text-sm text-foreground cursor-pointer hover:bg-muted transition-colors ${
                  i < suggestions.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <svg width="12" height="14" viewBox="0 0 24 24" fill="var(--secondary)" className="flex-shrink-0 mt-0.5">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <div className="min-w-0">
                  <div className="font-medium truncate">{f.text}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{f.place_name}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showSuggestions && suggestions.length === 0 && query.length >= 2 && !isSearching && (
          <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md z-[99999] mt-0.5 px-3 py-3 text-sm text-muted-foreground text-center">
            Sin resultados. Intenta hacer clic directamente en el mapa.
          </div>
        )}
      </div>

      {/* Mapa */}
      <div className="relative rounded-lg overflow-hidden border border-border z-[1]" style={{ height: 230 }}>
        {isLoading && (
          <div className="absolute inset-0 z-[999] bg-background flex items-center justify-center text-sm text-foreground rounded-lg">
            Cargando mapa...
          </div>
        )}
        <MapContainer
          center={initialCenter}
          zoom={initialZoom}
          zoomSnap={0.25}
          zoomDelta={0.5}
          wheelPxPerZoomLevel={60}
          style={{ height: "100%", width: "100%", cursor: "crosshair" }}
          zoomControl={true}
          zoomAnimation={true}
          fadeAnimation={true}
          markerZoomAnimation={true}
          whenReady={handleMapReady}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <ClickHandler onLocationSelect={handleMapClick} />
          <MapController cmd={mapCmd} />
          {markerPos && <Marker position={markerPos} />}
        </MapContainer>
      </div>

      <p className="text-[11px] text-muted-foreground m-0">
        Busca una dirección arriba o haz clic directamente en el mapa
      </p>

      {/* Dirección y ciudad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-foreground block">Dirección seleccionada</label>
          <input
            readOnly value={direccion} placeholder="—"
            className={`${inputReadonlyClass} ${direccion ? 'text-foreground' : 'text-muted-foreground'}`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-foreground block">Ciudad</label>
          <input
            readOnly value={ciudad} placeholder="—"
            className={`${inputReadonlyClass} ${ciudad ? 'text-foreground' : 'text-muted-foreground'}`}
          />
        </div>
      </div>

    </div>
  )
}