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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
export interface Publicacion {
  id: string;
  titulo: string;
  zona: string;
  tipo: string;
  imagen: string | null;
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
  return (
    <Card className="border mb-2 border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all duration-200">
      <CardContent className="flex items-center gap-4 px-4">
        {/* Miniatura */}
        <div className="w-16 h-16 rounded-md overflow-hidden bg-white/10 flex-shrink-0 flex items-center justify-center">
          {publicacion.imagen ? (
            <img
              src={publicacion.imagen}
              alt={publicacion.titulo}
              className="object-cover w-full h-full"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
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
          <p className="text-xs text-white/50">Tipo: {publicacion.tipo}</p>
        </div>

        {/* Botones */}
        <div className="flex gap-2 flex-shrink-0 items-center">
          <Button
            variant="outline"
            size="sm"
            className="text-black border-white/60 hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary)]"
            onClick={() =>
               window.open(`/publicacion/Mi_inmueble/${publicacion.id}`, `tab_inmueble_${publicacion.id}`)
            }
          >
            Info.
          </Button>
          <Button
            size="sm"
            className="bg-[var(--secondary)] text-white border-none hover:bg-[var(--secondary)]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--secondary)]"
            onClick={() => router.push(`/publicacion/formularioPublicacion?editar=${publicacion.id}`)}
          >
          Editar
          </Button>
          <Button
            size="sm"
            className="flex-1 min-[480px]:flex-none bg-[var(--secondary)] text-[var(--secondary-foreground)] border-none hover:bg-[var(--secondary)]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--secondary)]"
            onClick={() => onEliminar(publicacion.id)}
          >
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
