"use client";
/*  Dev: Candy Camila Ordoñez Pinto
    Fecha: 25/03/2026
    Funcionalidad: Card individual de publicación dentro de Mis Publicaciones
      - @param {publicacion} - datos de la publicación a mostrar
      - @return {PublicacionCard} - muestra miniatura, título, zona y tipo
*/
/*  Dev: Candy Camila Ordoñez Pinto
    Fecha: 28/03/2026
    Funcionalidad: Card individual de publicación dentro de Mis Publicaciones
      - @param {publicacion} - datos de la publicación (titulo, zona, tipo, imagen)
      - @param {onEliminar}  - callback para abrir el AlertDialog de confirmación
      - @param {onInfo}      - callback para ver el detalle de la publicación
      - @return {PublicacionCard} - muestra miniatura, título, zona, tipo y botones de acción
*/
/* Dev: Camila Magne Hinojosa - xdev/sow-camilaM
    Fecha: 17/04/2026
    Fix: Actualización del texto del botón secundario a "Ver detalle".
*/
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Square, BedDouble, Bath } from "lucide-react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

export interface Publicacion {
  id: string;
  titulo: string;
  zona: string;
  direccion?: string;
  tipo: string;
  tipoOperacion?: string;
  imagen: string | null;
  precio?: number;
  superficie?: number;
  habitaciones?: number;
  banos?: number;
  fechaPublicacion?: string;
  id_estado: number;
}

interface PublicacionCardProps {
  publicacion: Publicacion;
  onEliminar: (id: string) => void;
  onCambiarEstado: (id: string, nuevoEstado: number) => Promise<void>;
}

export default function PublicacionCard({
  publicacion,
  onEliminar,
  onCambiarEstado,
}: PublicacionCardProps) {
  const router = useRouter();
  const [activo, setActivo] = useState(publicacion.id_estado === 1);
  const [bloqueado, setBloqueado] = useState(false);

  const strEtiqueta = [publicacion.tipo, publicacion.tipoOperacion]
    .filter(Boolean)
    .join(" en ")
    .toUpperCase();

  return (
    <Card className={`relative border border-black/10 bg-white text-[#2E2E2E] hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden ${!activo ? 'bg-slate-100 brightness-[0.85]' : 'bg-white'}`}>
      <CardContent className="flex flex-col min-[480px]:flex-row items-stretch gap-0 p-0">
        {/* Miniatura */}
        <div className="w-full h-40 min-[480px]:w-40 min-[480px]:h-auto min-[480px]:min-w-[10rem] flex-shrink-0 overflow-hidden">
          {publicacion.imagen ? (
            <img
              src={publicacion.imagen}
              alt={publicacion.titulo}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-xs text-center px-2">
                Sin imagen
              </span>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="flex flex-col justify-between flex-1 min-w-0 p-4 gap-2">
          {/* Encabezado */}
          <div>
            <div className="flex items-center justify-between mb-1">
              {strEtiqueta ? (
                <p className="text-[11px] font-bold text-[#E05A2B] uppercase tracking-wide">
                  {strEtiqueta}
                </p>
              ) : (
                <span /> 
              )}
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase ${activo ? 'text-green-600' : 'text-red-500'}`}>
                  {activo ? "Activa" : "Suspendida"}
                </span>
                <Switch
                  checked={activo}
                  disabled={bloqueado}
                  className="h-5 w-9"
                  onCheckedChange={async (checked) => {
                    setBloqueado(true);
                    setActivo(checked);
                    await onCambiarEstado(publicacion.id, checked ? 1 : 4);
                    setBloqueado(false);
                  }}
                />
              </div>
            </div>
            
            <h3
              className="text-base font-semibold text-[#1F3A4D] leading-snug cursor-pointer hover:underline truncate"
              onClick={() =>
                router.push(
                  `/publicacion/perfil_del_inmueble/${publicacion.id}`,
                )
              }
            >
              {publicacion.titulo}
            </h3>
            {(publicacion.direccion) && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-[#E05A2B] shrink-0" />
                <p className="text-xs text-gray-500 truncate">
                  {[publicacion.direccion]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            )}
          </div>

          {/* Métricas */}
          <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
            {publicacion.superficie != null && (
              <span className="flex items-center gap-1">
                <Square className="w-3 h-3" />
                {publicacion.superficie} m² Terreno
              </span>
            )}
            {publicacion.habitaciones != null && (
              <span className="flex items-center gap-1">
                <BedDouble className="w-3 h-3" />
                {publicacion.habitaciones} Rec.
              </span>
            )}
            {publicacion.banos != null && (
              <span className="flex items-center gap-1">
                <Bath className="w-3 h-3" />
                {publicacion.banos} Baños
              </span>
            )}
          </div>

          {/* Precio + Botones */}
          <div className="flex flex-col min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between gap-2 mt-1">
            <div>
              {publicacion.precio != null && (
                <p className="text-xl font-bold text-[#1F3A4D]">
                  $us {Number(publicacion.precio).toLocaleString("de-DE")}
                </p>
              )}
              {publicacion.fechaPublicacion && (
                <p className="text-[11px] text-gray-400">
                  {publicacion.fechaPublicacion}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="azul"
                size="sm"
                className="flex-1 min-[480px]:flex-none"
                onClick={() =>
                  router.push(
                    `/publicacion/perfil_del_inmueble/${publicacion.id}`,
                  )
                }
              >
                Ver Detalle
              </Button>
              <Button
                size="sm"
                className="flex-1 min-[480px]:flex-none bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]/80 border-none"
                onClick={() => onEliminar(publicacion.id)}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
