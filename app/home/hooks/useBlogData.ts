import { useState, useEffect } from "react";
import { singleBlogData } from "@/types/blogType";
/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 09/05/2026
 * funcionalidad: hook personalizado que encapsula la petición a la API
 * gestiona los estados de carga y error de un blog específico
 */
export function useBlogData(strBlogIdBlo: string) {
  const [objBlogBlo, setObjBlogBlo] = useState<singleBlogData | null>(null);
  const [bolIsLoadingBlo, setBolIsLoadingBlo] = useState<boolean>(true);
  const [bolHasErrorBlo, setBolHasErrorBlo] = useState<boolean>(false);

  useEffect(() => {
    const fnFetchSingleBlogBlo = async () => {
      try {
        const objResponseBlo = await fetch(`/api/home/blogs/${strBlogIdBlo}`);
        if (!objResponseBlo.ok) throw new Error("error al cargar el blog");

        const objDataBlo: singleBlogData = await objResponseBlo.json();
        setObjBlogBlo(objDataBlo);
      } catch (objErrorBlo) {
        console.error("[FETCH_SINGLE_BLOG_ERROR]", objErrorBlo);
        setBolHasErrorBlo(true);
      } finally {
        setBolIsLoadingBlo(false);
      }
    };

    fnFetchSingleBlogBlo();
  }, [strBlogIdBlo]);

  return { objBlogBlo, bolIsLoadingBlo, bolHasErrorBlo };
}