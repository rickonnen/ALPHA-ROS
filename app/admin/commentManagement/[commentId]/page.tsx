"use client";

import Link from "next/link";
import Image from "next/image";
import { use } from "react"; 
import { ListFilter, RefreshCw, ArrowLeft } from "lucide-react";
import { useHoverAnimation } from "@/components/hooks/useHoverAnimation";
import { useCommentDetail } from "../hooks/useCommentDetail";
import CommentDetailTable from "../components/CommentDetailTable";
import { CLS_FOCUS } from "../types";
/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 06/05/2026
 * funcionalidad: Vista detalle para moderar los comentarios específicos de una publicación.
 */
export default function CommentDetailPage({ params }: { params: Promise<{ commentId: string }> }) {
  const resolvedParams = use(params);
  const blogId = resolvedParams.commentId;

  const { state, actions } = useCommentDetail(blogId);
  const StrHoverAnimBlo = useHoverAnimation(false, false, 'pointer', true, true);

  return (
    <section className="w-full px-4 sm:px-8 lg:px-16 py-8 min-h-screen flex flex-col gap-6 bg-background animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* botón Volver y Título del Blog */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 border-b border-card-border pb-6">
        <Link
          href="/admin/commentManagement"
          className={`inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold uppercase text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 ${CLS_FOCUS} ${StrHoverAnimBlo}`}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <h1 className="text-subtitle font-black text-foreground">
          Post: <span className="font-medium text-muted-foreground">"{state.strBlogTitle}"</span>
        </h1>
      </div>

      {/* filtros de estado y botón actualizar */}
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
            onClick={() => actions.handleTabChange("VISIBLES")}
            className={`px-4 py-1.5 text-sm font-bold uppercase transition-colors rounded-t-md border border-b-0 ${
              state.strActiveTab === "VISIBLES"
                ? "bg-secondary-fund text-foreground border-card-border shadow-sm"
                : "bg-background text-foreground/60 border-transparent hover:bg-secondary-fund/50"
            } ${CLS_FOCUS}`}
          >
            [ Visibles ({state.counts.visibles}) ]
          </button>

          <button
            onClick={() => actions.handleTabChange("BORRADOS")}
            className={`px-4 py-1.5 text-sm font-bold uppercase transition-colors rounded-t-md border border-b-0 ${
              state.strActiveTab === "BORRADOS"
                ? "bg-secondary-fund text-foreground border-card-border shadow-sm"
                : "bg-background text-foreground/60 border-transparent hover:bg-secondary-fund/50"
            } ${CLS_FOCUS}`}
          >
            [ Borrados ({state.counts.borrados}) ]
          </button>
        </div>

        <button
          onClick={actions.fetchComments}
          disabled={state.BolIsLoading}
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-primary text-xs font-bold uppercase text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed ${CLS_FOCUS} ${StrHoverAnimBlo}`}
        >
          <RefreshCw className={`h-4 w-4 ${state.BolIsLoading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {/* tabla */}
      <CommentDetailTable 
        BolIsLoading={state.BolIsLoading} 
        ArrPaginated={state.ArrPaginated} 
        onAction={actions.handleAction}
      />

      {/* paginación */}
      {!state.BolIsLoading && state.IntTotalPages > 1 && (
        <div className="w-full flex justify-center items-center gap-3 mt-4 py-2">
          {state.IntCurrentPage > 1 && (
            <button onClick={actions.FnHandlePrevPage} className={`w-10 h-10 flex items-center justify-center rounded-lg bg-primary shadow-sm ${CLS_FOCUS} ${StrHoverAnimBlo}`}>
              <Image src="/leftArrow.svg" alt="Anterior" width={20} height={20} className="w-5 h-5 object-contain brightness-0 invert" />
            </button>
          )}

          {Array.from({ length: state.IntTotalPages }).map((_, index) => {
            const pageNum = index + 1;
            const isActive = pageNum === state.IntCurrentPage;

            return (
              <button
                key={pageNum}
                onClick={() => actions.FnHandlePageClick(pageNum)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-body-info ${CLS_FOCUS} ${StrHoverAnimBlo} ${
                  isActive ? "bg-secondary text-secondary-foreground shadow-md" : "bg-transparent border-2 border-secondary text-secondary"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {state.IntCurrentPage < state.IntTotalPages && (
            <button onClick={actions.FnHandleNextPage} className={`w-10 h-10 flex items-center justify-center rounded-lg bg-primary shadow-sm ${CLS_FOCUS} ${StrHoverAnimBlo}`}>
              <Image src="/rightArrow.svg" alt="Siguiente" width={20} height={20} className="w-5 h-5 object-contain brightness-0 invert" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}