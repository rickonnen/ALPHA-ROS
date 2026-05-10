"use client";

import { use } from "react"; 
import Link from "next/link"; 
import { useAuth } from "@/app/auth/AuthContext";
import { useBlogData } from "@/app/home/hooks/useBlogData";
import BlogHeader from "@/app/home/components/blog/BlogHeader";
import BlogHero from "@/app/home/components/blog/BlogHero";
import { ShareBlog } from "@/app/home/components/shareBlogs";
import BlogNavigationLinks from "@/app/home/components/blog/BlogNavigationLinks";
import BlogComments from "@/app/home/components/blog/BlogComments";
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
      
      <ShareBlog />
      
      <div className="mb-12">
        <BlogComments blogId={resolvedParamsBlo.blogId} isAuthenticated={!!objUser} />
      </div>

      <BlogNavigationLinks />
    </main>
  );
}