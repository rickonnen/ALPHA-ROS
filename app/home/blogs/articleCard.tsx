import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X as ObjXIcon } from "lucide-react";
import { useHoverAnimation } from "@/components/hooks/useHoverAnimation";
/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 24/04/2026
 * funcionalidad: renderiza una tarjeta de blog en formato 16:9 con interactividad y redireccion
 * @param {objArticleCardProps} objProps propiedades y datos del blog a mostrar
 * @return {React.JSX.Element} la tarjeta visual estructurada
 */
interface objArticleCardProps {
  intId: number;
  strTitle: string;
  strDate: string;
  strDescription: string;
  strImageUrl: string;
}

export default function articleCard(objProps: objArticleCardProps) {
  const { intId, strTitle, strDate, strDescription, strImageUrl } = objProps;

  const strCardHoverClasses = useHoverAnimation(false, true, 'default', true, false);
  const strBtnHoverClasses = useHoverAnimation(true, false, 'pointer', true, true);

  return (
    <article className={`flex flex-col w-full aspect-[16/9] bg-[#f3efea] rounded-2xl border-3 border-secondary shadow-md p-3 sm:p-4 gap-2 sm:gap-3 overflow-hidden ${strCardHoverClasses}`}>
      <h3 className="font-bold text-foreground text-[0.9rem] uppercase leading-tight w-full truncate">
        {strTitle}
      </h3>

      <div className="flex flex-row w-full gap-3 sm:gap-4 flex-1 min-h-0">
        <div className="w-1/2 h-full">
          <div className="relative w-full h-full aspect-[4/3] bg-muted flex items-center justify-center border border-border/30 text-muted-foreground overflow-hidden rounded-lg">
            {strImageUrl ? (
              <Image
                src={strImageUrl}
                alt={strTitle}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            ) : (
              <ObjXIcon className="w-10 h-10 opacity-30" strokeWidth={1} />
            )}
          </div>
        </div>

        <div className="w-1/2 flex flex-col min-h-0 h-full">
          <span className="text-secondary font-medium text-[0.85rem] mb-1">
            {strDate}
          </span>
          <p className="text-foreground text-[0.85rem] leading-snug overflow-hidden line-clamp-3 sm:line-clamp-4">
            {strDescription}
          </p>
          <Link 
            href={`/home/blogs/${intId}`}
            className={`font-bold text-[1rem] mt-auto self-start ${strBtnHoverClasses} text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 rounded-md`}
          >
            Leer más...
          </Link>
        </div>
      </div>
    </article>
  );
}