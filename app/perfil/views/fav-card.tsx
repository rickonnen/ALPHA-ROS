/*  Dev: David Chavez Totora - xdev/davidc
    Fecha: 28/03/2026
    Funcionalidad: Card individual de favorito
      - @param {favorito}   - datos de la publicación favorita
      - @param {id_usuario} - UUID del usuario para pasárselo al FavButton
      - @param {onRemoved}  - callback para sacar la card de la lista cuando se quita el fav
      - @return Card con miniatura, título, zona, tipo, botón info y botón corazón

    TODO: conectar botón Información con el equipo de detalle de publicación
*/
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FavButton from "@/components/ui/fav";
import { MapPin, Square, BedDouble, Bath } from "lucide-react";
import { useRouter } from "next/navigation"
export interface Favorito {
  id: string;
  titulo: string;
  tipo: string;
  tipo_operacion: string;
  imagen?: string | null;
  direccion?: string;
  precio?: number;
  superficie?: number;
  habitaciones?: number;
  banos?: number;
  fechaPublicacion?: string;
}

interface FavCardProps {
  favorito: Favorito;
  id_usuario: string;
  onRemoved: (id: string) => void;
}
//<p className="text-xs text-white/50">{favorito.zona}</p>
export default function FavCard({ favorito, id_usuario, onRemoved }: FavCardProps) {
  const router = useRouter()

  const handleInfo = (id: string) => {
    window.open(`/publicacion/Vista_del_Inmueble/${id}`, "_blank");
  };
  const strEtiqueta = [favorito.tipo, favorito.tipo_operacion]
    .filter(Boolean)
    .join(" en ")
    .toUpperCase();

  return (
    <Card className="mb-3 border border-black/10 bg-white text-[#2E2E2E] hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden">
      <CardContent className="flex flex-col min-[480px]:flex-row items-stretch gap-0 p-0">

        <div className="w-full h-40 min-[480px]:w-40 min-[480px]:h-auto min-[480px]:min-w-[10rem] flex-shrink-0 overflow-hidden">
          {favorito.imagen ? (
            <img
              src={favorito.imagen}
              alt={favorito.titulo}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-xs text-center px-2">Sin imagen</span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between flex-1 min-w-0 p-4 gap-2">

          <div>
            {strEtiqueta && (
              <p className="text-[11px] font-bold text-[#E05A2B] uppercase tracking-wide mb-1">
                {strEtiqueta}
              </p>
            )}
            <h3
              className="text-base font-semibold text-[#1F3A4D] leading-snug cursor-pointer hover:underline"
              onClick={() => handleInfo(favorito.id)}
            >
              {favorito.titulo}
            </h3>
            {favorito.direccion && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-[#E05A2B] shrink-0" />
                <p className="text-xs text-gray-500 truncate">{favorito.direccion}</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
            {favorito.superficie != null && (
              <span className="flex items-center gap-1">
                <Square className="w-3 h-3" />
                {favorito.superficie} m² Terreno
              </span>
            )}
            {favorito.habitaciones != null && (
              <span className="flex items-center gap-1">
                <BedDouble className="w-3 h-3" />
                {favorito.habitaciones} Rec.
              </span>
            )}
            {favorito.banos != null && (
              <span className="flex items-center gap-1">
                <Bath className="w-3 h-3" />
                {favorito.banos} Baños
              </span>
            )}
          </div>
          <div className="flex flex-col min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between gap-2 mt-1">
            <div>
              {favorito.precio != null && (
                <p className="text-xl font-bold text-[#1F3A4D]">
                  $us {Number(favorito.precio).toLocaleString("de-DE")}
                </p>
              )}
              {favorito.fechaPublicacion && (
                <p className="text-[11px] text-gray-400">{favorito.fechaPublicacion}</p>
              )}
            </div>

            <div className="flex gap-2 items-center">
              <Button
                variant="azul"
                size="sm"
                className="flex-1 min-[480px]:flex-none"
                onClick={() => handleInfo(favorito.id)}
              >
                Ver Detalle
              </Button>
              <FavButton
                id_publicacion={favorito.id}
                initialFav={true}
                onRemoved={onRemoved}
              />
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}