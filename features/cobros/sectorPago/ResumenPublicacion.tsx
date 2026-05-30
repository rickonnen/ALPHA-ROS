import { prisma } from "@/lib/prisma";
import { MapPin, Home, Bed, Bath, Maximize } from "lucide-react";

interface Props {
  idPublicacion: string;
}

export default async function ResumenPublicacion({ idPublicacion }: Props) {
  // Consultamos los datos de la publicación
  const publicacion = await prisma.publicacion.findUnique({
    where: { id_publicacion: Number(idPublicacion) },
    include: {
      Imagen: {
        take: 1, // Solo traemos la primera imagen para la portada
      },
      Ubicacion: {
        include: {
          Ciudad: true,
        },
      },
      TipoInmueble: true,
      Moneda: true,
    },
  });

  if (!publicacion) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded-md text-sm">
        No se encontraron los datos del inmueble para el ID proporcionado.
      </div>
    );
  }

  const imagenUrl = publicacion.Imagen[0]?.url_imagen || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80"; // Imagen por defecto si no tiene
  const simboloMoneda = publicacion.Moneda?.simbolo || "$";

  return (
    <div className="w-full bg-white rounded-xl border border-border shadow-sm overflow-hidden mb-6 flex flex-col sm:flex-row">
      
      <div className="w-full sm:w-2/5 relative min-h-[220px] bg-muted flex-shrink-0">
        <img
          src={imagenUrl}
          alt={publicacion.titulo || "Inmueble"}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[10px] sm:text-xs font-extrabold px-3 py-1.5 rounded-md uppercase tracking-widest border border-white/20 shadow-lg z-10">
          {publicacion.TipoInmueble?.nombre_inmueble || "Inmueble"}
        </div>
      </div>

      <div className="p-5 sm:w-3/5 flex flex-col justify-between flex-grow">
        <div>
          <div className="flex flex-col xl:flex-row  xl:justify-between xl:items-start mb-2 gap-2">
            <h3 className="font-bold text-lg text-[#1e3a5f] line-clamp-2">
              {publicacion.titulo}
            </h3>
            <p className="text-xl font-black text-[#1e3a5f] xl:ml-4 whitespace-nowrap">
              {simboloMoneda} {Number(publicacion.precio).toLocaleString("es-ES")}
            </p>
          </div>
          
          <div className="flex items-start text-[#1e3a5f] text-sm mb-4">
            <MapPin size={16} className="mr-1 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">
              {publicacion.Ubicacion?.direccion}, 
              {publicacion.Ubicacion?.zona} 
              {publicacion.Ubicacion?.Ciudad?.nombre_ciudad ? ` - ${publicacion.Ubicacion.Ciudad.nombre_ciudad}` : ""}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-4 pb-4 border-t border-border/50 text-sm font-medium text-[#1e3a5f]">
          {publicacion.superficie && (
            <div className="flex items-center gap-1.5">
              <Maximize size={16} className="text-muted-foreground flex-shrink-0" />
              <span>{Number(publicacion.superficie)} m²</span>
            </div>
          )}
          {publicacion.habitaciones != null && publicacion.habitaciones > 0 && (
            <div className="flex items-center gap-1.5">
              <Bed size={16} className="text-muted-foreground flex-shrink-0" />
              <span>{publicacion.habitaciones} Hab.</span>
            </div>
          )}
          {publicacion.banos != null && publicacion.banos > 0 && (
            <div className="flex items-center gap-1.5">
              <Bath size={16} className="text-muted-foreground flex-shrink-0" />
              <span>{publicacion.banos} Baños</span>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}