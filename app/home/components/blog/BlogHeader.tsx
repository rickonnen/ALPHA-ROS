import { Printer } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { singleBlogData } from "@/types/blogType";

/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 09/05/2026
 * funcionalidad: muestra los metadatos del blog (autor, fechas, tiempo de lectura)
 */
export default function BlogHeader({ objBlogBlo }: { objBlogBlo: singleBlogData }) {
  // 1. Aseguramos que el conteo de palabras use la propiedad correcta (StrContentBlo)
  const intWordCountBlo = objBlogBlo.StrContentBlo?.split(/\s+/).length || 0;
  const intReadTimeBlo = Math.max(1, Math.ceil(intWordCountBlo / 200));

  const handlePrintBlog = () => {
    if (typeof window === "undefined") return;
    window.print();
  };

  return (
    /* 2. Añadimos 'no-print' al header principal si NO quieres que salga el autor arriba en el papel */
    /* Si quieres que el autor SÍ salga en el PDF, deja el header sin 'no-print' pero mantenlo en el botón */
    <header className="flex justify-between items-center mb-8 border-b border-card-border pb-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border border-border/50 bg-secondary-fund">
          {objBlogBlo.StrAuthorAvatarBlo && (
            <AvatarImage src={objBlogBlo.StrAuthorAvatarBlo} alt={objBlogBlo.StrAuthorBlo} />
          )}
          <AvatarFallback className="text-sm font-bold text-primary">
            {/* 3. Safe check para evitar error si StrAuthorBlo viene vacío */}
            {objBlogBlo.StrAuthorBlo?.substring(0, 2).toUpperCase() || "AU"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground text-base leading-none">
            {objBlogBlo.StrAuthorBlo}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span>Creado el {objBlogBlo.StrCreationDateBlo}</span>
            <span className="text-border">•</span>
            <span>Publicado el {objBlogBlo.StrDateBlo}</span>
            <span className="text-border">•</span>
            <span>{intReadTimeBlo} Min. de lectura</span>
          </div>
        </div>
      </div>
      
      <button 
        type="button"
        onClick={handlePrintBlog}
        /* 4. Mantenemos 'no-print' para que el botón NO salga en el papel */
        className="inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-card-border bg-background hover:bg-secondary-fund hover:text-primary h-10 px-4 py-2 shadow-sm no-print"
        title="Imprimir artículo"
        aria-label="Imprimir artículo"
      >
        <Printer className="w-4 h-4" />
        Imprimir
      </button>
    </header>
  );
}