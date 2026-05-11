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
/* Dev: Candy Camila Ordoñez Pinto
   Fecha: 28/04/2026
   Fix: Ocultamiento de métricas y ubicación en mobile
     - Se agregó clase `hidden sm:flex` en el bloque de ubicación (MapPin)
       para ocultar la dirección/zona en pantallas menores a 640px
     - Se agregó clase `hidden sm:flex` en el bloque de métricas
       (superficie, habitaciones, baños) para ocultarlas en mobile
     - Ambos elementos siguen visibles desde el breakpoint `sm` en adelante
*/
/* Dev: [tu nombre]
   Fecha: 10/05/2026
   Add: Botón "Promocionar" junto a los botones de acción existentes
     - Usa variant="azul" y size="sm" igual que Ver Detalle y Editar
     - Ruta provisional: /publicacion/promocionar?id=<id>
     - TODO: reemplazar ruta cuando la página esté lista
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
  //zona: string;
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
  gratuito: boolean;
}

interface PublicacionCardProps {
  publicacion: Publicacion;
  onEliminar: (id: string) => void;
  onCambiarEstado: (id: string, nuevoEstado: number) => Promise<boolean>;
}

export default function PublicacionCard({
  publicacion,
  onEliminar,
  onCambiarEstado,
}: PublicacionCardProps) {
  const router = useRouter();
  const [activo, setActivo] = useState(publicacion.id_estado !== 4);
  const [bloqueado, setBloqueado] = useState(false);
  const [estadoPrevio, setEstadoPrevio] = useState(
    publicacion.id_estado !== 4 ? publicacion.id_estado : 1
  );

  const strEtiqueta = [publicacion.tipo, publicacion.tipoOperacion]
    .filter(Boolean)
    .join(" en ")
    .toUpperCase();

  return (
    <Card
      className={`relative border border-black/10 text-[#2E2E2E] hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden ${!activo ? "bg-slate-100 brightness-[0.85]" : "bg-white"}`}
    >
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
                {publicacion.gratuito && (
                  <span className="px-2 py-1 text-[10px] font-semibold text-blue-800 bg-blue-100 rounded-full">
                    Gratuita
                  </span>
                )}
                <span
                  className={`text-[10px] font-bold uppercase ${activo ? "text-green-600" : "text-red-500"}`}
                >
                  {activo ? "Activa" : "Suspendida"}
                </span>
                <Switch
                  checked={activo}
                  disabled={bloqueado || publicacion.gratuito}
                  className="h-5 w-9"
                  onCheckedChange={async (checked) => {
                    setBloqueado(true);
                    let exito = false;
                    if (checked) {
                      exito = await onCambiarEstado(publicacion.id, estadoPrevio);
                    } else {
                      setEstadoPrevio(publicacion.id_estado);
                      exito = await onCambiarEstado(publicacion.id, 4);
                    }
                    if (exito) {
                      setActivo(checked);
                    }
                    setBloqueado(false);
                  }}
                />
              </div>
            </div>
            <h3
              className="text-base font-semibold text-[#1F3A4D] leading-snug cursor-pointer hover:underline truncate"
              onClick={() =>
                router.push(`/publicacion/Mi_inmueble/${publicacion.id}`)
              }
            >
              {publicacion.titulo}
            </h3>
            {publicacion.direccion && (
              <div className="hidden sm:flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-[#E05A2B] shrink-0" />
                <p className="text-xs text-gray-500 truncate">
                  {[publicacion.direccion].filter(Boolean).join(", ")}
                </p>
              </div>
            )}
          </div>

          {/* Métricas */}
          <div className="hidden sm:flex items-center gap-4 text-xs text-gray-600 flex-wrap">
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
                  window.open(
                    `/publicacion/Mi_inmueble/${publicacion.id}`,
                    `tab_inmueble_${publicacion.id}`
                  )
                }
              >
                Ver Detalle
              </Button>
              <Button
                variant="azul"
                size="sm"
                className="flex-1 min-[480px]:flex-none"
                onClick={() =>
                  router.push(
                    `/publicacion/formularioPublicacion?editar=${publicacion.id}`
                  )
                }
              >
                Editar
              </Button>
              {/* TODO: reemplazar la ruta cuando la página de promoción esté lista */}
              <Button
                variant="azul"
                size="sm"
                className="flex-1 min-[480px]:flex-none"
                onClick={() =>
                  router.push(`/publicacion/promocionar?id=${publicacion.id}`)
                }
              >
                Promocionar
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