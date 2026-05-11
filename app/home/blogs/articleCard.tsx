import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock, X as ObjXIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface articleCardProps {
  IntIdBlo: number;
  StrTitleBlo: string;
  StrDateBlo: string;
  StrDescriptionBlo: string;
  StrImageUrlBlo: string;
  ObjAuthorBlo?: {
    name: string;
    avatar?: string;
  };
  StrReadTimeBlo?: string;
  className?: string;
}

/**
 * dev: Rodrigo Saul Zarate Villarroel  fecha: 03/05/2026
 * funcionalidad: renderiza una tarjeta de blog
 * @param {articleCardProps} ObjPropsBlo propiedades y datos del blog a mostrar
 * @return {React.JSX.Element} la tarjeta visual estructurada
 */
export default function GlassArticleCard(ObjPropsBlo: articleCardProps) {
  const { 
    IntIdBlo, 
    StrTitleBlo, 
    StrDateBlo, 
    StrDescriptionBlo, 
    StrImageUrlBlo,
    ObjAuthorBlo = { name: "Equipo Editorial" }, // Valor por defecto
    StrReadTimeBlo = "3 min", // Valor por defecto
    className
  } = ObjPropsBlo;

  return (
    <div className={cn("w-full animate-fadeInUp", className)}>
      <Card className="group relative h-full flex flex-col overflow-hidden rounded-2xl border-border/50 bg-card-bg/60 backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
        
        {/* sección de imagen (formato 4:3) */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {StrImageUrlBlo ? (
            <Image
              src={StrImageUrlBlo}
              alt={StrTitleBlo || "Imagen del blog"}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
             <div className="flex h-full w-full items-center justify-center">
               <ObjXIcon className="w-10 h-10 opacity-30 text-muted-foreground" strokeWidth={1} />
             </div>
          )}

          {/* Botón Overlay que aparece al hacer hover (Reemplaza la animación de Framer Motion con clases de Tailwind) */}
          <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10">
            <Link href={`/home/blogs/${IntIdBlo}`}>
              <button className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <BookOpen className="h-4 w-4" />
                Leer Artículo
              </button>
            </Link>
          </div>
        </div>

        {/* --- SECCIÓN DE CONTENIDO --- */}
        <div className="flex flex-col flex-1 gap-4 p-5 overflow-hidden">
          <div className="space-y-2 flex-1">
            <h3 className="text-[1.15rem] font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-2 break-words">
              {StrTitleBlo}
            </h3>
            <p className="line-clamp-3 text-[0.9rem] text-muted-foreground leading-snug break-words">
              {StrDescriptionBlo}
            </p>
          </div>

          {/* Footer de la tarjeta: Autor y Fecha */}
          <div className="flex items-center justify-between border-t border-card-border/60 pt-4 mt-auto">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border border-border/50 bg-secondary-fund">
                {ObjAuthorBlo.avatar && <AvatarImage src={ObjAuthorBlo.avatar} alt={ObjAuthorBlo.name} />}
                <AvatarFallback className="text-xs font-bold text-primary">
                  {ObjAuthorBlo.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-xs">
                <span className="font-medium text-foreground">
                  {ObjAuthorBlo.name}
                </span>
                <span className="text-muted-foreground">{StrDateBlo}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-medium text-secondary">
              <Clock className="h-3.5 w-3.5" />
              <span>{StrReadTimeBlo}</span>
            </div>
          </div>
        </div>

      </Card>
    </div>
  );
}