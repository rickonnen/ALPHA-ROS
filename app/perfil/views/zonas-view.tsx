"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Map, AlertCircle, Pencil, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Zona {
  id_mi_zona: number;
  nombre_zona: string;
  coordenadas: [number, number][];
  fecha_creacion: string;
}

const ZONE_NAME_PATTERN = /^[A-Za-z0-9]+$/;
const ZONE_NAME_MAX_LENGTH = 50;
const LOADED_ZONE_KEY = "loadedZona";
const LOADED_ZONE_EDIT_MODE_KEY = "loadedZonaEditMode";

function normalizeZoneName(value: string): string {
  return value.trim().toLowerCase();
}

export default function ZonasView() {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; zona: Zona | null }>({ show: false, zona: null });
  const [renameModal, setRenameModal] = useState<{ show: boolean; zona: Zona | null }>({ show: false, zona: null });
  const [zoneName, setZoneName] = useState("");
  const [zoneNameError, setZoneNameError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchZonas = async () => {
      try {
        const res = await fetch(`/api/perfil/mis-zonas`, {
          credentials: 'include',
        });
        if (res.ok) {
          const json = await res.json();
          setZonas(json.data);
          setError(null);
        } else {
          setError("Error al cargar las zonas");
        }
      } catch (err) {
        console.error("Error al cargar zonas:", err);
        setError("Error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    };
    fetchZonas();
  }, []);

  const handleDeleteZona = async () => {
    if (!deleteModal.zona) return;
    try {
      const res = await fetch(`/api/perfil/mis-zonas?id_mi_zona=${deleteModal.zona.id_mi_zona}`, {
        method: "DELETE",
        credentials: 'include',
      });
      if (res.ok) {
        setZonas(zonas.filter(z => z.id_mi_zona !== deleteModal.zona!.id_mi_zona));
        setDeleteModal({ show: false, zona: null });
      } else {
        alert("Error al eliminar la zona");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error al eliminar la zona");
    }
  };

  const handleLoadZona = (coordenadas: [number, number][]) => {
    localStorage.setItem(LOADED_ZONE_KEY, JSON.stringify(coordenadas));
    localStorage.removeItem(LOADED_ZONE_EDIT_MODE_KEY);
    router.push("/search");
  };

  const handleEditZona = (coordenadas: [number, number][]) => {
    localStorage.setItem(LOADED_ZONE_KEY, JSON.stringify(coordenadas));
    localStorage.setItem(LOADED_ZONE_EDIT_MODE_KEY, "true");
    router.push("/search");
  };

  const getZoneNameError = (value: string, excludedZoneId?: number) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) return "Ingresa un nombre para la zona.";
    if (trimmedValue.length > ZONE_NAME_MAX_LENGTH) {
      return `El nombre no puede superar ${ZONE_NAME_MAX_LENGTH} caracteres.`;
    }
    if (!ZONE_NAME_PATTERN.test(trimmedValue)) {
      return "Usa solo letras y numeros, sin espacios ni caracteres especiales.";
    }

    const normalizedValue = normalizeZoneName(trimmedValue);
    const hasDuplicateName = zonas.some(
      (zona) =>
        zona.id_mi_zona !== excludedZoneId &&
        normalizeZoneName(zona.nombre_zona) === normalizedValue,
    );

    if (hasDuplicateName) {
      return "Ya tienes una zona guardada con ese nombre.";
    }

    return null;
  };

  const handleOpenRenameModal = (zona: Zona) => {
    setRenameModal({ show: true, zona });
    setZoneName(zona.nombre_zona);
    setZoneNameError(null);
  };

  const handleRenameZona = async () => {
    if (!renameModal.zona) return;

    const currentError = getZoneNameError(zoneName, renameModal.zona.id_mi_zona);
    if (currentError) {
      setZoneNameError(currentError);
      return;
    }

    try {
      const res = await fetch(`/api/perfil/mis-zonas`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id_mi_zona: renameModal.zona.id_mi_zona,
          nombre_zona: zoneName.trim(),
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setZonas((current) =>
          current.map((zona) =>
            zona.id_mi_zona === json.data.id_mi_zona ? json.data : zona,
          ),
        );
        setRenameModal({ show: false, zona: null });
        setZoneName("");
        setZoneNameError(null);
      } else {
        setZoneNameError(json.error || "No se pudo cambiar el nombre.");
      }
    } catch (err) {
      console.error("Error al renombrar zona:", err);
      setZoneNameError("Error al cambiar el nombre de la zona.");
    }
  };

  return (
    <Card className="border-none bg-transparent shadow-none text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold border-b border-white/20 pb-2 tracking-tight w-full block">
          ZONAS
        </CardTitle>
      </CardHeader>
      

      <CardContent className="flex flex-col">
        {error && (
          <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 text-red-300 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <div className="animate-spin h-5 w-5 border-2 border-[#C26E5A] border-t-transparent rounded-full"></div>
            <span className="text-sm font-medium">Cargando zonas...</span>
          </div>
        )}

        {!loading && zonas.length === 0 && (
          <div className="text-center py-12">
            <Map className="h-10 w-10 text-slate-500 mx-auto mb-3 opacity-50" />
            <p className="text-slate-400 font-medium">No tienes zonas guardadas</p>
            <p className="text-slate-500 text-sm mt-1">
              Ve a la búsqueda y dibuja una zona para guardarla
            </p>
          </div>
        )}

        {!loading && zonas.length > 0 && (
          <div className="block overflow-y-auto pr-1 max-h-[50vh] md:max-h-[300px]">
            <div className="space-y-3">
              {zonas.map((zona) => (
                <div
                  key={zona.id_mi_zona}
                  className="group flex gap-4 rounded-lg border border-slate-600/40 bg-slate-900/50 hover:bg-slate-900/80 backdrop-blur-sm p-4 transition-all duration-200 items-stretch hover:border-[#C26E5A]/60"
                >
                  {/* Información a la izquierda */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="font-semibold text-sm text-white group-hover:text-[#C26E5A] transition-colors truncate">
                        {zona.nombre_zona}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(zona.fecha_creacion).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadZona(zona.coordenadas);
                        }}
                        className="w-fit rounded-lg bg-[var(--secondary)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--secondary)]/80 border-none"
                      >
                        Cargar zona
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditZona(zona.coordenadas);
                        }}
                        className="flex w-fit items-center gap-1 rounded-lg border border-[#C26E5A]/70 px-3 py-1.5 text-xs font-semibold text-[#F1C7B8] transition-colors hover:bg-[#C26E5A]/10"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar zona
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenRenameModal(zona);
                        }}
                        className="flex w-fit items-center gap-1 rounded-lg border border-slate-500/70 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-800/70"
                      >
                        <Type className="h-3.5 w-3.5" />
                        Cambiar nombre
                      </button>
                    </div>
                  </div>

                  {/* Botón eliminar */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteModal({ show: true, zona });
                    }}
                    className="flex-shrink-0 text-slate-500 hover:text-red-400 hover:bg-red-500/20 self-start"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Modal de confirmación de eliminación */}
      {deleteModal.show && deleteModal.zona && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full border-2 border-red-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-red-500"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">¿Eliminar zona?</h2>
            <p className="text-sm text-gray-500 text-center">
              ¿Estás seguro de eliminar la zona{" "}
              <span className="font-semibold text-red-500">&quot;{deleteModal.zona.nombre_zona}&quot;</span>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={() => setDeleteModal({ show: false, zona: null })}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteZona}
                className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {renameModal.show && renameModal.zona && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="mb-4 text-center text-lg font-bold text-gray-900">
              Cambiar nombre de la zona
            </h2>
            <input
              type="text"
              value={zoneName}
              onChange={(e) => {
                setZoneName(e.target.value);
                setZoneNameError(
                  getZoneNameError(e.target.value, renameModal.zona?.id_mi_zona),
                );
              }}
              className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#C26E5A] ${
                zoneNameError ? "mb-2 border-red-400" : "mb-6 border-slate-300"
              }`}
              placeholder="Ingresa el nuevo nombre"
            />
            {zoneNameError && (
              <p className="mb-4 text-sm font-medium text-red-500">
                {zoneNameError}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRenameModal({ show: false, zona: null });
                  setZoneName("");
                  setZoneNameError(null);
                }}
                className="flex-1 rounded-lg border border-gray-300 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRenameZona}
                disabled={Boolean(zoneNameError)}
                className={`flex-1 rounded-lg py-2 font-semibold text-white transition ${
                  zoneNameError
                    ? "cursor-not-allowed bg-slate-400"
                    : "bg-[#C26E5A] hover:bg-[#b05e4a]"
                }`}
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
