import { useState, useMemo, useEffect, useCallback } from "react";
import { CommentDetailData, CommentTabFilter, INT_COMMENTS_PER_PAGE } from "../[commentId]/types";

/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 06/05/2026
 * funcionalidad: Custom hook
 * obtiene los comentarios de un blog específico y maneja el borrado lógico y permanente
 */
export function useCommentDetail(blogId: string) {
  const [strBlogTitle, setStrBlogTitle] = useState<string>("Cargando título...");
  const [arrComments, setArrComments] = useState<CommentDetailData[]>([]);
  const [strActiveTab, setStrActiveTab] = useState<CommentTabFilter>("TODOS");
  const [IntCurrentPage, SetIntCurrentPage] = useState<number>(1);
  const [BolIsLoading, SetBolIsLoading] = useState<boolean>(true);

  const fetchComments = useCallback(async () => {
    try {
      SetBolIsLoading(true);
      const response = await fetch(`/api/admin/commentManagement/${blogId}`);
      
      if (!response.ok) {
        throw new Error("Error al obtener los detalles del blog");
      }
      
      const data = await response.json();
      setStrBlogTitle(data.strBlogTitle);
      setArrComments(data.arrComments);
    } catch (error) {
      console.error("[FETCH_COMMENTS_ERROR]", error);
    } finally {
      SetBolIsLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAction = async (commentId: number, isSoftDelete: boolean) => {
    try {
      const method = isSoftDelete ? "PATCH" : "DELETE";
      const response = await fetch(`/api/admin/commentManagement/${blogId}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_comentario: commentId }),
      });

      if (!response.ok) {
        throw new Error("Error al procesar la acción del comentario");
      }

      setArrComments(prev => {
        if (!isSoftDelete) {
          return prev.filter(c => c.id !== commentId);
        }
        // Soft Delete actualiza la fecha de borrado visualmente
        return prev.map(c => c.id === commentId ? { ...c, deletedAt: new Date().toISOString() } : c);
      });
    } catch (error) {
      console.error("[ACTION_COMMENT_ERROR]", error);
    }
  };

  const arrFiltered = useMemo(() => {
    return arrComments.filter((comment) => {
      if (strActiveTab === "VISIBLES") return comment.deletedAt === null;
      if (strActiveTab === "BORRADOS") return comment.deletedAt !== null;
      return true;
    });
  }, [arrComments, strActiveTab]);

  const counts = useMemo(() => ({
    todos: arrComments.length,
    visibles: arrComments.filter(c => c.deletedAt === null).length,
    borrados: arrComments.filter(c => c.deletedAt !== null).length,
  }), [arrComments]);

  const IntTotalPages = Math.ceil(arrFiltered.length / INT_COMMENTS_PER_PAGE);
  
  const ArrPaginated = useMemo(() => {
    const start = (IntCurrentPage - 1) * INT_COMMENTS_PER_PAGE;
    return arrFiltered.slice(start, start + INT_COMMENTS_PER_PAGE);
  }, [arrFiltered, IntCurrentPage]);

  const FnScrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const actions = {
    handleTabChange: (tab: CommentTabFilter) => { setStrActiveTab(tab); SetIntCurrentPage(1); },
    FnHandlePrevPage: () => { if (IntCurrentPage > 1) { SetIntCurrentPage(p => p - 1); FnScrollToTop(); } },
    FnHandleNextPage: () => { if (IntCurrentPage < IntTotalPages) { SetIntCurrentPage(p => p + 1); FnScrollToTop(); } },
    FnHandlePageClick: (page: number) => { SetIntCurrentPage(page); FnScrollToTop(); },
    handleAction,
    fetchComments
  };

  return { state: { strBlogTitle, strActiveTab, IntCurrentPage, BolIsLoading, counts, ArrPaginated, IntTotalPages }, actions };
}