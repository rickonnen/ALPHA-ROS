"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import {
  createPoiLeafletIcon,
  createPropertyLeafletIcon,
} from "@/lib/pointOfInterestIcons"

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
    if (dist < minDist) {
      minDist = dist
      closest = nombre
    }
  }
  return closest
}

const getCenter = (depto?: string): [number, number] => {
  if (!depto) return DEPTO_COORDS["Cochabamba"]
  const entry = Object.entries(DEPTO_COORDS).find(
    ([key]) => key.toLowerCase() === depto.toLowerCase(),
  )
  return entry ? entry[1] : DEPTO_COORDS["Cochabamba"]
}

type MapCommand =
  | { type: "flyTo"; center: [number, number]; zoom: number; trigger: number }
  | { type: "fitBounds"; bounds: [[number, number], [number, number]]; trigger: number }

function MapController({ cmd }: { cmd: MapCommand }) {
  const map = useMap()
  const prev = useRef<number>(-1)

  useEffect(() => {
    if (cmd.trigger === prev.current) return
    prev.current = cmd.trigger

    if (cmd.type === "flyTo") {
      map.flyTo(cmd.center, cmd.zoom, { animate: true, duration: 0.8 })
      return
    }

    map.flyToBounds(cmd.bounds, {
      animate: true,
      duration: 0.8,
      maxZoom: 15,
      padding: [30, 30],
    })
  }, [cmd, map])

  return null
}

function ClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onLocationSelect(event.latlng.lat, event.latlng.lng)
    },
  })
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

interface MapboxContext {
  id: string
  text: string
}

interface MapboxFeature {
  id: string
  place_name: string
  text: string
  center: [number, number]
  bbox?: [number, number, number, number]
  context?: MapboxContext[]
}

interface MapboxResponse {
  features: MapboxFeature[]
}

interface ReferenceMarker {
  id: string
  lat: number
  lng: number
  label: string
  descripcion?: string | null
  tipoNombre?: string | null
  icon?: string | null
  color?: string | null
  kind?: "property" | "poi"
}

interface LocationPickerProps {
  deptoActual?: string
  onChange: (data: LocationData) => void
  initialLocation?: LocationData | null
  mapFocusLocation?: LocationData | null
  showSearch?: boolean
  showLocationSummary?: boolean
  referenceMarkers?: ReferenceMarker[]
  selectedMarkerStyle?: {
    icon?: string | null
    color?: string | null
    tipoNombre?: string | null
  } | null
}

export default function LocationPicker({
  deptoActual,
  onChange,
  initialLocation = null,
  mapFocusLocation = null,
  showSearch = true,
  showLocationSummary = true,
  referenceMarkers = [],
  selectedMarkerStyle = null,
}: LocationPickerProps) {
  const initialMapFocusPos =
    initialLocation
      ? ([initialLocation.lat, initialLocation.lng] as [number, number])
      : mapFocusLocation
        ? ([mapFocusLocation.lat, mapFocusLocation.lng] as [number, number])
        : null
  const initialMarkerPos =
    initialLocation
      ? ([initialLocation.lat, initialLocation.lng] as [number, number])
      : null

  const [markerPos, setMarkerPos] = useState<[number, number] | null>(initialMarkerPos)
  const [mapCmd, setMapCmd] = useState<MapCommand>({
    type: "flyTo",
    center: initialMapFocusPos ?? getCenter(deptoActual),
    zoom: initialMapFocusPos ? 15 : 13,
    trigger: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [direccion, setDireccion] = useState(initialLocation?.direccion ?? "")
  const [ciudad, setCiudad] = useState(initialLocation?.ciudad ?? "")
  const [query, setQuery] = useState(initialLocation?.direccion ?? "")
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevDepto = useRef(deptoActual)
  const seleccionado = useRef(Boolean(initialLocation))
  const markerPosRef = useRef<[number, number] | null>(initialMarkerPos)

  useEffect(() => {
    loadingTimerRef.current = setTimeout(() => setIsLoading(false), 800)
    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current)
    }
  }, [])

  const handleMapReady = useCallback(() => {
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (deptoActual === prevDepto.current) return
    prevDepto.current = deptoActual
    if (markerPosRef.current) return
    setMapCmd((prev) => ({
      type: "flyTo",
      center: getCenter(deptoActual),
      zoom: 12,
      trigger: prev.trigger + 1,
    }))
  }, [deptoActual])

  useEffect(() => {
    if (!showSearch) return
    if (seleccionado.current) return
    if (query.length < 2) return
    if (searchTimer.current) clearTimeout(searchTimer.current)

    searchTimer.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const center = getCenter(deptoActual)
        const bbox = deptoActual && DEPTO_BBOX[deptoActual]
          ? DEPTO_BBOX[deptoActual].join(",")
          : "-69.6,-22.9,-57.5,-9.7"
        const proximity = `${center[1]},${center[0]}`

        const url =
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
          `?access_token=${MAPBOX_TOKEN}` +
          `&country=bo` +
          `&language=es` +
          `&limit=6` +
          `&proximity=${proximity}` +
          `&bbox=${bbox}`

        const response = await fetch(url)
        const data = await response.json() as MapboxResponse
        setSuggestions(Array.isArray(data.features) ? data.features : [])
        setShowSuggestions(true)
      } catch (error) {
        console.error("Mapbox autocompletado:", error)
      } finally {
        setIsSearching(false)
      }
    }, 350)
  }, [query, deptoActual, showSearch])

  const handleMapClick = useCallback(async (latValue: number, lngValue: number) => {
    const lat = parseFloat(latValue.toFixed(6))
    const lng = parseFloat(lngValue.toFixed(6))

    markerPosRef.current = [lat, lng]
    setMarkerPos([lat, lng])
    setShowSuggestions(false)
    setSuggestions([])
    seleccionado.current = true
    setMapCmd((prev) => ({
      type: "flyTo",
      center: [lat, lng],
      zoom: 15,
      trigger: prev.trigger + 1,
    }))
    setIsGeocoding(true)

    try {
      const url =
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json` +
        `?access_token=${MAPBOX_TOKEN}&language=es`
      const response = await fetch(url)
      const data = await response.json() as MapboxResponse

      const feature = data.features?.[0]
      const direccionSeleccionada = feature?.text ?? ""
      const ciudadSeleccionada =
        feature?.context?.find((context) => context.id.startsWith("place"))?.text ?? ""
      const deptoDetectado = detectarDepartamento(lat, lng)

      setDireccion(direccionSeleccionada)
      setCiudad(ciudadSeleccionada)
      setQuery(feature?.place_name?.split(",")[0] ?? direccionSeleccionada)
      onChange({
        lat,
        lng,
        direccion: direccionSeleccionada,
        ciudad: ciudadSeleccionada,
        pais: "Bolivia",
        departamento: deptoDetectado,
      })
    } catch (error) {
      console.error("Mapbox reverse:", error)
    } finally {
      setIsGeocoding(false)
    }
  }, [onChange])

  const handleSuggestionClick = useCallback((feature: MapboxFeature) => {
    const lng = feature.center[0]
    const lat = feature.center[1]
    const direccionSeleccionada = feature.text ?? feature.place_name.split(",")[0]
    const ciudadSeleccionada =
      feature.context?.find((context) => context.id.startsWith("place"))?.text ?? ""
    const deptoDetectado = detectarDepartamento(lat, lng)

    seleccionado.current = true
    markerPosRef.current = [lat, lng]
    setShowSuggestions(false)
    setSuggestions([])
    setMarkerPos([lat, lng])

    if (feature.bbox) {
      const [minLng, minLat, maxLng, maxLat] = feature.bbox
      const latSpan = Math.abs(maxLat - minLat)
      const lngSpan = Math.abs(maxLng - minLng)
      if (latSpan > 0.02 || lngSpan > 0.02) {
        setMapCmd((prev) => ({
          type: "fitBounds",
          bounds: [[minLat, minLng], [maxLat, maxLng]],
          trigger: prev.trigger + 1,
        }))
      } else {
        setMapCmd((prev) => ({
          type: "flyTo",
          center: [lat, lng],
          zoom: 15,
          trigger: prev.trigger + 1,
        }))
      }
    } else {
      setMapCmd((prev) => ({
        type: "flyTo",
        center: [lat, lng],
        zoom: 15,
        trigger: prev.trigger + 1,
      }))
    }

    setQuery(feature.place_name.split(",")[0])
    setDireccion(direccionSeleccionada)
    setCiudad(ciudadSeleccionada)
    onChange({
      lat,
      lng,
      direccion: direccionSeleccionada,
      ciudad: ciudadSeleccionada,
      pais: "Bolivia",
      departamento: deptoDetectado,
    })
  }, [onChange])

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    seleccionado.current = false
    const nextQuery = event.target.value
    setQuery(nextQuery)
    if (nextQuery.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const C = {
    crema: "#F4EFE6",
    terracota: "#C26E5A",
    marino: "#1F3A4D",
    borde: "#D4CFC6",
    texto: "#2E2E2E",
    subtexto: "#2E2E2E",
  }

  const inputStyle: React.CSSProperties = {
    height: 36,
    padding: "0 12px",
    fontSize: 13,
    borderRadius: 6,
    border: `1px solid ${C.borde}`,
    background: "#ffffff",
    color: C.texto,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 500,
    color: C.subtexto,
    marginBottom: 2,
    display: "block",
  }

  const selectedMarkerIcon = selectedMarkerStyle
    ? createPoiLeafletIcon({
        icon: selectedMarkerStyle.icon,
        color: selectedMarkerStyle.color,
        tipoNombre: selectedMarkerStyle.tipoNombre,
        size: 34,
      })
    : undefined

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {showSearch && (
        <div style={{ position: "relative", zIndex: 10000 }}>
          <label style={labelStyle}>
            Buscar dirección
            {isGeocoding && <span style={{ color: "#888", fontWeight: 400 }}> - obteniendo dirección...</span>}
            {isSearching && !isGeocoding && <span style={{ color: "#888", fontWeight: 400 }}> - buscando...</span>}
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
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#ffffff",
                border: `1px solid ${C.borde}`,
                borderRadius: 6,
                zIndex: 99999,
                boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                marginTop: 3,
                maxHeight: 220,
                overflowY: "auto",
              }}
            >
              {suggestions.map((feature, index) => (
                <div
                  key={feature.id}
                  onMouseDown={(event) => {
                    event.preventDefault()
                    handleSuggestionClick(feature)
                  }}
                  style={{
                    padding: "10px 12px",
                    fontSize: 13,
                    color: C.texto,
                    cursor: "pointer",
                    borderBottom: index < suggestions.length - 1 ? `1px solid ${C.crema}` : "none",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                  onMouseEnter={(event) => { event.currentTarget.style.background = C.crema }}
                  onMouseLeave={(event) => { event.currentTarget.style.background = "#ffffff" }}
                >
                  <svg width="12" height="14" viewBox="0 0 24 24" fill={C.terracota} style={{ flexShrink: 0, marginTop: 2 }}>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {feature.text}
                    </div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {feature.place_name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showSuggestions && suggestions.length === 0 && query.length >= 2 && !isSearching && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#ffffff",
                border: `1px solid ${C.borde}`,
                borderRadius: 6,
                zIndex: 99999,
                marginTop: 3,
                padding: "12px",
                fontSize: 13,
                color: "#888",
                textAlign: "center",
              }}
            >
              Sin resultados. Intenta hacer clic directamente en el mapa.
            </div>
          )}
        </div>
      )}

      <div
        style={{
          height: 230,
          borderRadius: 8,
          overflow: "hidden",
          border: `1.5px solid ${C.borde}`,
          position: "relative",
          zIndex: 1,
        }}
      >
        {isLoading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 999,
              background: C.crema,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              color: C.subtexto,
              borderRadius: 8,
            }}
          >
            Cargando mapa...
          </div>
        )}
        <MapContainer
          center={initialMapFocusPos ?? getCenter(deptoActual)}
          zoom={initialMapFocusPos ? 15 : 13}
          zoomSnap={0.25}
          zoomDelta={0.5}
          wheelPxPerZoomLevel={60}
          style={{ height: "100%", width: "100%", cursor: "crosshair" }}
          zoomControl
          zoomAnimation
          fadeAnimation
          markerZoomAnimation
          whenReady={handleMapReady}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <ClickHandler onLocationSelect={handleMapClick} />
          <MapController cmd={mapCmd} />
          {referenceMarkers.map((marker) => (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={
                marker.kind === "property"
                  ? createPropertyLeafletIcon()
                  : createPoiLeafletIcon({
                      icon: marker.icon,
                      color: marker.color,
                      tipoNombre: marker.tipoNombre,
                      size: 30,
                    })
              }
            >
              <Popup>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <strong style={{ fontSize: 13, color: C.marino }}>{marker.label}</strong>
                  {marker.tipoNombre && (
                    <span style={{ fontSize: 12, color: marker.color || C.terracota }}>
                      {marker.tipoNombre}
                    </span>
                  )}
                  {marker.descripcion && (
                    <span style={{ fontSize: 12, color: "#64748b" }}>{marker.descripcion}</span>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
          {markerPos && (
            <Marker
              position={markerPos}
              {...(selectedMarkerIcon ? { icon: selectedMarkerIcon } : {})}
            >
              <Popup>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <strong style={{ fontSize: 13, color: C.marino }}>
                    Punto seleccionado
                  </strong>
                  {selectedMarkerStyle?.tipoNombre && (
                    <span style={{ fontSize: 12, color: selectedMarkerStyle.color || C.terracota }}>
                      {selectedMarkerStyle.tipoNombre}
                    </span>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {showSearch && (
        <p style={{ fontSize: 11, color: C.subtexto, margin: 0 }}>
          Busca una dirección arriba o haz clic directamente en el mapa
        </p>
      )}

      {showLocationSummary && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }} className="sm:grid-cols-2">
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={labelStyle}>Dirección seleccionada</label>
            <input
              readOnly
              value={direccion}
              placeholder="-"
              style={{
                ...inputStyle,
                background: C.crema,
                color: direccion ? C.texto : C.subtexto,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={labelStyle}>Ciudad</label>
            <input
              readOnly
              value={ciudad}
              placeholder="-"
              style={{
                ...inputStyle,
                background: C.crema,
                color: ciudad ? C.texto : C.subtexto,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
