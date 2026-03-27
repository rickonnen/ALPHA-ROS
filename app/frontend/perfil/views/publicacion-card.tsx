/*  Dev: Candy Camila Ordoñez Pinto
    Fecha: 25/03/2026
    Funcionalidad: Card individual de publicación dentro de Mis Publicaciones
      - @param {publicacion} - datos de la publicación a mostrar
      - @return {PublicacionCard} - muestra miniatura, título, zona y tipo
*/
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface Publicacion {
  id: string;
  titulo: string;
  zona: string;
  tipo: string;
  imagen?: string | null;
}

interface PublicacionCardProps {
  publicacion: Publicacion;
  onEliminar: (id: string) => void;
  onInfo: (id: string) => void;
}

export default function PublicacionCard({
  publicacion,
  onEliminar,
  onInfo,
}: PublicacionCardProps) {
  return (
    <Card className="border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all duration-200">
      <CardContent className="flex items-center gap-4 p-4">
        {/* Miniatura */}
        <div className="w-16 h-16 rounded-md overflow-hidden bg-white/10 flex-shrink-0 flex items-center justify-center">
          {publicacion.imagen ? (
            <Image
              src={publicacion.imagen}
              alt={publicacion.titulo}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-white/30 text-xs text-center">
              Sin imagen
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{publicacion.titulo}</p>
          <p className="text-xs text-white/50">{publicacion.zona}</p>
          <p className="text-xs text-white/50">Tipo: {publicacion.tipo}</p>
        </div>

        {/* Botones - responsabilidad del siguiente feat */}
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="text-white border-white/20 hover:bg-white/10"
            onClick={() => onInfo(publicacion.id)}
          >
            Info.
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-400 border-red-400/30 hover:bg-red-400/10"
            onClick={() => onEliminar(publicacion.id)}
          >
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
