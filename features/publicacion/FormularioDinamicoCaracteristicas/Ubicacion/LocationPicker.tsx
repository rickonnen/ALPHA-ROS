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

const DEPTO_COORDS: Record<string, [number, number]> = {
  "Cochabamba": [-17.3943, -66.1569],
  "La Paz":     [-16.5000, -68.1193],
  "Santa Cruz": [-17.7833, -63.1821],
  "Oruro":      [-17.9833, -67.1500],
  "Potosí":     [-19.5836, -65.7531],
  "Sucre":      [-19.0431, -65.2592],
  "Chuquisaca": [-19.0431, -65.2592],
  "Tarija":     [-21.5355, -64.7296],
  "Beni":       [-14.8333, -64.9000],
  "Pando":      [-11.0289, -68.7692],
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
  | { type: "flyTo";     center: [number, number]; zoom: number;                        trigger: number }
  | { type: "fitBounds"; bounds: [[number,number],[number,number]];                     trigger: number }
  | { type: "setCenter"; center: [number, number]; zoom: number;                        trigger: number }

function MapController({ cmd }: { cmd: MapCommand }) {
  const map  = useMap()
  const prev = useRef<number>(-1)

  useEffect(() => {
    if (cmd.trigger === prev.current) return
    prev.current = cmd.trigger

    if (cmd.type === "flyTo") {
      map.setView(cmd.center, cmd.zoom, { animate: false })
    } else if (cmd.type === "fitBounds") {
      map.setView(cmd.bounds[0], 10, { animate: false })
      setTimeout(() => {
        map.fitBounds(cmd.bounds, { animate: true, duration: 0.6, maxZoom: 15, padding: [30, 30] })
      }, 50)
    } else if (cmd.type === "setCenter") {
      map.setView(cmd.center, cmd.zoom, { animate: false })
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

interface Suggestion {
  display_name: string
  lat:          string
  lon:          string
  boundingbox:  [string, string, string, string]
  address: {
    road?:         string
    house_number?: string
    city?:         string
    town?:         string
    village?:      string
    county?:       string
    country?:      string
    state?:        string
  }
}

interface NominatimReverse {
  display_name: string
  address: Suggestion["address"]
}

interface LocationPickerProps {
  deptoActual?: string
  onChange:     (data: LocationData) => void
}

export default function LocationPicker({ deptoActual, onChange }: LocationPickerProps) {
  const [markerPos,       setMarkerPos]       = useState<[number, number] | null>(null)
  const [mapCmd,          setMapCmd]          = useState<MapCommand>({
    type: "setCenter", center: getCenter(deptoActual), zoom: 13, trigger: 0,
  })
  const [isLoading,       setIsLoading]       = useState(true)
  const [isGeocoding,     setIsGeocoding]     = useState(false)
  const [direccion,       setDireccion]       = useState("")
  const [ciudad,          setCiudad]          = useState("")
  const [query,           setQuery]           = useState("")
  const [suggestions,     setSuggestions]     = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevDepto    = useRef(deptoActual)
  const seleccionado = useRef(false)

  const initialCenter = useRef<[number, number]>(getCenter(deptoActual))
  const initialZoom   = useRef(13)

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 400)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (deptoActual === prevDepto.current) return
    prevDepto.current = deptoActual
    setMapCmd(prev => ({
      type: "setCenter", center: getCenter(deptoActual), zoom: 12, trigger: prev.trigger + 1,
    }))
  }, [deptoActual])

  useEffect(() => {
    if (seleccionado.current) return
    if (query.length < 3) { setSuggestions([]); setShowSuggestions(false); return }
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      try {
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=bo&accept-language=es`
        )
        const data = await res.json() as Suggestion[]
        setSuggestions(Array.isArray(data) ? data : [])
        setShowSuggestions(true)
      } catch (e) {
        console.error("Autocompletado:", e)
      }
    }, 400)
  }, [query])

  const handleMapClick = useCallback(async (latVal: number, lngVal: number) => {
    const lat = parseFloat(latVal.toFixed(6))
    const lng = parseFloat(lngVal.toFixed(6))
    setMarkerPos([lat, lng])
    setShowSuggestions(false)
    setSuggestions([])
    seleccionado.current = true
    setMapCmd(prev => ({ type: "flyTo", center: [lat, lng], zoom: 15, trigger: prev.trigger + 1 }))
    setIsGeocoding(true)
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "es" } }
      )
      const data         = await res.json() as NominatimReverse
      const addr         = data.address
      const direccionStr = [addr?.road, addr?.house_number].filter(Boolean).join(" ") || data.display_name.split(",")[0]
      const ciudadStr    = addr?.city || addr?.town || addr?.village || addr?.county || ""
      const paisStr      = addr?.country || ""
      const depto        = detectarDepartamento(lat, lng)
      setDireccion(direccionStr)
      setCiudad(ciudadStr)
      setQuery(direccionStr)
      onChange({ lat, lng, direccion: direccionStr, ciudad: ciudadStr, pais: paisStr, departamento: depto })
    } catch (e) {
      console.error("Geocodificación inversa:", e)
    } finally {
      setIsGeocoding(false)
    }
  }, [onChange])

  const handleSuggestionClick = useCallback((s: Suggestion) => {
    const lat = parseFloat(parseFloat(s.lat).toFixed(6))
    const lng = parseFloat(parseFloat(s.lon).toFixed(6))
    const addr         = s.address
    const direccionStr = [addr?.road, addr?.house_number].filter(Boolean).join(" ") || s.display_name.split(",")[0]
    const ciudadStr    = addr?.city || addr?.town || addr?.village || addr?.county || ""
    const paisStr      = addr?.country || ""
    const displayStr   = [direccionStr, ciudadStr].filter(Boolean).join(", ")
    const depto        = detectarDepartamento(lat, lng)

    seleccionado.current = true
    setShowSuggestions(false)
    setSuggestions([])
    setMarkerPos([lat, lng])

    const bb      = s.boundingbox
    const minLat  = parseFloat(bb[0])
    const maxLat  = parseFloat(bb[1])
    const minLng  = parseFloat(bb[2])
    const maxLng  = parseFloat(bb[3])
    const latSpan = Math.abs(maxLat - minLat)
    const lngSpan = Math.abs(maxLng - minLng)
    const bboxIsTooBig = latSpan > 0.02 || lngSpan > 0.02

    if (bboxIsTooBig) {
      setMapCmd(prev => ({ type: "flyTo", center: [lat, lng], zoom: 15, trigger: prev.trigger + 1 }))
    } else {
      const bounds: [[number, number], [number, number]] = [[minLat, minLng], [maxLat, maxLng]]
      setMapCmd(prev => ({ type: "fitBounds", bounds, trigger: prev.trigger + 1 }))
    }

    setQuery(displayStr)
    setDireccion(direccionStr)
    setCiudad(ciudadStr)
    onChange({ lat, lng, direccion: direccionStr, ciudad: ciudadStr, pais: paisStr, departamento: depto })
  }, [onChange])

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seleccionado.current = false
    setQuery(e.target.value)
  }

  const C = {
    crema:     "#F4EFE6",
    terracota: "#C26E5A",
    marino:    "#1F3A4D",
    borde:     "#D4CFC6",
    texto:     "#2E2E2E",
    subtexto:  "#2E2E2E",
  }

  const inputStyle: React.CSSProperties = {
    height: 36, padding: "0 12px", fontSize: 13, borderRadius: 6,
    border: `1px solid ${C.borde}`, background: "#ffffff",
    color: C.texto, outline: "none", width: "100%", boxSizing: "border-box",
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 500, color: C.subtexto, marginBottom: 2, display: "block",
  }

  if (isLoading) return (
    <div style={{ height: 260, background: C.crema, display: "flex", alignItems: "center",
      justifyContent: "center", color: C.subtexto, borderRadius: 8, fontSize: 13 }}>
      Cargando mapa...
    </div>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Buscador */}
      <div style={{ position: "relative", zIndex: 10000 }}>
        <label style={labelStyle}>
          Buscar dirección
          {isGeocoding && <span style={{ color: C.subtexto, fontWeight: 400 }}> — buscando...</span>}
        </label>
        <input
          value={query}
          onChange={handleQueryChange}
          onFocus={() => {
            if (!seleccionado.current && suggestions.length > 0) setShowSuggestions(true)
          }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Ej: Av. Blanco Galindo"
          style={inputStyle}
        />

        {showSuggestions && suggestions.length > 0 && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0,
            background: "#ffffff", border: `1px solid ${C.borde}`,
            borderRadius: 6, zIndex: 99999,
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            marginTop: 3, maxHeight: 200, overflowY: "auto",
          }}>
            {suggestions.map((s, i) => (
              <div
                key={i}
                onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(s) }}
                style={{
                  padding: "9px 12px", fontSize: 13, color: C.texto, cursor: "pointer",
                  borderBottom: i < suggestions.length - 1 ? `1px solid ${C.crema}` : "none",
                  display: "flex", alignItems: "flex-start", gap: 8,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.crema }}
                onMouseLeave={e => { e.currentTarget.style.background = "#ffffff" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill={C.terracota}
                  style={{ flexShrink: 0, marginTop: 2 }}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span style={{ lineHeight: 1.4 }}>{s.display_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mapa */}
      <div style={{
        height: 230, borderRadius: 8, overflow: "hidden",
        border: `1.5px solid ${C.borde}`, position: "relative", zIndex: 1,
      }}>
        <MapContainer
          center={initialCenter.current}
          zoom={initialZoom.current}
          style={{ height: "100%", width: "100%", cursor: "crosshair" }}
          zoomControl={true}
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

      <p style={{ fontSize: 11, color: C.subtexto, margin: 0 }}>
        Busca una dirección arriba o haz clic directamente en el mapa
      </p>

      {/* Dirección y ciudad — en columna en móvil, lado a lado en desktop */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 8,
      }}
        className="sm:grid-cols-2"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <label style={labelStyle}>Dirección seleccionada</label>
          <input readOnly value={direccion} placeholder="—" style={{
            ...inputStyle, background: C.crema,
            color: direccion ? C.texto : C.subtexto,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <label style={labelStyle}>Ciudad</label>
          <input readOnly value={ciudad} placeholder="—" style={{
            ...inputStyle, background: C.crema,
            color: ciudad ? C.texto : C.subtexto,
          }} />
        </div>
      </div>

    </div>
  )
}