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

export interface Favorito {
  id: string;
  titulo: string;
  zona: string;
  tipo: string;
  imagen?: string | null;
}

interface FavCardProps {
  favorito: Favorito;
  id_usuario: string;
  onRemoved: (id: string) => void;
}

export default function FavCard({ favorito, id_usuario, onRemoved }: FavCardProps) {
  const handleInfo = (id: string) => {
    console.log("Ver info de publicación:", id);
  };

  return (
    <Card className="border mb-2 border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all duration-200">
      <CardContent className="flex items-center gap-4 px-4">

        <div className="w-16 h-16 rounded-md overflow-hidden bg-white/10 flex-shrink-0 flex items-center justify-center">
          {favorito.imagen ? (
            <img
              src={favorito.imagen}
              alt={favorito.titulo}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-white/30 text-xs text-center">Sin imagen</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{favorito.titulo}</p>
          <p className="text-xs text-white/50">{favorito.zona}</p>
          <p className="text-xs text-white/50">Tipo: {favorito.tipo}</p>
        </div>

        <div className="flex gap-2 flex-shrink-0 items-center">
          <Button
            variant="outline"
            size="sm"
            className="text-black border-white/60 hover:bg-white/80"
            onClick={() => handleInfo(favorito.id)}
          >
            <span className="hidden md:inline">Información</span>
            <span className="md:hidden">Info.</span>
          </Button>

          <FavButton
            id_usuario={id_usuario}
            id_publicacion={favorito.id}
            initialFav={true}
            onRemoved={onRemoved}
          />
        </div>

      </CardContent>
    </Card>
  );
}
