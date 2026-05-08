"use client";

import { useEffect, useState, use } from "react"; 
import Image from "next/image";
import Link from "next/link"; 
import { useRouter } from "next/navigation";
import { X as ObjXIcon } from "lucide-react"; 
import { useHoverAnimation } from "@/components/hooks/useHoverAnimation";
import { blogState } from "@/types/blogType";
/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 25/04/2026
 * funcionalidad: renderiza la vista completa de un blog con controles de administrador
 */
interface singleAdminBlogData {
  IntIdBlo: number;
  StrTitleBlo: string;
  StrDescriptionBlo: string;
  StrContentBlo: string;
  StrImageUrlBlo: string;
  StrDateBlo: string;
  StrAuthorBlo: string;
  StrStateBlo: blogState;
  BolIsDeletedBlo: boolean;
}

export default function AdminBlogPostPage({ params }: { params: Promise<{ blogId: string }> }) {
  const ResolvedParamsBlo = use(params);
  const router = useRouter(); 
  
  const [ObjBlogBlo, SetObjBlogBlo] = useState<singleAdminBlogData | null>(null);
  const [BolIsLoadingBlo, SetBolIsLoadingBlo] = useState<boolean>(true);
  const [BolHasErrorBlo, SetBolHasErrorBlo] = useState<boolean>(false);
  const [BolIsUpdatingBlo, SetBolIsUpdatingBlo] = useState<boolean>(false);

  const StrBtnHoverClassesBlo = useHoverAnimation(false, false, 'pointer', true, true);

  useEffect(() => {
    const FnFetchSingleBlogBlo = async () => {
      try {
        const ObjResponseBlo = await fetch(`/api/admin/blogs/${ResolvedParamsBlo.blogId}`);
        if (!ObjResponseBlo.ok) throw new Error("error al cargar el blog administrativo");

        const ObjDataBlo: singleAdminBlogData = await ObjResponseBlo.json();
        SetObjBlogBlo(ObjDataBlo);
      } catch (ObjErrorBlo) {
        console.error("[FETCH_ADMIN_SINGLE_BLOG_ERROR]", ObjErrorBlo);
        SetBolHasErrorBlo(true);
      } finally {
        SetBolIsLoadingBlo(false);
      }
    };

    FnFetchSingleBlogBlo();
  }, [ResolvedParamsBlo.blogId]);

  const FnHandleActionBlo = async (StrActionBlo: string) => {
    if (!ObjBlogBlo || BolIsUpdatingBlo) return;

    try {
      SetBolIsUpdatingBlo(true);
      let ObjResponseBlo;

      if (StrActionBlo === "BORRADO_PERMANENTE") {
        ObjResponseBlo = await fetch(`/api/admin/blogs/${ObjBlogBlo.IntIdBlo}`, {
          method: "DELETE",
        });
      } else {
        ObjResponseBlo = await fetch(`/api/admin/blogs/${ObjBlogBlo.IntIdBlo}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: StrActionBlo }),
        });
      }

      if (!ObjResponseBlo.ok) throw new Error("No se pudo completar la acción");

      if (StrActionBlo === "BORRADO_PERMANENTE") {
        router.push("/admin/manageBlogs");
      } else {
        let newState = ObjBlogBlo.StrStateBlo;
        let isDeleted = ObjBlogBlo.BolIsDeletedBlo;

        if (StrActionBlo === "ACEPTAR" || StrActionBlo === "PUBLICAR") {
          newState = blogState.PUBLICADO;
          isDeleted = false;
        } else if (StrActionBlo === "RECHAZAR") {
          newState = blogState.RECHAZADO;
          isDeleted = false;
        } else if (StrActionBlo === "ELIMINAR") {
          newState = blogState.NOVISIBLE;
          isDeleted = true;
        }

        SetObjBlogBlo({ ...ObjBlogBlo, StrStateBlo: newState, BolIsDeletedBlo: isDeleted });
      }

    } catch (error) {
      console.error("[ADMIN_ACTION_ERROR]", error);
      alert("Hubo un error al procesar la acción.");
    } finally {
      SetBolIsUpdatingBlo(false);
    }
  };

  const FnRenderAdminButtonsBlo = () => {
    if (!ObjBlogBlo) return null;

    const isDeleted = ObjBlogBlo.BolIsDeletedBlo;
    const state = ObjBlogBlo.StrStateBlo;
    
    const baseBtn = `text-[0.85rem] font-bold px-6 py-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 transition-colors shadow-sm ${BolIsUpdatingBlo ? "opacity-50 cursor-not-allowed" : StrBtnHoverClassesBlo}`;

    if (isDeleted || state === blogState.NOVISIBLE || state === blogState.RECHAZADO) {
      return (
        <>
          <button disabled={BolIsUpdatingBlo} onClick={() => FnHandleActionBlo("BORRADO_PERMANENTE")} className={`${baseBtn} bg-secondary text-secondary-foreground`}>
            BORRADO PERMANENTE
          </button>
          <button disabled={BolIsUpdatingBlo} onClick={() => FnHandleActionBlo("PUBLICAR")} className={`${baseBtn} bg-primary text-primary-foreground`}>
            PUBLICAR
          </button>
        </>
      );
    } else if (state === blogState.PUBLICADO) {
      return (
        <button disabled={BolIsUpdatingBlo} onClick={() => FnHandleActionBlo("ELIMINAR")} className={`${baseBtn} bg-secondary text-secondary-foreground`}>
          ELIMINAR
        </button>
      );
    } else {
      return (
        <>
          <button disabled={BolIsUpdatingBlo} onClick={() => FnHandleActionBlo("RECHAZAR")} className={`${baseBtn} bg-secondary-fund text-foreground border border-card-border`}>
            RECHAZAR
          </button>
          <button disabled={BolIsUpdatingBlo} onClick={() => FnHandleActionBlo("ACEPTAR")} className={`${baseBtn} bg-primary text-primary-foreground`}>
            ACEPTAR
          </button>
        </>
      );
    }
  };

  if (BolIsLoadingBlo) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center bg-background">
        <p className="text-foreground/60 font-bold text-body-info">Cargando panel de artículo...</p>
      </div>
    );
  }

  if (BolHasErrorBlo || !ObjBlogBlo) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-secondary font-bold text-subtitle">Error</p>
        <p className="text-foreground/70">No se pudo cargar la información de este artículo.</p>
        <Link 
          href="/admin/manageBlogs"
          className={`px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium ${StrBtnHoverClassesBlo}`}
        >
          Volver a Gestión
        </Link>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen bg-background">
      <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-6 overflow-hidden">
        
        {/* INSIGNIA DE ESTADO */}
        <div className="flex w-full justify-between items-center border-b border-card-border pb-4">
          <span className="text-secondary font-semibold text-body-info uppercase tracking-wider">
            {ObjBlogBlo.StrDateBlo}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
            ObjBlogBlo.BolIsDeletedBlo 
              ? 'bg-secondary/10 text-secondary border-secondary' 
              : 'bg-primary/10 text-primary border-primary'
          }`}>
            {ObjBlogBlo.BolIsDeletedBlo ? "ELIMINADO LÓGICAMENTE" : ObjBlogBlo.StrStateBlo}
          </span>
        </div>

        {/* TÍTULO */}
        <h1 className="text-foreground font-bold text-main-title leading-tight break-words line-clamp-4">
          {ObjBlogBlo.StrTitleBlo}
        </h1>

        {/* DESCRIPCIÓN */}
        <p className="text-foreground/80 text-subtitle leading-relaxed border-l-4 border-primary pl-4 italic break-words">
          {ObjBlogBlo.StrDescriptionBlo}
        </p>

        <div className="w-full aspect-[4/3] relative bg-secondary-fund rounded-2xl overflow-hidden border border-card-border shadow-sm flex items-center justify-center text-foreground/20 mt-4 mb-4">
          {ObjBlogBlo.StrImageUrlBlo ? (
            <Image
              src={ObjBlogBlo.StrImageUrlBlo}
              alt={ObjBlogBlo.StrTitleBlo}
              fill
              sizes="1800px"
              className="object-cover"
              priority 
            />
          ) : (
            <ObjXIcon className="w-20 h-20 opacity-20" strokeWidth={1} />
          )}
        </div>

        {/* whitespace-pre-wrap respeta los saltos de línea y break-words evitará el desbordamiento */}
        <div className="w-full text-foreground text-body-info leading-loose whitespace-pre-wrap break-words">
          {ObjBlogBlo.StrContentBlo}
        </div>

        <div className="w-full mt-4 text-right">
          <p className="text-secondary font-medium text-subtitle">
            Escrito por: {ObjBlogBlo.StrAuthorBlo}
          </p>
        </div>

        {/* CONTROLES DE ADMINISTRADOR */}
        <div className="w-full flex justify-end items-center gap-3 mt-8 pt-6 border-t border-card-border">
          <span className="mr-auto font-bold text-foreground/50 text-xs">ACCIONES DE GESTIÓN:</span>
          {FnRenderAdminButtonsBlo()}
        </div>

        {/* BOTÓN DE VOLVER */}
        <div className="w-full flex justify-center mt-12 pt-8">
          <Link 
            href="/admin/manageBlogs"
            className={`flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-sm ${StrBtnHoverClassesBlo}`}
          >
            <Image 
              src="/leftArrow.svg" 
              alt="Anterior" 
              width={20} 
              height={20} 
              className="w-5 h-5 object-contain brightness-0 invert"
            />
            Volver a Gestión
          </Link>
        </div>
      </div>
    </main>
  );
}