"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const DEFAULT_CENTER: [number, number] = [-17.3943, -66.1569];

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

interface LocationPickerProps {
  onChange: (data: LocationData) => void
}

export default function LocationPicker({ onChange }: LocationPickerProps) {
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null)
  const [lat, setLat] = useState<string>("")
  const [lng, setLng] = useState<string>("")
  const [direccion, setDireccion] = useState<string>("")
  const [ciudad, setCiudad] = useState<string>("")
  const [pais, setPais] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isGeocoding, setIsGeocoding] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleClick = async (lat: number, lng: number) => {
    const latFixed = parseFloat(lat.toFixed(6))
    const lngFixed = parseFloat(lng.toFixed(6))
    setMarkerPos([latFixed, lngFixed])
    setLat(latFixed.toString())
    setLng(lngFixed.toString())
    setDireccion("")
    setCiudad("")
    setPais("")
    setIsGeocoding(true)

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latFixed}&lon=${lngFixed}&format=json`,
        { headers: { "Accept-Language": "es" } }
      )
      const data = await res.json()
      const addr = data.address

      const direccionStr = [addr.road, addr.house_number].filter(Boolean).join(" ") || data.display_name.split(",")[0]
      const ciudadStr = addr.city || addr.town || addr.village || addr.county || ""
      const paisStr = addr.country || ""

      setDireccion(direccionStr)
      setCiudad(ciudadStr)
      setPais(paisStr)

      onChange({
        lat: latFixed,
        lng: lngFixed,
        direccion: direccionStr,
        ciudad: ciudadStr,
        pais: paisStr
      })
    } catch (e) {
      console.error("Error al obtener dirección:", e)
    } finally {
      setIsGeocoding(false)
    }
  }

  const inputStyle = {
    height: 36,
    padding: "0 12px",
    fontSize: 13,
    fontFamily: "monospace",
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

      {/* MAPA */}
      <div style={{ height: 256, borderRadius: 8, overflow: "hidden", border: "1px solid #e2e8f0" }}>
        <MapContainer center={DEFAULT_CENTER} zoom={15} style={{ height: "100%", width: "100%", cursor: "crosshair" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickHandler onLocationSelect={handleClick} />
          {markerPos && <Marker position={markerPos} />}
        </MapContainer>
      </div>

      <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
        Haz clic en el mapa para marcar la ubicación del inmueble
      </p>

      {/* LATITUD Y LONGITUD */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={labelStyle}>Latitud</label>
          <input readOnly value={lat} placeholder="—" style={inputStyle} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={labelStyle}>Longitud</label>
          <input readOnly value={lng} placeholder="—" style={inputStyle} />
        </div>
      </div>

      {/* DIRECCIÓN */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={labelStyle}>Dirección {isGeocoding && <span style={{ color: "#94a3b8", fontWeight: 400 }}>— buscando...</span>}</label>
        <input readOnly value={direccion} placeholder="—" style={inputStyle} />
      </div>

      {/* CIUDAD Y PAÍS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={labelStyle}>Ciudad</label>
          <input readOnly value={ciudad} placeholder="—" style={inputStyle} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={labelStyle}>País</label>
          <input readOnly value={pais} placeholder="—" style={inputStyle} />
        </div>
      </div>

    </div>
  )
}