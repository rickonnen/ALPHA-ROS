/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 09/05/2026
 * funcionalidad: contenido del blog para su revisión (título, descripción, imagen y cuerpo)
 */
import Image from "next/image";
import { singleAdminBlogData } from "@/types/blogType";

export default function AdminBlogHero({ ObjBlogBlo }: { ObjBlogBlo: singleAdminBlogData }) {
  return (
    <>
      <h1 className="text-foreground font-bold text-main-title leading-tight uppercase tracking-tighter mb-6 break-words">
      {ObjBlogBlo.StrTitleBlo}
      </h1>

      <p className="text-subtitle text-foreground/80 italic font-medium leading-relaxed mb-8 break-words border-l-4 border-secondary pl-4 py-1">
        {ObjBlogBlo.StrDescriptionBlo}
      </p>

      {ObjBlogBlo.StrImageUrlBlo && (
        <div className="w-full aspect-[4/3] relative bg-secondary-fund rounded-2xl overflow-hidden border border-card-border shadow-sm flex items-center justify-center mb-12">
          <Image
            src={ObjBlogBlo.StrImageUrlBlo}
            alt={ObjBlogBlo.StrTitleBlo}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
            priority 
          />
        </div>
      )}

      <article className="w-full text-body-info text-foreground leading-loose whitespace-pre-wrap break-words mb-12">
        {ObjBlogBlo.StrContentBlo}
      </article>
    </>
  );
}