"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import ArticleCard from "./articleCard";
import { useHoverAnimation } from "@/components/hooks/useHoverAnimation";
import GenericDropdown from "@/components/homeComponents/filterPanelSubcomponents/genericDropdown";
/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 24/04/2026
 * funcionalidad: pagina que muestra todos los blogs con filtrado y paginacion (9 por pagina)
 */
interface objBlogData {
  intId: number;
  strTitle: string;
  strDescription: string;
  strImageUrl: string;
  strDate: string;
}

const INT_ITEMS_PER_PAGE = 9;
const ARR_SORT_OPTIONS = ["Más reciente", "Más antiguos"];
const CLS_FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function BlogsPage() {
  const [arrBlogs, setArrBlogs] = useState<objBlogData[]>([]);
  const [bolIsLoading, setBolIsLoading] = useState<boolean>(true);

  const [strSortOrder, setStrSortOrder] = useState<"desc" | "asc">("desc");
  const [intCurrentPage, setIntCurrentPage] = useState<number>(1);

  const [bolIsDropdownOpen, setBolIsDropdownOpen] = useState<boolean>(false);
  const objDropdownRef = useRef<HTMLDivElement>(null);

  const strCurrentSortLabel = strSortOrder === "desc" ? "Más reciente" : "Más antiguos";

  const strHoverAnim = useHoverAnimation(false, false, 'pointer', true, true);

  useEffect(() => {
    if (!bolIsDropdownOpen) return;

    const handleClickOutside = (objEvent: MouseEvent) => {
      if (objDropdownRef.current && !objDropdownRef.current.contains(objEvent.target as Node)) {
        setBolIsDropdownOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [bolIsDropdownOpen]);

  const fnHandleSortSelect = (strOption: string) => {
    setStrSortOrder(strOption === "Más reciente" ? "desc" : "asc");
    setBolIsDropdownOpen(false);
  };

  useEffect(() => {
    const objAbortController = new AbortController();

    const fnFetchAllBlogs = async () => {
      try {
        const objResponse = await fetch("/api/home/blogs", {
          signal: objAbortController.signal,
        });
        
        if (!objResponse.ok) throw new Error("error en la peticion al obtener todos los blogs");

        const arrData: objBlogData[] = await objResponse.json();
        setArrBlogs(arrData);
      } catch (objError: any) {
        if (objError.name !== "AbortError") {
          console.error("[FETCH_ALL_BLOGS_ERROR]", objError);
        }
      } finally {
        if (!objAbortController.signal.aborted) {
          setBolIsLoading(false);
        }
      }
    };

    fnFetchAllBlogs();
    
    return () => objAbortController.abort();
  }, []);

  const arrSortedBlogs = useMemo(() => {
    if (strSortOrder === "desc") {
      return [...arrBlogs];
    } else {
      return [...arrBlogs].reverse();
    }
  }, [arrBlogs, strSortOrder]);

  const intTotalPages = Math.ceil(arrSortedBlogs.length / INT_ITEMS_PER_PAGE);

  const arrPaginatedBlogs = useMemo(() => {
    const intStartIndex = (intCurrentPage - 1) * INT_ITEMS_PER_PAGE;
    const intEndIndex = intStartIndex + INT_ITEMS_PER_PAGE;
    return arrSortedBlogs.slice(intStartIndex, intEndIndex);
  }, [arrSortedBlogs, intCurrentPage]);

  const fnScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const fnHandlePrevPage = () => {
    if (intCurrentPage > 1) {
      setIntCurrentPage(intCurrentPage - 1);
      fnScrollToTop();
    }
  };

  const fnHandleNextPage = () => {
    if (intCurrentPage < intTotalPages) {
      setIntCurrentPage(intCurrentPage + 1);
      fnScrollToTop();
    }
  };

  const fnHandlePageClick = (intPageNum: number) => {
    setIntCurrentPage(intPageNum);
    fnScrollToTop();
  };

  useEffect(() => {
    setIntCurrentPage(1);
  }, [strSortOrder]);

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

          <div ref={objDropdownRef} className="w-44 z-40">
            <GenericDropdown
              strDisplayText={strCurrentSortLabel}
              arrOptions={ARR_SORT_OPTIONS}
              arrSelectedValues={[strCurrentSortLabel]}
              bolIsOpen={bolIsDropdownOpen}
              fnToggleOpen={() => setBolIsDropdownOpen(!bolIsDropdownOpen)}
              fnOnSelect={fnHandleSortSelect}
              bolIsMultiple={false}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full flex-1 relative z-10">
        {bolIsLoading ? (
          <p className="text-muted-foreground col-span-1 md:col-span-2 lg:col-span-3 text-center py-20">
            Cargando publicaciones...
          </p>
        ) : arrPaginatedBlogs.length > 0 ? (
          arrPaginatedBlogs.map((objBlog) => (
            <ArticleCard
              key={objBlog.intId}
              intId={objBlog.intId}
              strTitle={objBlog.strTitle}
              strDescription={objBlog.strDescription}
              strImageUrl={objBlog.strImageUrl}
              strDate={objBlog.strDate}
            />
          ))
        ) : (
          <p className="text-muted-foreground col-span-1 md:col-span-2 lg:col-span-3 text-center py-20">
            No hay publicaciones disponibles en este momento.
          </p>
        )}
      </div>

      {!bolIsLoading && intTotalPages > 1 && (
        <div className="w-full flex justify-center items-center gap-3 mt-8 py-4">
          {intCurrentPage > 1 && (
            <button
              onClick={fnHandlePrevPage}
              className={`w-10 h-10 flex items-center justify-center rounded-lg bg-primary shadow-sm ${CLS_FOCUS} ${strHoverAnim}`}
              aria-label="Página anterior"
            >
              <Image src="/leftArrow.svg" alt="Anterior" width={20} height={20} className="w-5 h-5 object-contain brightness-0 invert" />
            </button>
          )}

          {Array.from({ length: intTotalPages }).map((_, index) => {
            const intPageNum = index + 1;
            const bolIsActive = intPageNum === intCurrentPage;

            return (
              <button
                key={intPageNum}
                onClick={() => fnHandlePageClick(intPageNum)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg text-[1.1rem] font-bold ${CLS_FOCUS} ${strHoverAnim} ${
                  bolIsActive
                    ? "bg-secondary text-secondary-foreground shadow-md"
                    : "bg-transparent border-2 border-secondary text-secondary"
                }`}
              >
                {intPageNum}
              </button>
            );
          })}

          {intCurrentPage < intTotalPages && (
            <button
              onClick={fnHandleNextPage}
              className={`w-10 h-10 flex items-center justify-center rounded-lg bg-primary shadow-sm ${CLS_FOCUS} ${strHoverAnim}`}
              aria-label="Página siguiente"
            >
              <Image src="/rightArrow.svg" alt="Siguiente" width={20} height={20} className="w-5 h-5 object-contain brightness-0 invert" />
            </button>
          )}
        </div>
      )}

      <div className="w-full flex justify-center mt-8 pt-8 border-t border-border/50">
        <Link
          href="/"
          className={`flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-sm ${CLS_FOCUS} ${strHoverAnim}`}
        >
          <Image src="/leftArrow.svg" alt="Flecha izquierda" width={20} height={20} className="w-5 h-5 object-contain brightness-0 invert" />
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}