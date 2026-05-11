/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 09/05/2026
 * funcionalidad: obtiene y gestiona los datos de un blog para la vista de moderación
 */
import { useState, useEffect } from "react";
import { singleAdminBlogData } from "@/types/blogType";

export function useAdminBlogData(StrBlogIdBlo: string) {
  const [ObjBlogBlo, SetObjBlogBlo] = useState<singleAdminBlogData | null>(null);
  const [BolIsLoadingBlo, SetBolIsLoadingBlo] = useState<boolean>(true);
  const [BolHasErrorBlo, SetBolHasErrorBlo] = useState<boolean>(false);

  useEffect(() => {
    const FnFetchSingleBlogBlo = async () => {
      try {
        const ObjResponseBlo = await fetch(`/api/admin/blogs/${StrBlogIdBlo}`);
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
  }, [StrBlogIdBlo]);

  return { ObjBlogBlo, SetObjBlogBlo, BolIsLoadingBlo, BolHasErrorBlo };
}