"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const DEPARTAMENTOS: Record<string, [number, number]> = {
  "cochabamba": [-17.3943, -66.1569],
  "la paz":     [-16.5000, -68.1193],
  "santa cruz": [-17.7833, -63.1821],
  "oruro":      [-17.9833, -67.1500],
  "potosi":     [-19.5836, -65.7531],
  "sucre":      [-19.0431, -65.2592],
  "tarija":     [-21.5355, -64.7296],
  "beni":       [-14.8333, -64.9000],
  "pando":      [-11.0289, -68.7692],
}

const getCenter = (ciudad?: string): [number, number] => {
  if (!ciudad) return DEPARTAMENTOS["cochabamba"]
  const key = ciudad.toLowerCase()
  return DEPARTAMENTOS[key] ?? DEPARTAMENTOS["cochabamba"]
}

function FlyToCenter({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, 13, { duration: 1.5 })
  }, [center, map])
  return null
}

function ClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    }
  })
  return null
}

interface LocationData {
  lat: number
  lng: number
  direccion: string
  ciudad: string
  pais: string
}

interface Suggestion {
  display_name: string
  lat: string
  lon: string
  address: {
    road?: string
    house_number?: string
    city?: string
    town?: string
    village?: string
    county?: string
    country?: string
  }
}

interface LocationPickerProps {
  ciudadUsuario?: string
  onChange: (data: LocationData) => void
}

export default function LocationPicker({ ciudadUsuario, onChange }: LocationPickerProps) {
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null)
  const [center, setCenter] = useState<[number, number]>(getCenter(ciudadUsuario))
  const [isLoading, setIsLoading] = useState(true)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [direccion, setDireccion] = useState<string>("")
  const [ciudad, setCiudad] = useState<string>("")
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [pais, setPais] = useState<string>("")
  const [query, setQuery] = useState<string>("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    setCenter(getCenter(ciudadUsuario))
  }, [ciudadUsuario])

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=bo&accept-language=es`
        )
        const data = await res.json()
        setSuggestions(Array.isArray(data) ? data : [])
        setShowSuggestions(true)
      } catch (e) {
        console.error("Error en autocompletado:", e)
      }
    }, 400)
  }, [query])

  const handleMapClick = async (latVal: number, lngVal: number) => {
    const latFixed = parseFloat(latVal.toFixed(6))
    const lngFixed = parseFloat(lngVal.toFixed(6))
    setMarkerPos([latFixed, lngFixed])
    setIsGeocoding(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latFixed}&lon=${lngFixed}&format=json`,
        { headers: { "Accept-Language": "es" } }
      )
      const data = await res.json()
      const addr = data.address
      const direccionStr = [addr?.road, addr?.house_number].filter(Boolean).join(" ") || data.display_name.split(",")[0]
      const ciudadStr = addr?.city || addr?.town || addr?.village || addr?.county || ""
      const paisStr = addr?.country || ""
      setDireccion(direccionStr)
      setCiudad(ciudadStr)
      setLat(latFixed)
      setLng(lngFixed)
      setPais(paisStr)
      setQuery(direccionStr)
      onChange({ lat: latFixed, lng: lngFixed, direccion: direccionStr, ciudad: ciudadStr, pais: paisStr })
    } catch (e) {
      console.error("Error en geocodificación:", e)
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleSuggestionClick = (s: Suggestion) => {
    const latVal = parseFloat(parseFloat(s.lat).toFixed(6))
    const lngVal = parseFloat(parseFloat(s.lon).toFixed(6))
    const addr = s.address
    const direccionStr = [addr?.road, addr?.house_number].filter(Boolean).join(" ") || s.display_name.split(",")[0]
    const ciudadStr = addr?.city || addr?.town || addr?.village || addr?.county || ""
    const paisStr = addr?.country || ""
    const displayStr = [direccionStr, ciudadStr].filter(Boolean).join(", ")
    setMarkerPos([latVal, lngVal])
    setCenter([latVal, lngVal])
    setQuery(displayStr)
    setDireccion(direccionStr)
    setCiudad(ciudadStr)
    setPais(paisStr)
    setLat(latVal)
    setLng(lngVal)
    onChange({ lat: latVal, lng: lngVal, direccion: direccionStr, ciudad: ciudadStr, pais: paisStr })
    setShowSuggestions(false)
  }

  const inputStyle = {
    height: 36,
    padding: "0 12px",
    fontSize: 13,
    borderRadius: 6,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#334155",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const
  }

  const labelStyle = {
    fontSize: 12,
    fontWeight: 500 as const,
    color: "#64748b"
  }

  if (isLoading) return (
    <div style={{ height: 256, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", borderRadius: 8 }}>
      Cargando mapa...
    </div>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* BUSCADOR CON AUTOCOMPLETADO */}
      <div style={{ position: "relative", zIndex: 9999 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={labelStyle}>
            Buscar dirección {isGeocoding && <span style={{ color: "#94a3b8", fontWeight: 400 }}>— buscando...</span>}
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Ej: Av. Blanco Galindo"
            style={inputStyle}
          />
        </div>

        {/* DROPDOWN */}
        {showSuggestions && suggestions.length > 0 && (
          <div style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: 6,
            zIndex: 99999,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            marginTop: 4,
            maxHeight: 200,
            overflowY: "auto"
          }}>
            {suggestions.map((s, i) => (
              <div
                key={i}
                onMouseDown={() => handleSuggestionClick(s)}
                style={{
                  padding: "8px 12px",
                  fontSize: 13,
                  color: "#334155",
                  cursor: "pointer",
                  borderBottom: i < suggestions.length - 1 ? "1px solid #f1f5f9" : "none",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={e => (e.currentTarget.style.background = "white")}
              >
                {s.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MAPA */}
      <div style={{ height: 256, borderRadius: 8, overflow: "hidden", border: "1px solid #e2e8f0" }}>
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%", cursor: "crosshair" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickHandler onLocationSelect={handleMapClick} />
          <FlyToCenter center={center} />
          {markerPos && <Marker position={markerPos} />}
        </MapContainer>
      </div>

      <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
        Busca una dirección o haz clic en el mapa para marcar la ubicación
      </p>

      {/* SOLO DIRECCIÓN Y CIUDAD VISIBLES */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={labelStyle}>Dirección</label>
        <input readOnly value={direccion} placeholder="—" style={inputStyle} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={labelStyle}>Ciudad</label>
        <input readOnly value={ciudad} placeholder="—" style={inputStyle} />
      </div>

    </div>
  )
}