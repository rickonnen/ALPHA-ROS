"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import ArticleCardAdmin from "./articleCardAdmin";
import { useHoverAnimation } from "@/components/hooks/useHoverAnimation";
import { blogState } from "@/types/blogType";
import { ArticleCardSkeleton } from "@/app/home/blogs/articleCardSkeleton";
/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 25/04/2026
 * funcionalidad: panel de administracion para gestionar estados de los blogs
 */
interface adminBlogData {
  IntIdBlo: number;
  StrTitleBlo: string;
  StrDescriptionBlo: string;
  StrImageUrlBlo: string;
  StrDateBlo: string;
  StrStateBlo: string;
  BolIsDeletedBlo: boolean;
  ObjAuthorBlo?: {
    name: string;
    avatar?: string;
  };
  StrReadTimeBlo?: string;
}

const INT_ITEMS_PER_PAGE = 9;
const ARR_TABS_BLO = ["NO PUBLICADOS", "PUBLICADOS", "NO VISIBLES", "RECHAZADOS"];
const CLS_FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function AdminBlogsPage() {
  const [ArrBlogsBlo, SetArrBlogsBlo] = useState<adminBlogData[]>([]);
  const [BolIsLoadingBlo, SetBolIsLoadingBlo] = useState<boolean>(true);
  const [StrActiveTabBlo, SetStrActiveTabBlo] = useState<string>("NO PUBLICADOS");
  const [IntCurrentPageBlo, SetIntCurrentPageBlo] = useState<number>(1);

  const StrHoverAnimBlo = useHoverAnimation(false, false, 'pointer', true, true);

  const StrPageTitleBlo = useMemo(() => {
    switch (StrActiveTabBlo) {
      case "NO PUBLICADOS": return "ACEPTAR LA PUBLICACION DE BLOGS";
      case "PUBLICADOS": return "ELIMINAR BLOG'S PUBLICADOS";
      case "NO VISIBLES": return "BLOG'S ELIMINADOS POR EL USUARIO O ADMINISTRADOR";
      case "RECHAZADOS": return "BLOG'S RECHAZADOS";
      default: return "GESTIÓN DE BLOGS";
    }
  }, [StrActiveTabBlo]);

  useEffect(() => {
    const ObjAbortControllerBlo = new AbortController();

    const FnFetchAdminBlogsBlo = async () => {
      try {
        SetBolIsLoadingBlo(true);
        const ObjResponseBlo = await fetch("/api/admin/blogs", {
          signal: ObjAbortControllerBlo.signal,
        });
        
        if (!ObjResponseBlo.ok) throw new Error("error al obtener blogs administrativos");

        const ArrDataBlo: adminBlogData[] = await ObjResponseBlo.json();
        SetArrBlogsBlo(ArrDataBlo);
      } catch (ObjErrorBlo: any) {
        if (ObjErrorBlo.name !== "AbortError") {
          console.error("[FETCH_ADMIN_BLOGS_ERROR]", ObjErrorBlo);
        }
      } finally {
        if (!ObjAbortControllerBlo.signal.aborted) {
          SetBolIsLoadingBlo(false);
        }
      }
    };

    FnFetchAdminBlogsBlo();
    return () => ObjAbortControllerBlo.abort();
  }, []);

  const ArrFilteredBlogsBlo = useMemo(() => {
    return ArrBlogsBlo.filter((ObjBlogBlo) => {
      if (StrActiveTabBlo === "NO PUBLICADOS") {
        return ObjBlogBlo.StrStateBlo === blogState.NOPUBLICADO && !ObjBlogBlo.BolIsDeletedBlo;
      }
      if (StrActiveTabBlo === "PUBLICADOS") {
        return ObjBlogBlo.StrStateBlo === blogState.PUBLICADO && !ObjBlogBlo.BolIsDeletedBlo;
      }
      if (StrActiveTabBlo === "NO VISIBLES") {
        return ObjBlogBlo.BolIsDeletedBlo === true || ObjBlogBlo.StrStateBlo === blogState.NOVISIBLE;
      }
      if (StrActiveTabBlo === "RECHAZADOS") {
        return ObjBlogBlo.StrStateBlo === blogState.RECHAZADO && !ObjBlogBlo.BolIsDeletedBlo;
      }
      return false;
    });
  }, [ArrBlogsBlo, StrActiveTabBlo]);

  const IntTotalPagesBlo = Math.ceil(ArrFilteredBlogsBlo.length / INT_ITEMS_PER_PAGE);
  const ArrPaginatedBlogsBlo = useMemo(() => {
    const IntStartIndexBlo = (IntCurrentPageBlo - 1) * INT_ITEMS_PER_PAGE;
    const IntEndIndexBlo = IntStartIndexBlo + INT_ITEMS_PER_PAGE;
    return ArrFilteredBlogsBlo.slice(IntStartIndexBlo, IntEndIndexBlo);
  }, [ArrFilteredBlogsBlo, IntCurrentPageBlo]);

  const FnHandleTabChangeBlo = (StrTabBlo: string) => {
    SetStrActiveTabBlo(StrTabBlo);
    SetIntCurrentPageBlo(1);
  };

  const FnHandleCardActionBlo = async (IntIdBlo: number, StrActionBlo: string) => {
    try {
      SetBolIsLoadingBlo(true);
      let ObjResponseBlo;

      if (StrActionBlo === "BORRADO_PERMANENTE") {
        ObjResponseBlo = await fetch(`/api/admin/blogs/${IntIdBlo}`, {
          method: "DELETE",
        });
      } else {
        ObjResponseBlo = await fetch(`/api/admin/blogs/${IntIdBlo}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: StrActionBlo }),
        });
      }

      if (!ObjResponseBlo.ok) throw new Error("No se pudo completar la acción");

      SetArrBlogsBlo((prevBlogs) => {
        if (StrActionBlo === "BORRADO_PERMANENTE") {
          return prevBlogs.filter(blog => blog.IntIdBlo !== IntIdBlo);
        }

        return prevBlogs.map((blog) => {
          if (blog.IntIdBlo === IntIdBlo) {
            let newState = blog.StrStateBlo;
            let isDeleted = blog.BolIsDeletedBlo;

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

            return { ...blog, StrStateBlo: newState, BolIsDeletedBlo: isDeleted };
          }
          return blog;
        });
      });

    } catch (error) {
      console.error("[ACTION_ERROR]", error);
      alert("Hubo un error al procesar la acción.");
    } finally {
      SetBolIsLoadingBlo(false);
    }
  };

  const FnScrollToTopBlo = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const FnHandlePrevPageBlo = () => {
    if (IntCurrentPageBlo > 1) { SetIntCurrentPageBlo(IntCurrentPageBlo - 1); FnScrollToTopBlo(); }
  };

  const FnHandleNextPageBlo = () => {
    if (IntCurrentPageBlo < IntTotalPagesBlo) { SetIntCurrentPageBlo(IntCurrentPageBlo + 1); FnScrollToTopBlo(); }
  };

  const FnHandlePageClickBlo = (IntPageNumBlo: number) => {
    SetIntCurrentPageBlo(IntPageNumBlo); FnScrollToTopBlo();
  };

  return (
    <main className="w-full px-4 sm:px-8 lg:px-16 py-8 min-h-screen flex flex-col gap-6 bg-background">
      <div className="w-full text-center mb-4">
        <h1 className="text-main-title font-black text-foreground uppercase tracking-wide">
          {StrPageTitleBlo}
        </h1>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-card-border">
        {ARR_TABS_BLO.map((StrTabBlo) => (
          <button
            key={StrTabBlo}
            onClick={() => FnHandleTabChangeBlo(StrTabBlo)}
            className={`px-4 py-2 text-xs font-bold uppercase transition-colors border border-b-0 ${
              StrActiveTabBlo === StrTabBlo
                ? "bg-secondary-fund text-foreground border-card-border shadow-sm"
                : "bg-background text-foreground/60 border-transparent hover:bg-secondary-fund/50"
            }`}
          >
            {StrTabBlo}
          </button>
        ))}
      </div>

      <div className="bg-secondary-fund p-6 sm:p-8 rounded-sm w-full min-h-[400px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
          {BolIsLoadingBlo ? (
            Array.from({ 
              length: Math.min(Math.max(3, Math.ceil(ArrFilteredBlogsBlo.length / 3) * 3), 9) 
            }).map((_, index) => (
              <ArticleCardSkeleton key={index} />
            ))
          ) : ArrPaginatedBlogsBlo.length > 0 ? (
            ArrPaginatedBlogsBlo.map((ObjBlogBlo) => (
              <ArticleCardAdmin
                key={ObjBlogBlo.IntIdBlo}
                IntIdBlo={ObjBlogBlo.IntIdBlo}
                StrTitleBlo={ObjBlogBlo.StrTitleBlo}
                StrDescriptionBlo={ObjBlogBlo.StrDescriptionBlo}
                StrImageUrlBlo={ObjBlogBlo.StrImageUrlBlo}
                StrDateBlo={ObjBlogBlo.StrDateBlo}
                StrCurrentTabBlo={StrActiveTabBlo}
                FnOnActionBlo={FnHandleCardActionBlo}
                ObjAuthorBlo={ObjBlogBlo.ObjAuthorBlo}
                StrReadTimeBlo={ObjBlogBlo.StrReadTimeBlo}
              />
            ))
          ) : (
            <p className="text-foreground/70 col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 font-bold text-body-info">
              No hay blogs en esta categoría.
            </p>
          )}
        </div>
      </div>

      {!BolIsLoadingBlo && IntTotalPagesBlo > 1 && (
        <div className="w-full flex justify-center items-center gap-3 mt-4 py-2">
          {IntCurrentPageBlo > 1 && (
            <button onClick={FnHandlePrevPageBlo} className={`w-10 h-10 flex items-center justify-center rounded-lg bg-primary shadow-sm ${CLS_FOCUS} ${StrHoverAnimBlo}`}>
              <Image src="/leftArrow.svg" alt="Anterior" width={20} height={20} className="w-5 h-5 object-contain brightness-0 invert" />
            </button>
          )}

          {Array.from({ length: IntTotalPagesBlo }).map((_, index) => {
            const IntPageNumBlo = index + 1;
            const BolIsActiveBlo = IntPageNumBlo === IntCurrentPageBlo;

            return (
              <button
                key={IntPageNumBlo}
                onClick={() => FnHandlePageClickBlo(IntPageNumBlo)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-body-info ${CLS_FOCUS} ${StrHoverAnimBlo} ${
                  BolIsActiveBlo ? "bg-secondary text-secondary-foreground shadow-md" : "bg-transparent border-2 border-secondary text-secondary"
                }`}
              >
                {IntPageNumBlo}
              </button>
            );
          })}

          {IntCurrentPageBlo < IntTotalPagesBlo && (
            <button onClick={FnHandleNextPageBlo} className={`w-10 h-10 flex items-center justify-center rounded-lg bg-primary shadow-sm ${CLS_FOCUS} ${StrHoverAnimBlo}`}>
              <Image src="/rightArrow.svg" alt="Siguiente" width={20} height={20} className="w-5 h-5 object-contain brightness-0 invert" />
            </button>
          )}
        </div>
      )}

      <div className="w-full flex mt-4">
        <Link
          href="/admin"
          className={`flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded font-bold shadow-sm ${CLS_FOCUS} ${StrHoverAnimBlo}`}
        >
          <Image src="/leftArrow.svg" alt="Flecha izquierda" width={16} height={16} className="w-4 h-4 object-contain brightness-0 invert" />
          VOLVER
        </Link>
      </div>
    </main>
  );
}