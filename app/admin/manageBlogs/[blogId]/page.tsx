"use client";
/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 25/04/2026
 * funcionalidad: orquesta la vista completa de moderación de un blog
 */
import { useState, use } from "react"; 
import Link from "next/link"; 
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useHoverAnimation } from "@/components/hooks/useHoverAnimation";
import { blogState } from "@/types/blogType";

import { useAdminBlogData } from "@/app/admin/manageBlogs/hooks/useAdminBlogData";
import AdminBlogHeader from "@/app/admin/manageBlogs/components/AdminBlogHeader";
import AdminBlogHero from "@/app/admin/manageBlogs/components/AdminBlogHero";
import AdminBlogActions from "@/app/admin/manageBlogs/components/AdminBlogActions";

export default function AdminBlogPostPage({ params }: { params: Promise<{ blogId: string }> }) {
  const ResolvedParamsBlo = use(params);
  const router = useRouter(); 
  
  const { ObjBlogBlo, SetObjBlogBlo, BolIsLoadingBlo, BolHasErrorBlo } = useAdminBlogData(ResolvedParamsBlo.blogId);
  const [BolIsUpdatingBlo, SetBolIsUpdatingBlo] = useState<boolean>(false);

  const StrBtnHoverClassesBlo = useHoverAnimation(false, false, 'pointer', true, true);

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
        let StrNewStateBlo = ObjBlogBlo.StrStateBlo;
        let BolNewIsDeletedBlo = ObjBlogBlo.BolIsDeletedBlo;

        if (StrActionBlo === "ACEPTAR" || StrActionBlo === "PUBLICAR") {
          StrNewStateBlo = blogState.PUBLICADO;
          BolNewIsDeletedBlo = false;
        } else if (StrActionBlo === "RECHAZAR") {
          StrNewStateBlo = blogState.RECHAZADO;
          BolNewIsDeletedBlo = false;
        } else if (StrActionBlo === "ELIMINAR") {
          StrNewStateBlo = blogState.NOVISIBLE;
          BolNewIsDeletedBlo = true;
        }

        SetObjBlogBlo({ 
          ...ObjBlogBlo, 
          StrStateBlo: StrNewStateBlo, 
          BolIsDeletedBlo: BolNewIsDeletedBlo 
        });
      }

    } catch (ObjErrorBlo) {
      console.error("[ADMIN_ACTION_ERROR]", ObjErrorBlo);
      alert("Hubo un error al procesar la acción.");
    } finally {
      SetBolIsUpdatingBlo(false);
    }
  };

  // carga
  if (BolIsLoadingBlo) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center bg-background">
        <p className="text-foreground/60 font-bold text-body-info animate-pulse">Cargando panel de artículo...</p>
      </div>
    );
  }

  if (BolHasErrorBlo || !ObjBlogBlo) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-destructive font-bold text-subtitle">Error</p>
        <p className="text-foreground/70">No se pudo cargar la información de este artículo.</p>
        <Link 
          href="/admin/manageBlogs"
          className={`px-6 py-2 bg-primary text-primary-foreground rounded-[var(--radius)] font-medium ${StrBtnHoverClassesBlo}`}
        >
          Volver a Gestión
        </Link>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen bg-background font-sans">
      <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col overflow-hidden">
        
        <AdminBlogHeader ObjBlogBlo={ObjBlogBlo} />
        
        <AdminBlogHero ObjBlogBlo={ObjBlogBlo} />
        
        <AdminBlogActions 
          ObjBlogBlo={ObjBlogBlo} 
          BolIsUpdatingBlo={BolIsUpdatingBlo} 
          FnHandleActionBlo={FnHandleActionBlo} 
        />

        {/* boton volver */}
        <div className="w-full flex justify-center mt-12 pt-8">
          <Link 
            href="/admin/manageBlogs"
            className={`flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-[var(--radius)] font-bold shadow-sm ${StrBtnHoverClassesBlo}`}
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a Gestión
          </Link>
        </div>
      </div>
    </main>
  );
}