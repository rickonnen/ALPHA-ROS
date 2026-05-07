"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ListFilter, RefreshCw } from "lucide-react";
import { useHoverAnimation } from "@/components/hooks/useHoverAnimation";
import { blogState } from "@/types/blogType";
import { useCommentManagement } from "./hooks/useCommentManagement";
import CommentTable from "./components/CommentTable";
import { CLS_FOCUS } from "./types";
/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 06/05/2026
 * funcionalidad: vista principal del panel de administración para la gestión de comentarios
 * contenedor y orquestador utiliza la lógica del hook useCommentManagement
 */
export default function CommentManagementPage() {
  const { state, actions } = useCommentManagement();
  const StrHoverAnimBlo = useHoverAnimation(false, false, 'pointer', true, true);

  return (
    <section className="w-full px-4 sm:px-8 lg:px-16 py-8 min-h-screen flex flex-col gap-6 bg-background animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Título */}
      <div className="w-full text-center mb-6">
        <h1 className="text-main-title font-black text-foreground uppercase tracking-wide">
          Gestión de Comentarios
        </h1>
      </div>

      {/* Buscador */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center w-full mb-2">
        <p className="text-body-info font-medium text-muted-foreground">
          Selecciona una publicación para moderar sus comentarios.
        </p>

        <div className="relative w-full max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Buscar publicación..."
            value={state.strSearchTerm}
            onChange={actions.handleSearchChange}
            className="w-full rounded-md border border-card-border bg-card py-2 pl-10 pr-4 text-body-info text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Filtros y Actualizar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full border-b border-card-border pb-2 gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-2 text-muted-foreground">
              <ListFilter className="h-4 w-4" />
              <span className="text-sm font-bold uppercase">Filtros:</span>
          </div>
          
          <button
            onClick={() => actions.handleTabChange("TODOS")}
            className={`px-4 py-1.5 text-sm font-bold uppercase transition-colors rounded-t-md border border-b-0 ${
              state.strActiveTab === "TODOS"
                ? "bg-secondary-fund text-foreground border-card-border shadow-sm"
                : "bg-background text-foreground/60 border-transparent hover:bg-secondary-fund/50"
            } ${CLS_FOCUS}`}
          >
            [ Todos ({state.counts.todos}) ]
          </button>

          <button
            onClick={() => actions.handleTabChange(blogState.PUBLICADO)}
            className={`px-4 py-1.5 text-sm font-bold uppercase transition-colors rounded-t-md border border-b-0 ${
              state.strActiveTab === blogState.PUBLICADO
                ? "bg-secondary-fund text-foreground border-card-border shadow-sm"
                : "bg-background text-foreground/60 border-transparent hover:bg-secondary-fund/50"
            } ${CLS_FOCUS}`}
          >
            [ Publicados ({state.counts.publicados}) ]
          </button>

          <button
            onClick={() => actions.handleTabChange(blogState.NOVISIBLE)}
            className={`px-4 py-1.5 text-sm font-bold uppercase transition-colors rounded-t-md border border-b-0 ${
              state.strActiveTab === blogState.NOVISIBLE
                ? "bg-secondary-fund text-foreground border-card-border shadow-sm"
                : "bg-background text-foreground/60 border-transparent hover:bg-secondary-fund/50"
            } ${CLS_FOCUS}`}
          >
            [ No Visibles ({state.counts.noVisibles}) ]
          </button>
        </div>

        <button
          onClick={actions.fetchBlogs}
          disabled={state.BolIsLoadingBlo}
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-primary text-xs font-bold uppercase text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed ${CLS_FOCUS} ${StrHoverAnimBlo}`}
        >
          <RefreshCw className={`h-4 w-4 ${state.BolIsLoadingBlo ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {/* Componente Tabla */}
      <CommentTable 
        BolIsLoadingBlo={state.BolIsLoadingBlo} 
        ArrPaginatedBlogsBlo={state.ArrPaginatedBlogsBlo} 
      />

      {/* Paginación */}
      {!state.BolIsLoadingBlo && state.IntTotalPagesBlo > 1 && (
        <div className="w-full flex justify-center items-center gap-3 mt-4 py-2">
          {state.IntCurrentPageBlo > 1 && (
            <button onClick={actions.FnHandlePrevPageBlo} className={`w-10 h-10 flex items-center justify-center rounded-lg bg-primary shadow-sm ${CLS_FOCUS} ${StrHoverAnimBlo}`}>
              <Image src="/leftArrow.svg" alt="Anterior" width={20} height={20} className="w-5 h-5 object-contain brightness-0 invert" />
            </button>
          )}

          {Array.from({ length: state.IntTotalPagesBlo }).map((_, index) => {
            const IntPageNumBlo = index + 1;
            const BolIsActiveBlo = IntPageNumBlo === state.IntCurrentPageBlo;

            return (
              <button
                key={IntPageNumBlo}
                onClick={() => actions.FnHandlePageClickBlo(IntPageNumBlo)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-body-info ${CLS_FOCUS} ${StrHoverAnimBlo} ${
                  BolIsActiveBlo ? "bg-secondary text-secondary-foreground shadow-md" : "bg-transparent border-2 border-secondary text-secondary"
                }`}
              >
                {IntPageNumBlo}
              </button>
            );
          })}

          {state.IntCurrentPageBlo < state.IntTotalPagesBlo && (
            <button onClick={actions.FnHandleNextPageBlo} className={`w-10 h-10 flex items-center justify-center rounded-lg bg-primary shadow-sm ${CLS_FOCUS} ${StrHoverAnimBlo}`}>
              <Image src="/rightArrow.svg" alt="Siguiente" width={20} height={20} className="w-5 h-5 object-contain brightness-0 invert" />
            </button>
          )}
        </div>
      )}

      {/* Botón Volver */}
      <div className="w-full flex mt-4">
        <Link
          href="/admin"
          className={`flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded font-bold shadow-sm ${CLS_FOCUS} ${StrHoverAnimBlo}`}
        >
          <Image src="/leftArrow.svg" alt="Flecha izquierda" width={16} height={16} className="w-4 h-4 object-contain brightness-0 invert" />
          VOLVER
        </Link>
      </div>
    </section>
  );
}