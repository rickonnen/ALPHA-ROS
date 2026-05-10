/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 09/05/2026
 * funcionalidad: botones de control administrativo (Publicar, Rechazar, Eliminar)
 */
import { singleAdminBlogData, blogState } from "@/types/blogType";
import { useHoverAnimation } from "@/components/hooks/useHoverAnimation";

interface AdminBlogActionsProps {
  ObjBlogBlo: singleAdminBlogData;
  BolIsUpdatingBlo: boolean;
  FnHandleActionBlo: (StrActionBlo: string) => void;
}

export default function AdminBlogActions({ ObjBlogBlo, BolIsUpdatingBlo, FnHandleActionBlo }: AdminBlogActionsProps) {
  const StrBtnHoverClassesBlo = useHoverAnimation(false, false, 'pointer', true, true);
  
  const BolIsDeletedBlo = ObjBlogBlo.BolIsDeletedBlo;
  const StrStateBlo = ObjBlogBlo.StrStateBlo;
  
  const StrBaseBtnBlo = `text-[0.85rem] font-bold px-6 py-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 transition-all duration-300 shadow-sm ${
    BolIsUpdatingBlo 
      ? "opacity-50 cursor-not-allowed" 
      : `hover:scale-105 hover:shadow-md active:scale-95 ${StrBtnHoverClassesBlo}`
  }`;

  const FnRenderButtonsBlo = () => {
    if (BolIsDeletedBlo || StrStateBlo === blogState.NOVISIBLE || StrStateBlo === blogState.RECHAZADO) {
      return (
        <>
          <button disabled={BolIsUpdatingBlo} onClick={() => FnHandleActionBlo("BORRADO_PERMANENTE")} className={`${StrBaseBtnBlo} bg-secondary text-secondary-foreground`}>
            BORRADO PERMANENTE
          </button>
          <button disabled={BolIsUpdatingBlo} onClick={() => FnHandleActionBlo("PUBLICAR")} className={`${StrBaseBtnBlo} bg-primary text-primary-foreground`}>
            PUBLICAR
          </button>
        </>
      );
    } else if (StrStateBlo === blogState.PUBLICADO) {
      return (
        <button disabled={BolIsUpdatingBlo} onClick={() => FnHandleActionBlo("ELIMINAR")} className={`${StrBaseBtnBlo} bg-secondary text-secondary-foreground`}>
          ELIMINAR
        </button>
      );
    } else {
      return (
        <>
          <button disabled={BolIsUpdatingBlo} onClick={() => FnHandleActionBlo("RECHAZAR")} className={`${StrBaseBtnBlo} bg-secondary-fund text-foreground border border-card-border`}>
            RECHAZAR
          </button>
          <button disabled={BolIsUpdatingBlo} onClick={() => FnHandleActionBlo("ACEPTAR")} className={`${StrBaseBtnBlo} bg-primary text-primary-foreground`}>
            ACEPTAR
          </button>
        </>
      );
    }
  };

  return (
    <div className="w-full flex flex-wrap justify-end items-center gap-3 mt-8 pt-6 border-t border-card-border">
      <span className="mr-auto font-bold text-foreground/50 text-xs tracking-widest">ACCIONES DE GESTIÓN:</span>
      {FnRenderButtonsBlo()}
    </div>
  );
}