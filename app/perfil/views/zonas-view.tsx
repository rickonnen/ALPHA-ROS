"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Map, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import MiniMap from "@/components/MiniMap";

interface Zona {
  id_mi_zona: number;
  nombre_zona: string;
  coordenadas: [number, number][];
  fecha_creacion: string;
}

export default function ZonasView({ id_usuario }: { id_usuario: string }) {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const handleDeleteZona = async (id_mi_zona: number, nombreZona: string) => {
    if (!confirm(`¿Eliminar la zona "${nombreZona}"?`)) return;

    try {
      const res = await fetch(`/api/perfil/mis-zonas?id_mi_zona=${id_mi_zona}`, {
        method: "DELETE",
        credentials: 'include',
      });
      if (res.ok) {
        setZonas(zonas.filter(z => z.id_mi_zona !== id_mi_zona));
      } else {
        alert("Error al eliminar la zona");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error al eliminar la zona");
    }
  };

  const handleLoadZona = (coordenadas: [number, number][]) => {
    localStorage.setItem("loadedZona", JSON.stringify(coordenadas));
    router.push("/search");
  };

  return (
    <Card className="border-none bg-transparent shadow-none text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold border-b border-white/20 pb-2 tracking-tight w-full flex items-center gap-2">
          <Map className="h-5 w-5" />
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
          <ScrollArea className="h-auto max-h-[800px]">
            <div className="space-y-4 pr-4">
              {zonas.map((zona) => (
                <div
                  key={zona.id_mi_zona}
                  className="group rounded-lg border border-slate-600/40 bg-slate-900/50 hover:bg-slate-900/80 backdrop-blur-sm p-4 transition-all duration-200 cursor-pointer hover:border-[#C26E5A]/60"
                  onClick={() => handleLoadZona(zona.coordenadas)}
                >
                  {/* Header con nombre y botón eliminar */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-white group-hover:text-[#C26E5A] transition-colors truncate">
                        {zona.nombre_zona}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(zona.fecha_creacion).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteZona(zona.id_mi_zona, zona.nombre_zona);
                      }}
                      className="ml-2 text-slate-500 hover:text-red-400 hover:bg-red-500/20 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Minimapa */}
                  <MiniMap coordenadas={zona.coordenadas} nombre={zona.nombre_zona} />

                  {/* Hint de interacción */}
                  <p className="text-xs text-slate-500 mt-3 group-hover:text-slate-400 transition-colors text-center">
                    Haz clic para cargar esta zona en búsqueda
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}