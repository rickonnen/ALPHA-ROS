"use client";

import { use } from "react"; 
import Link from "next/link"; 
import { useAuth } from "@/app/auth/AuthContext";
<<<<<<< Updated upstream
import { useBlogData } from "@/app/home/hooks/useBlogData";
import BlogHeader from "@/app/home/components/blog/BlogHeader";
import BlogHero from "@/app/home/components/blog/BlogHero";
import BlogShareButtons from "@/app/home/components/blog/BlogShareButtons";
import BlogNavigationLinks from "@/app/home/components/blog/BlogNavigationLinks";
import BlogComments from "@/app/home/components/blog/BlogComments";
=======
import { ShareBlog } from "@/app/home/components/shareBlogs";

>>>>>>> Stashed changes
/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 24/04/2026
 * funcionalidad: Renderiza y orquesta la vista completa del blog
 */
export default function BlogPostPage({ params }: { params: Promise<{ blogId: string }> }) {
  const resolvedParamsBlo = use(params);
  const { user: objUser } = useAuth();
  
  const { objBlogBlo, bolIsLoadingBlo, bolHasErrorBlo } = useBlogData(resolvedParamsBlo.blogId);

  if (bolIsLoadingBlo) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Cargando artículo...</p>
      </div>
    );
  }

  if (bolHasErrorBlo || !objBlogBlo) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <p className="text-destructive font-bold text-xl">Error</p>
        <p className="text-muted-foreground">No se pudo encontrar este artículo.</p>
        <Link 
          href="/home/blogs"
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Volver a los blogs
        </Link>
      </div>
    );
  }

  return (
    <main className="w-full max-w-3xl mx-auto px-4 py-12 flex flex-col overflow-hidden font-sans">
      <BlogHeader objBlogBlo={objBlogBlo} />
      
      <BlogHero objBlogBlo={objBlogBlo} />
      
      <BlogShareButtons />
      
      <div className="mb-12">
        <BlogComments blogId={resolvedParamsBlo.blogId} isAuthenticated={!!objUser} />
      </div>

<<<<<<< Updated upstream
      <BlogNavigationLinks />
=======
      <div className="w-full text-foreground text-[1.1rem] leading-loose whitespace-pre-wrap break-words">
        {ObjBlogBlo.StrContentBlo}
      </div>

      {/* ── Fabricio Caceres Rengel + botón Compartir ─────────────────────────────────────────
          Reemplaza el antiguo div text-right. Mantiene "Escrito por:" a la
          izquierda y añade <ShareBlog /> a la derecha, tal como el diseño
          de referencia. El panel emergente se posiciona hacia arriba
          automáticamente gracias al bottom-full del CSS Module.
      ─────────────────────────────────────────────────────────────────── */}
      <div className="w-full mt-4 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-secondary font-medium text-lg">
          Escrito por: {ObjBlogBlo.StrAuthorBlo}
        </p>

        <ShareBlog />
      </div>

      {/* comentarios: pasamos el id del blog */}
      <BlogComments blogId={ResolvedParamsBlo.blogId} isAuthenticated={!!objUser} />

      <div className="w-full flex justify-center mt-12 pt-8 border-t border-border/50">
        <Link 
          href="/home/blogs"
          className={`flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-sm ${StrBtnHoverClassesBlo}`}
        >
          <Image 
            src="/leftArrow.svg" 
            alt="Flecha izquierda" 
            width={20} 
            height={20} 
            className="w-5 h-5 object-contain brightness-0 invert"
          />
          Volver a todos los blogs
        </Link>
      </div>
>>>>>>> Stashed changes
    </main>
  );
}