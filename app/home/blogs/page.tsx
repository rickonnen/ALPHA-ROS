"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ArticleCard from "./articleCard";
import { useHoverAnimation } from "@/components/hooks/useHoverAnimation";
import GenericDropdown from "@/components/homeComponents/filterPanelSubcomponents/genericDropdown";
import { useBlogActions } from "@/components/hooks/useBlogActions";
import { useAuth } from "@/app/auth/AuthContext";
import { ArticleCardSkeleton } from "./articleCardSkeleton";

/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 24/04/2026
 * funcionalidad: pagina que muestra todos los blogs con filtrado y paginacion (9 por pagina)
 */
interface blogData {
  IntIdBlo: number;
  StrTitleBlo: string;
  StrDescriptionBlo: string;
  StrImageUrlBlo: string;
  StrDateBlo: string;
  ObjAuthorBlo?: {
    name: string;
    avatar?: string;
  };
  StrReadTimeBlo?: string;
}

const INT_ITEMS_PER_PAGE = 9;
const ARR_SORT_OPTIONS = ["Más reciente", "Más antiguos"];
const CLS_FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function BlogsPage() {
  const router = useRouter();

  // 2. Extraemos el usuario actual
  const { user: objUser } = useAuth();
  
  // 3. Usamos nuestro nuevo Custom Hook para la lógica del botón
  const { checkAndCreateBlog, isChecking } = useBlogActions();

  const [ArrBlogsBlo, SetArrBlogsBlo] = useState<blogData[]>([]);
  const [BolIsLoadingBlo, SetBolIsLoadingBlo] = useState<boolean>(true);

  const [StrSortOrderBlo, SetStrSortOrderBlo] = useState<"desc" | "asc">(
    "desc"
  );
  const [IntCurrentPageBlo, SetIntCurrentPageBlo] = useState<number>(1);

  const [BolIsDropdownOpenBlo, SetBolIsDropdownOpenBlo] =
    useState<boolean>(false);

  const ObjDropdownRefBlo = useRef<HTMLDivElement>(null);

  const StrCurrentSortLabelBlo =
    StrSortOrderBlo === "desc" ? "Más reciente" : "Más antiguos";

  const StrHoverAnimBlo = useHoverAnimation(false, false, "pointer", true, true);

  useEffect(() => {
    if (!BolIsDropdownOpenBlo) return;

    const FnHandleClickOutsideBlo = (ObjEventBlo: MouseEvent) => {
      if (
        ObjDropdownRefBlo.current &&
        !ObjDropdownRefBlo.current.contains(ObjEventBlo.target as Node)
      ) {
        SetBolIsDropdownOpenBlo(false);
      }
    };

    document.addEventListener("mousedown", FnHandleClickOutsideBlo);
    return () =>
      document.removeEventListener("mousedown", FnHandleClickOutsideBlo);
  }, [BolIsDropdownOpenBlo]);

  const FnHandleSortSelectBlo = (StrOptionBlo: string) => {
    SetStrSortOrderBlo(StrOptionBlo === "Más reciente" ? "desc" : "asc");
    SetBolIsDropdownOpenBlo(false);
  };

  useEffect(() => {
    const ObjAbortControllerBlo = new AbortController();

    const FnFetchAllBlogsBlo = async () => {
      try {
        const ObjResponseBlo = await fetch("/api/home/blogs", {
          signal: ObjAbortControllerBlo.signal,
        });

        if (!ObjResponseBlo.ok) {
          throw new Error("error en la peticion al obtener todos los blogs");
        }

        const ArrDataBlo: blogData[] = await ObjResponseBlo.json();
        SetArrBlogsBlo(ArrDataBlo);
      } catch (ObjErrorBlo: any) {
        if (ObjErrorBlo.name !== "AbortError") {
          console.error("[FETCH_ALL_BLOGS_ERROR]", ObjErrorBlo);
        }
      } finally {
        if (!ObjAbortControllerBlo.signal.aborted) {
          SetBolIsLoadingBlo(false);
        }
      }
    };

    FnFetchAllBlogsBlo();

    return () => ObjAbortControllerBlo.abort();
  }, []);

  const ArrSortedBlogsBlo = useMemo(() => {
    if (StrSortOrderBlo === "desc") {
      return [...ArrBlogsBlo];
    } else {
      return [...ArrBlogsBlo].reverse();
    }
  }, [ArrBlogsBlo, StrSortOrderBlo]);

  const IntTotalPagesBlo = Math.ceil(
    ArrSortedBlogsBlo.length / INT_ITEMS_PER_PAGE
  );

  const ArrPaginatedBlogsBlo = useMemo(() => {
    const IntStartIndexBlo = (IntCurrentPageBlo - 1) * INT_ITEMS_PER_PAGE;
    const IntEndIndexBlo = IntStartIndexBlo + INT_ITEMS_PER_PAGE;
    return ArrSortedBlogsBlo.slice(IntStartIndexBlo, IntEndIndexBlo);
  }, [ArrSortedBlogsBlo, IntCurrentPageBlo]);

  const FnScrollToTopBlo = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const FnHandlePrevPageBlo = () => {
    if (IntCurrentPageBlo > 1) {
      SetIntCurrentPageBlo(IntCurrentPageBlo - 1);
      FnScrollToTopBlo();
    }
  };

  const FnHandleNextPageBlo = () => {
    if (IntCurrentPageBlo < IntTotalPagesBlo) {
      SetIntCurrentPageBlo(IntCurrentPageBlo + 1);
      FnScrollToTopBlo();
    }
  };

  const FnHandlePageClickBlo = (IntPageNumBlo: number) => {
    SetIntCurrentPageBlo(IntPageNumBlo);
    FnScrollToTopBlo();
  };

  useEffect(() => {
    SetIntCurrentPageBlo(1);
  }, [StrSortOrderBlo]);

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-12 min-h-screen flex flex-col gap-6">
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-[2rem] font-bold text-foreground">
            Blogs de la comunidad
          </h1>
          <p className="text-[1rem] text-foreground/70 mt-1">
            Explora todas nuestras publicaciones, guías y novedades.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Ordenar por:
          </span>

          <div ref={ObjDropdownRefBlo} className="w-44 z-40">
            <GenericDropdown
              strDisplayText={StrCurrentSortLabelBlo}
              arrOptions={ARR_SORT_OPTIONS}
              arrSelectedValues={[StrCurrentSortLabelBlo]}
              bolIsOpen={BolIsDropdownOpenBlo}
              fnToggleOpen={() =>
                SetBolIsDropdownOpenBlo(!BolIsDropdownOpenBlo)
              }
              fnOnSelect={FnHandleSortSelectBlo}
              bolIsMultiple={false}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full flex-1 relative z-10">
        {BolIsLoadingBlo ? (
          Array.from({ 
              length: Math.min(Math.max(3, Math.ceil(ArrPaginatedBlogsBlo.length / 3) * 3), 9) 
            }).map((_, index) => (
              <ArticleCardSkeleton key={index} />
            ))
        ) : ArrPaginatedBlogsBlo.length > 0 ? (
          ArrPaginatedBlogsBlo.map((ObjBlogBlo) => (
            <ArticleCard
              key={ObjBlogBlo.IntIdBlo}
              IntIdBlo={ObjBlogBlo.IntIdBlo}
              StrTitleBlo={ObjBlogBlo.StrTitleBlo}
              StrDescriptionBlo={ObjBlogBlo.StrDescriptionBlo}
              StrImageUrlBlo={ObjBlogBlo.StrImageUrlBlo}
              StrDateBlo={ObjBlogBlo.StrDateBlo}
              ObjAuthorBlo={ObjBlogBlo.ObjAuthorBlo}
              StrReadTimeBlo={ObjBlogBlo.StrReadTimeBlo}
            />
          ))
        ) : (
          <p className="text-muted-foreground col-span-1 md:col-span-2 lg:col-span-3 text-center py-20">
            No hay publicaciones disponibles en este momento.
          </p>
        )}
      </div>

      {!BolIsLoadingBlo && IntTotalPagesBlo > 1 && (
        <div className="w-full flex justify-center items-center gap-3 mt-8 py-4">
          {IntCurrentPageBlo > 1 && (
            <button
              onClick={FnHandlePrevPageBlo}
              className={`w-10 h-10 flex items-center justify-center rounded-lg bg-primary shadow-sm ${CLS_FOCUS} ${StrHoverAnimBlo}`}
              aria-label="Página anterior"
            >
              <Image
                src="/leftArrow.svg"
                alt="Anterior"
                width={20}
                height={20}
                className="w-5 h-5 object-contain brightness-0 invert"
              />
            </button>
          )}

          {Array.from({ length: IntTotalPagesBlo }).map((_, index) => {
            const IntPageNumBlo = index + 1;
            const BolIsActiveBlo = IntPageNumBlo === IntCurrentPageBlo;

            return (
              <button
                key={IntPageNumBlo}
                onClick={() => FnHandlePageClickBlo(IntPageNumBlo)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg text-[1.1rem] font-bold ${CLS_FOCUS} ${StrHoverAnimBlo} ${
                  BolIsActiveBlo
                    ? "bg-secondary text-secondary-foreground shadow-md"
                    : "bg-transparent border-2 border-secondary text-secondary"
                }`}
              >
                {IntPageNumBlo}
              </button>
            );
          })}

          {IntCurrentPageBlo < IntTotalPagesBlo && (
            <button
              onClick={FnHandleNextPageBlo}
              className={`w-10 h-10 flex items-center justify-center rounded-lg bg-primary shadow-sm ${CLS_FOCUS} ${StrHoverAnimBlo}`}
              aria-label="Página siguiente"
            >
              <Image
                src="/rightArrow.svg"
                alt="Siguiente"
                width={20}
                height={20}
                className="w-5 h-5 object-contain brightness-0 invert"
              />
            </button>
          )}
        </div>
      )}

      <div className="w-full flex flex-wrap justify-center gap-4 mt-8 pt-8 border-t border-border/50">
        <Link
          href="/"
          className={`flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-sm ${CLS_FOCUS} ${StrHoverAnimBlo}`}
        >
          <Image
            src="/leftArrow.svg"
            alt="Flecha izquierda"
            width={20}
            height={20}
            className="w-5 h-5 object-contain brightness-0 invert"
          />
          Volver al inicio
        </Link>

        {/* Botón exclusivo para usuarios logeados */}
        {objUser && (
          <button
            type="button"
            onClick={checkAndCreateBlog}
            disabled={isChecking}
            className={`flex items-center gap-2 px-8 py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold shadow-sm ${CLS_FOCUS} ${StrHoverAnimBlo} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {isChecking ? "Verificando..." : "Crear mi blog"}
          </button>
        )}
      </div>
    </main>
  );
}