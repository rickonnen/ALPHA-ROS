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

interface FlyConfig { center: [number, number]; zoom: number; trigger: number }

function FlyToCenter({ config }: { config: FlyConfig }) {
  const map  = useMap()
  const prev = useRef(config.trigger)
  useEffect(() => {
    if (config.trigger === prev.current) return
    prev.current = config.trigger
    map.flyTo(config.center, config.zoom, { duration: 1.2 })
  }, [config, map])
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
  const [flyConfig,       setFlyConfig]       = useState<FlyConfig>({
    center:  getCenter(deptoActual),
    zoom:    13,
    trigger: 0,
  })
  const [isLoading,       setIsLoading]       = useState(true)
  const [isGeocoding,     setIsGeocoding]     = useState(false)
  const [direccion,       setDireccion]       = useState("")
  const [ciudad,          setCiudad]          = useState("")
  const [query,           setQuery]           = useState("")
  const [suggestions,     setSuggestions]     = useState<Suggestion[]>([])
  // showSuggestions se cierra definitivamente al elegir una opción
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevDepto    = useRef(deptoActual)
  // true = el usuario ya eligió, no volver a mostrar sugerencias hasta que escriba de nuevo
  const seleccionado = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 400)
    return () => clearTimeout(t)
  }, [])

  // Cuando cambia el depto externo → vuela con zoom ciudad
  useEffect(() => {
    if (deptoActual === prevDepto.current) return
    prevDepto.current = deptoActual
    setFlyConfig(prev => ({
      center:  getCenter(deptoActual),
      zoom:    12,
      trigger: prev.trigger + 1,
    }))
  }, [deptoActual])

  // Autocompletado — solo si el usuario está escribiendo activamente
  useEffect(() => {
    if (seleccionado.current) return   // ya eligió, no buscar
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
    // Cerrar sugerencias al hacer click en el mapa
    setShowSuggestions(false)
    setSuggestions([])
    seleccionado.current = true
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

    // Marcar como seleccionado → bloquear nuevo autocompletado hasta que el usuario reescriba
    seleccionado.current = true
    setShowSuggestions(false)
    setSuggestions([])

    setMarkerPos([lat, lng])
    // zoom 15 = nivel calle, se ven cuadras claramente pero no tan extremo
    setFlyConfig(prev => ({ center: [lat, lng], zoom: 15, trigger: prev.trigger + 1 }))
    setQuery(displayStr)
    setDireccion(direccionStr)
    setCiudad(ciudadStr)
    onChange({ lat, lng, direccion: direccionStr, ciudad: ciudadStr, pais: paisStr, departamento: depto })
  }, [onChange])

  // Cuando el usuario modifica el texto manualmente → habilitar búsqueda de nuevo
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

      {/* Buscador — zIndex MUY alto para flotar sobre los controles del mapa */}
      <div style={{ position: "relative", zIndex: 10000 }}>
        <label style={labelStyle}>
          Buscar dirección
          {isGeocoding && <span style={{ color: C.subtexto, fontWeight: 400 }}> — buscando...</span>}
        </label>
        <input
          value={query}
          onChange={handleQueryChange}
          onFocus={() => {
            // Solo mostrar si no hubo selección previa y hay sugerencias
            if (!seleccionado.current && suggestions.length > 0) setShowSuggestions(true)
          }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Ej: Av. Blanco Galindo"
          style={inputStyle}
        />

        {/* Dropdown — zIndex altísimo, por encima de controles del mapa */}
        {showSuggestions && suggestions.length > 0 && (
          <div style={{
            position:  "absolute",
            top:       "100%",
            left:      0,
            right:     0,
            background:"#ffffff",
            border:    `1px solid ${C.borde}`,
            borderRadius: 6,
            zIndex:    99999,
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            marginTop: 3,
            maxHeight: 200,
            overflowY: "auto",
          }}>
            {suggestions.map((s, i) => (
              <div
                key={i}
                onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(s) }}
                style={{
                  padding:      "9px 12px",
                  fontSize:     13,
                  color:        C.texto,
                  cursor:       "pointer",
                  borderBottom: i < suggestions.length - 1 ? `1px solid ${C.crema}` : "none",
                  display:      "flex",
                  alignItems:   "flex-start",
                  gap:          8,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.crema }}
                onMouseLeave={e => { e.currentTarget.style.background = "#ffffff" }}
              >
                {/* Pin sin emoji — SVG puro */}
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

      {/* Mapa — zIndex normal, los controles +/- quedan bajo el dropdown */}
      <div style={{
        height: 270, borderRadius: 8, overflow: "hidden",
        border: `1.5px solid ${C.borde}`,
        position: "relative",
        zIndex: 1,   // menor que el buscador
      }}>
        <MapContainer
          center={flyConfig.center}
          zoom={flyConfig.zoom}
          style={{ height: "100%", width: "100%", cursor: "crosshair" }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <ClickHandler onLocationSelect={handleMapClick} />
          <FlyToCenter config={flyConfig} />
          {markerPos && <Marker position={markerPos} />}
        </MapContainer>
      </div>

      <p style={{ fontSize: 11, color: C.subtexto, margin: 0 }}>
        Busca una dirección arriba o haz clic directamente en el mapa
      </p>

      {/* Dirección y ciudad — readonly */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <label style={labelStyle}>Dirección seleccionada</label>
          <input readOnly value={direccion} placeholder="—" style={{
            ...inputStyle, background: C.crema,
            color: direccion ? C.texto : C.subtexto,
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