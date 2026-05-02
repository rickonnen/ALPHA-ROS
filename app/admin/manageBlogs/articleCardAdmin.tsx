import Image from "next/image";
import Link from "next/link";
import { X as ObjXIcon } from "lucide-react";
import { useHoverAnimation } from "@/components/hooks/useHoverAnimation";
import { FnFormatLongWords } from "@/app/utils/textUtils";
/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 25/04/2026
 * funcionalidad: card para gestionar estados de los blogs
 */
export interface articleCardAdminProps {
  IntIdBlo: number;
  StrTitleBlo: string;
  StrDateBlo: string;
  StrDescriptionBlo: string;
  StrImageUrlBlo: string;
  StrCurrentTabBlo: string;
  FnOnActionBlo: (IntId: number, StrAction: string) => void;
}

export default function ArticleCardAdmin(ObjPropsBlo: articleCardAdminProps) {
  const { 
    IntIdBlo, 
    StrTitleBlo, 
    StrDateBlo, 
    StrDescriptionBlo, 
    StrImageUrlBlo, 
    StrCurrentTabBlo,
    FnOnActionBlo 
  } = ObjPropsBlo;

  const StrCardHoverClassesBlo = useHoverAnimation(false, true, 'default', false, false);
  const StrBtnHoverClassesBlo = useHoverAnimation(false, false, 'pointer', true, true);
  const StrLinkHoverClassesBlo = useHoverAnimation(true, false, 'pointer', true, true);

  const FnRenderButtonsBlo = () => {
    const StrBaseBtnClassesBlo = `text-[0.75rem] font-bold px-4 py-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 transition-colors ${StrBtnHoverClassesBlo}`;

    switch (StrCurrentTabBlo) {
      case "NO PUBLICADOS":
        return (
          <>
            <button 
              onClick={() => FnOnActionBlo(IntIdBlo, "RECHAZAR")} 
              className={`${StrBaseBtnClassesBlo} bg-secondary-fund text-foreground border border-card-border`}
            >
              RECHAZAR
            </button>
            <button 
              onClick={() => FnOnActionBlo(IntIdBlo, "ACEPTAR")} 
              className={`${StrBaseBtnClassesBlo} bg-primary text-primary-foreground`}
            >
              ACEPTAR
            </button>
          </>
        );
      case "PUBLICADOS":
        return (
          <button 
            onClick={() => FnOnActionBlo(IntIdBlo, "ELIMINAR")} 
            className={`${StrBaseBtnClassesBlo} bg-secondary text-secondary-foreground`}
          >
            ELIMINAR
          </button>
        );
      case "NO VISIBLES":
      case "RECHAZADOS":
        return (
          <>
            <button 
              onClick={() => FnOnActionBlo(IntIdBlo, "BORRADO_PERMANENTE")} 
              className={`${StrBaseBtnClassesBlo} bg-secondary text-secondary-foreground`}
            >
              BORRADO PERMANENTE
            </button>
            <button 
              onClick={() => FnOnActionBlo(IntIdBlo, "PUBLICAR")} 
              className={`${StrBaseBtnClassesBlo} bg-primary text-primary-foreground`}
            >
              PUBLICAR
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <article className={`flex flex-col w-full h-full bg-card-bg rounded-2xl border-2 border-card-border shadow-md p-3 sm:p-4 gap-3 overflow-hidden ${StrCardHoverClassesBlo}`}>
      
      {/* Título Superior */}
      <h3 className="font-bold text-foreground text-body-info uppercase leading-tight w-full truncate shrink-0">
        {FnFormatLongWords(StrTitleBlo)}
      </h3>

      {/* Contenedor Medio: Imagen Izquierda, Texto Derecha */}
      <div className="flex flex-row w-full gap-3 sm:gap-4 flex-1 min-h-0">
        
        {/* Imagen */}
        <div className="w-1/2 flex flex-col shrink-0">
          <div className="relative w-full aspect-[4/3] bg-secondary-fund flex items-center justify-center border border-card-border text-foreground/40 overflow-hidden rounded-lg shrink-0">
            {StrImageUrlBlo ? (
              <Image
                src={StrImageUrlBlo}
                alt={StrTitleBlo || "Imagen del blog"}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover"
              />
            ) : (
              <ObjXIcon className="w-10 h-10 opacity-30" strokeWidth={1} />
            )}
          </div>
        </div>

        {/* Textos */}
        <div className="w-1/2 flex flex-col min-h-0 h-full">
          <span className="text-secondary font-medium text-[0.85rem] mb-1 shrink-0">
            {StrDateBlo}
          </span>
          
          {/* Descripción */}
          <p className="text-foreground text-[0.85rem] leading-snug overflow-hidden line-clamp-3 sm:line-clamp-4">
            {FnFormatLongWords(StrDescriptionBlo)}
          </p>
          
          <Link 
            href={`/admin/manageBlogs/${IntIdBlo}`}
            className={`font-bold text-[0.85rem] mt-auto self-start ${StrLinkHoverClassesBlo} text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 rounded-md pt-1`}
          >
            Leer más...
          </Link>
        </div>
      </div>

      {/* Contenedor Inferior: Botones de Acción */}
      <div className="w-full flex flex-row justify-end flex-wrap gap-2 mt-auto pt-3 border-t border-card-border shrink-0">
        {FnRenderButtonsBlo()}
      </div>

    </article>
  );
}