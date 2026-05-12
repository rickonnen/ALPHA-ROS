import Image from "next/image";
import { singleBlogData } from "@/types/blogType";
/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 09/05/2026
 * funcionalidad: renderiza el contenido principal del blog,
 * título, resumen (descripcion), imagen hero y cuerpo del texto
 */
export default function BlogHero({ objBlogBlo }: { objBlogBlo: singleBlogData }) {
  return (
    <>
      <h1 className="text-foreground font-bold text-main-title md:text-[2.5rem] leading-tight uppercase tracking-tighter mb-6 break-words">
        {objBlogBlo.StrTitleBlo}
      </h1>
      
      <p className="text-subtitle text-muted-foreground font-medium leading-relaxed mb-8 break-words border-l-4 border-secondary/70 pl-5 py-1">
        {objBlogBlo.StrDescriptionBlo}
      </p>

      {objBlogBlo.StrImageUrlBlo && (
        <div className="w-full aspect-[4/3] relative bg-muted mb-12 flex items-center justify-center text-muted-foreground rounded-md overflow-hidden shadow-sm">
          <Image
            src={objBlogBlo.StrImageUrlBlo}
            alt={objBlogBlo.StrTitleBlo}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
            priority 
          />
        </div>
      )}

      <article className="w-full text-body-info text-foreground leading-loose whitespace-pre-wrap break-words mb-12">
        {objBlogBlo.StrContentBlo}
      </article>
    </>
  );
}