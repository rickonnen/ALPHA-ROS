import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X as ObjXIcon } from "lucide-react";
import { useHoverAnimation } from "@/components/hooks/useHoverAnimation";
/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 23/04/2026
 * funcionalidad: renderiza una tarjeta de blog en formato 16:9 con interactividad
 * @param {objArticleCardProps} objProps propiedades y datos del blog a mostrar
 * @return {React.JSX.Element} la tarjeta visual estructurada
 */

// la estructura de datos que recibe la tarjeta
interface objArticleCardProps {
  intId: number;
  strTitle: string;
  strDate: string;
  strDescription: string;
  strImageUrl: string;
}

export default function articleCard(objProps: objArticleCardProps) {
  const { intId, strTitle, strDate, strDescription, strImageUrl } = objProps;

  // animacion para el contenedor principal (resplandor sin cambio de cursor)
  const strCardHoverClasses = useHoverAnimation(false, true, 'default', true, false);
  // animacion especifica para el texto interactivo (cambio de color y cursor)
  const strBtnHoverClasses = useHoverAnimation(true, false, 'pointer', true, true);

  return (
    <article className={`flex flex-col w-full aspect-[16/9] bg-[#f3efea] rounded-2xl border-3 border-secondary shadow-md p-3 sm:p-4 gap-2 sm:gap-3 overflow-hidden ${strCardHoverClasses}`}>
      {/* cabecera truncada con el titulo del blog */}
      <h3 className="font-bold text-foreground text-[0.9rem] uppercase leading-tight w-full truncate">
        {strTitle}
      </h3>

      <div className="flex flex-row w-full gap-3 sm:gap-4 flex-1 min-h-0">
        <div className="w-1/2 h-full">
          {/* contenedor de la imagen en proporcion 4:3 o icono por defecto */}
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
          {/* metadatos de la publicacion */}
          <span className="text-secondary font-medium text-[0.85rem] mb-1">
            {strDate}
          </span>
          {/* cuerpo descriptivo con limite de lineas */}
          <p className="text-foreground text-[0.85rem] leading-snug overflow-hidden line-clamp-3 sm:line-clamp-4">
            {strDescription}
          </p>
          {/* elemento de accion posicionado al final de la tarjeta */}
          <span className={`font-bold text-[1rem] mt-auto self-start ${strBtnHoverClasses} text-primary`}>
            Leer más...
          </span>
        </div>
      </div>
    </article>
  );
}