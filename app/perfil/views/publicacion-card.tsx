import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Square, BedDouble, Bath } from "lucide-react";
import { useRouter } from "next/navigation";

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
}

interface PublicacionCardProps {
  publicacion: Publicacion;
  onEliminar: (id: string) => void;
}

export default function PublicacionCard({
  publicacion,
  onEliminar,
}: PublicacionCardProps) {
  const router = useRouter();

  const strEtiqueta = [publicacion.tipo, publicacion.tipoOperacion]
    .filter(Boolean)
    .join(" en ")
    .toUpperCase();

  return (
    <Card className="border border-black/10 bg-white text-[#2E2E2E] hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden">
      <CardContent className="flex items-stretch gap-0 p-0">
        {/* Miniatura */}
        <div className="w-40 min-w-[10rem] self-stretch flex-shrink-0 overflow-hidden">
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
            {/* Badge tipo operación */}
            {strEtiqueta && (
              <p className="text-[11px] font-bold text-[#E05A2B] uppercase tracking-wide mb-1">
                {strEtiqueta}
              </p>
            )}

            {/* Título */}
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

            {/* Dirección */}
            {(publicacion.direccion || publicacion.zona) && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-[#E05A2B] shrink-0" />
                <p className="text-xs text-gray-500 truncate">
                  {[publicacion.direccion, publicacion.zona]
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
          <div className="flex items-center justify-between flex-wrap gap-2 mt-1">
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
              {/* Ver Detalle — azul primario */}
              <Button
                variant="azul"
                size="sm"
                onClick={() =>
                  router.push(
                    `/publicacion/perfil_del_inmueble/${publicacion.id}`,
                  )
                }
              >
                Ver Detalle
              </Button>

              {/* Eliminar — terracota secundario */}
              <Button
                size="sm"
                className="bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]/80 border-none"
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
