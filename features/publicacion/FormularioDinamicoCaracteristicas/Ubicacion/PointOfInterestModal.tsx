"use client"

import { useMemo, useRef, useState, useEffect } from "react"
import { createPortal } from "react-dom"
import dynamic from "next/dynamic"
import type {
  PuntoInteresForm,
  PuntoInteresTipoOption,
} from "./useUbicacionTypes"
import type { LocationData } from "./LocationPicker"
import {
  getPointOfInterestConstraintError,
  MAX_POINTS_OF_INTEREST,
  MAX_POINT_OF_INTEREST_DESCRIPTION_LENGTH,
  MAX_POINT_OF_INTEREST_NAME_LENGTH,
} from "@/lib/mapValidation"

const LocationPicker = dynamic(
  () => import("./LocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: 320,
          background: "#F4EFE6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6B7280",
          borderRadius: 8,
          fontSize: 13,
        }}
      >
        Cargando mapa...
      </div>
    ),
  },
)

type PointOfInterestModalProps = {
  onClose: () => void
  onSave: (value: PuntoInteresForm) => void
  types: PuntoInteresTipoOption[]
  departamentoActual?: string
  initialValue?: PuntoInteresForm | null
  propertyLocation?: LocationData | null
  existingPoints?: PuntoInteresForm[]
}

const C = {
  crema: "#F4EFE6",
  terracota: "#C26E5A",
  marino: "#1F3A4D",
  borde: "#D4CFC6",
  texto: "#1A1714",
}

function buildInitialLocation(value: PuntoInteresForm | null | undefined) {
  if (!value) return null

  return {
    lat: value.lat,
    lng: value.lng,
    direccion: value.direccion ?? value.nombre,
    ciudad: value.ciudad ?? "",
    pais: "Bolivia",
    departamento: "",
  } satisfies LocationData
}

function buildReferenceMarkers(
  propertyLocation: LocationData | null | undefined,
  existingPoints: PuntoInteresForm[],
) {
  const markers: {
    id: string
    lat: number
    lng: number
    label: string
    descripcion?: string | null
    tipoNombre?: string | null
    icon?: string | null
    color?: string | null
    kind?: "property" | "poi"
  }[] = []

  if (propertyLocation) {
    markers.push({
      id: "property-location",
      lat: propertyLocation.lat,
      lng: propertyLocation.lng,
      label: "Ubicación de la propiedad",
      descripcion: propertyLocation.direccion,
      kind: "property",
    })
  }

  existingPoints.forEach((point) => {
    markers.push({
      id: point.tempId,
      lat: point.lat,
      lng: point.lng,
      label: point.nombre,
      descripcion: point.direccion ?? point.descripcion,
      tipoNombre: point.tipo_nombre,
      icon: point.tipo_icono,
      color: point.tipo_color,
      kind: "poi",
    })
  })

  return markers
}

export default function PointOfInterestModal({
  onClose,
  onSave,
  types,
  departamentoActual,
  initialValue,
  propertyLocation = null,
  existingPoints = [],
}: PointOfInterestModalProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const initialPointLocation = useMemo(
    () => buildInitialLocation(initialValue),
    [initialValue],
  )
  const defaultLocation = useMemo(
    () => initialPointLocation ?? propertyLocation,
    [initialPointLocation, propertyLocation],
  )
  const [selectedTypeId, setSelectedTypeId] = useState<string>(
    initialValue?.id_tipo_poi ? String(initialValue.id_tipo_poi) : "",
  )
  const [nombre, setNombre] = useState(initialValue?.nombre ?? "")
  const [descripcion, setDescripcion] = useState(initialValue?.descripcion ?? "")
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    initialPointLocation,
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const selectedType = useMemo(
    () =>
      types.find((type) => String(type.id_tipo_poi) === selectedTypeId) ?? null,
    [selectedTypeId, types],
  )
  const referenceMarkers = useMemo(
    () => buildReferenceMarkers(propertyLocation, existingPoints),
    [propertyLocation, existingPoints],
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const validate = () => {
    const nextErrors: Record<string, string> = {}

    if (!selectedTypeId) {
      nextErrors.tipo = "Selecciona un tipo de referencia."
    }

    if (!nombre.trim()) {
      nextErrors.nombre = "Ingresa un nombre para el punto de interés."
    } else if (nombre.trim().length > MAX_POINT_OF_INTEREST_NAME_LENGTH) {
      nextErrors.nombre = `El nombre no puede superar ${MAX_POINT_OF_INTEREST_NAME_LENGTH} caracteres.`
    }

    if (descripcion.trim().length > MAX_POINT_OF_INTEREST_DESCRIPTION_LENGTH) {
      nextErrors.descripcion =
        `La descripción no puede superar ${MAX_POINT_OF_INTEREST_DESCRIPTION_LENGTH} caracteres.`
    }

    if (!selectedLocation) {
      nextErrors.ubicacion = "Selecciona la ubicación del punto en el mapa."
    }

    if (!propertyLocation) {
      nextErrors.ubicacion =
        "Primero define la ubicación principal de la propiedad."
    } else if (selectedLocation) {
      const pointConstraintError = getPointOfInterestConstraintError({
        propertyLat: propertyLocation.lat,
        propertyLng: propertyLocation.lng,
        pointLat: selectedLocation.lat,
        pointLng: selectedLocation.lng,
        existingPoints: existingPoints.map((point) => ({
          id: point.tempId,
          lat: point.lat,
          lng: point.lng,
        })),
        currentPointId: initialValue?.tempId,
      })

      if (pointConstraintError) {
        nextErrors.ubicacion = pointConstraintError
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleConfirm = () => {
    if (!validate() || !selectedLocation || !selectedType) return

    onSave({
      tempId: initialValue?.tempId ?? crypto.randomUUID(),
      id_tipo_poi: selectedType.id_tipo_poi,
      tipo_nombre: selectedType.nombre,
      tipo_icono: selectedType.icono ?? null,
      tipo_color: selectedType.color ?? null,
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      direccion: selectedLocation.direccion,
      ciudad: selectedLocation.ciudad,
    })
  }

  const modal = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px 16px",
        backgroundColor: "rgba(31,58,77,0.55)",
        overflow: "auto",
      }}
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          background: C.crema,
          borderRadius: 16,
          boxShadow: "0 8px 40px rgba(31,58,77,0.25)",
          width: "100%",
          maxWidth: 760,
          overflow: "visible",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: C.marino,
            borderRadius: "16px 16px 0 0",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                backgroundColor: C.terracota,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#ffffff",
                }}
              >
                {initialValue ? "Editar punto de interés" : "Agregar punto de interés"}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: "rgba(255,255,255,0.65)",
                }}
              >
                Parte desde la ubicación de la propiedad y marca el punto en el mapa.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.15)",
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>
            La propiedad aparece marcada en azul y los puntos existentes conservan su icono según el tipo.
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>
            Solo puedes registrar hasta {MAX_POINTS_OF_INTEREST} puntos, cerca de la propiedad y sin superponer marcadores.
          </p>
          <LocationPicker
            deptoActual={departamentoActual}
            onChange={setSelectedLocation}
            initialLocation={initialPointLocation}
            mapFocusLocation={defaultLocation}
            showSearch={false}
            showLocationSummary={false}
            referenceMarkers={referenceMarkers}
            selectedMarkerStyle={
              selectedType
                ? {
                    icon: selectedType.icono ?? null,
                    color: selectedType.color ?? null,
                    tipoNombre: selectedType.nombre,
                  }
                : null
            }
          />

          {errors.ubicacion && (
            <span style={{ color: "#ef4444", fontSize: 12 }}>{errors.ubicacion}</span>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }} ref={dropdownRef}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.texto }}>
                Tipo de referencia
              </label>
              <button
                type="button"
                role="combobox"
                aria-controls="poi-type-listbox"
                aria-haspopup="listbox"
                aria-expanded={dropdownOpen}
                onClick={() => setDropdownOpen((prev) => !prev)}
                style={{
                  width: "100%",
                  height: 40,
                  padding: "0 12px",
                  fontSize: 14,
                  background: "#ffffff",
                  borderRadius: 8,
                  border: `1px solid ${errors.tipo ? "#ef4444" : C.borde}`,
                  color: selectedType ? C.texto : "#9CA3AF",
                  outline: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <span>{selectedType?.nombre ?? "Seleccione una opción"}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  style={{
                    color: "#9CA3AF",
                    transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    flexShrink: 0,
                  }}
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
              {dropdownOpen && (
                <div
                  style={{
                    position: "relative",
                    zIndex: 20,
                  }}
                >
                  <ul
                    id="poi-type-listbox"
                    role="listbox"
                    style={{
                      position: "absolute",
                      top: 4,
                      left: 0,
                      right: 0,
                      background: "#ffffff",
                      border: `1px solid ${C.borde}`,
                      borderRadius: 8,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      maxHeight: 220,
                      overflowY: "auto",
                      padding: "6px 0",
                      margin: 0,
                      listStyle: "none",
                    }}
                  >
                    {types.map((type) => (
                      <li
                        key={type.id_tipo_poi}
                        role="option"
                        aria-selected={String(type.id_tipo_poi) === selectedTypeId}
                        onClick={() => {
                          setSelectedTypeId(String(type.id_tipo_poi))
                          setDropdownOpen(false)
                        }}
                        style={{
                          padding: "10px 12px",
                          fontSize: 14,
                          color: C.texto,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                        }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.background = "#F8F5EF"
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.background = "#ffffff"
                        }}
                      >
                        <span>{type.nombre}</span>
                        {String(type.id_tipo_poi) === selectedTypeId && (
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="#1A1714">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {errors.tipo && (
                <span style={{ color: "#ef4444", fontSize: 12 }}>{errors.tipo}</span>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.texto }}>
                Nombre del punto
              </label>
              <input
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                placeholder="Ej: Surtidor Cristo Rey"
                maxLength={MAX_POINT_OF_INTEREST_NAME_LENGTH}
                style={{
                  height: 40,
                  borderRadius: 8,
                  border: `1px solid ${errors.nombre ? "#ef4444" : C.borde}`,
                  background: "#ffffff",
                  padding: "0 12px",
                  fontSize: 14,
                  color: C.texto,
                }}
              />
              {errors.nombre && (
                <span style={{ color: "#ef4444", fontSize: 12 }}>
                  {errors.nombre}
                </span>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.texto }}>
                Descripción (opcional)
              </label>
              <textarea
                value={descripcion}
                onChange={(event) => setDescripcion(event.target.value)}
                placeholder="Ej: A una cuadra de la propiedad"
                maxLength={MAX_POINT_OF_INTEREST_DESCRIPTION_LENGTH}
                rows={3}
                style={{
                  borderRadius: 8,
                  border: `1px solid ${errors.descripcion ? "#ef4444" : C.borde}`,
                  background: "#ffffff",
                  padding: "10px 12px",
                  fontSize: 14,
                  color: C.texto,
                  resize: "vertical",
                }}
              />
              {errors.descripcion && (
                <span style={{ color: "#ef4444", fontSize: 12 }}>
                  {errors.descripcion}
                </span>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px 14px",
            borderTop: `1.5px solid ${C.borde}`,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: C.crema,
              border: `1.5px solid ${C.terracota}`,
              color: C.terracota,
              borderRadius: 6,
              padding: "6px 18px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            style={{
              backgroundColor: C.terracota,
              border: `1.5px solid ${C.terracota}`,
              color: "#ffffff",
              borderRadius: 6,
              padding: "6px 18px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )

  return typeof window !== "undefined" ? createPortal(modal, document.body) : null
}
