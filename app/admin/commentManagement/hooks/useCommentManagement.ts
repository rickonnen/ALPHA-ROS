import { useState, useMemo, useEffect, useCallback } from "react";
import { blogState } from "@/types/blogType";
import { CommentBlogData, TabFilterState, INT_ITEMS_PER_PAGE } from "../types";
/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 06/05/2026
 * funcionalidad: Custom hook 
 * se encarga exclusivamente de la obtención de datos (fetching), manejo de estados, 
 * filtrado dinámico y de paginación para los blogs
 */
export function useCommentManagement() {
  const [arrBlogsData, setArrBlogsData] = useState<CommentBlogData[]>([]);
  const [strSearchTerm, setStrSearchTerm] = useState("");
  const [strActiveTab, setStrActiveTab] = useState<TabFilterState>("TODOS");
  const [IntCurrentPageBlo, SetIntCurrentPageBlo] = useState<number>(1);
  const [BolIsLoadingBlo, SetBolIsLoadingBlo] = useState<boolean>(true);

  const fetchBlogs = useCallback(async () => {
    try {
      SetBolIsLoadingBlo(true);
      const response = await fetch("/api/admin/commentManagement");
      if (!response.ok) throw new Error("Error al obtener las publicaciones");
      
      const data: CommentBlogData[] = await response.json();
      setArrBlogsData(data);
    } catch (error) {
      console.error("[FETCH_BLOGS_ERROR]", error);
    } finally {
      SetBolIsLoadingBlo(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const arrFilteredBlogs = useMemo(() => {
    return arrBlogsData.filter((blog) => {
      const matchesTab = strActiveTab === "TODOS" || blog.enumState === strActiveTab;
      const matchesSearch = blog.strTitle.toLowerCase().includes(strSearchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [arrBlogsData, strSearchTerm, strActiveTab]);

  const counts = useMemo(() => ({
    todos: arrBlogsData.length,
    publicados: arrBlogsData.filter(b => b.enumState === blogState.PUBLICADO).length,
    noVisibles: arrBlogsData.filter(b => b.enumState === blogState.NOVISIBLE).length,
  }), [arrBlogsData]);

  const IntTotalPagesBlo = Math.ceil(arrFilteredBlogs.length / INT_ITEMS_PER_PAGE);

  const ArrPaginatedBlogsBlo = useMemo(() => {
    const IntStartIndexBlo = (IntCurrentPageBlo - 1) * INT_ITEMS_PER_PAGE;
    return arrFilteredBlogs.slice(IntStartIndexBlo, IntStartIndexBlo + INT_ITEMS_PER_PAGE);
  }, [arrFilteredBlogs, IntCurrentPageBlo]);

  const FnScrollToTopBlo = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const actions = {
    handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setStrSearchTerm(e.target.value);
      SetIntCurrentPageBlo(1);
    },
    handleTabChange: (tab: TabFilterState) => {
      setStrActiveTab(tab);
      SetIntCurrentPageBlo(1);
    },
    FnHandlePrevPageBlo: () => {
      if (IntCurrentPageBlo > 1) {
        SetIntCurrentPageBlo(prev => prev - 1);
        FnScrollToTopBlo();
      }
    },
    FnHandleNextPageBlo: () => {
      if (IntCurrentPageBlo < IntTotalPagesBlo) {
        SetIntCurrentPageBlo(prev => prev + 1);
        FnScrollToTopBlo();
      }
    },
    FnHandlePageClickBlo: (page: number) => {
      SetIntCurrentPageBlo(page);
      FnScrollToTopBlo();
    },
    fetchBlogs
  };

  return {
    state: { strSearchTerm, strActiveTab, IntCurrentPageBlo, BolIsLoadingBlo, counts, ArrPaginatedBlogsBlo, IntTotalPagesBlo },
    actions
  };
}