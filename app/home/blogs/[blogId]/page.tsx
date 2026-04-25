"use client";

import { useEffect, useState, use } from "react"; 
import Image from "next/image";
import Link from "next/link"; 
import { X as ObjXIcon } from "lucide-react";
import { useHoverAnimation } from "@/components/hooks/useHoverAnimation";
/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 24/04/2026
 * funcionalidad: renderiza la vista completa de un blog especifico
 */
interface objSingleBlogData {
  intId: number;
  strTitle: string;
  strDescription: string;
  strContent: string;
  strImageUrl: string;
  strDate: string;
}

export default function blogPostPage({ params }: { params: Promise<{ blogId: string }> }) {
  const resolvedParams = use(params);
  
  const [objBlog, setObjBlog] = useState<objSingleBlogData | null>(null);
  const [bolIsLoading, setBolIsLoading] = useState<boolean>(true);
  const [bolHasError, setBolHasError] = useState<boolean>(false);

  const strBtnHoverClasses = useHoverAnimation(false, false, 'pointer', true, true);

  useEffect(() => {
    const fnFetchSingleBlog = async () => {
      try {
        const objResponse = await fetch(`/api/home/blogs/${resolvedParams.blogId}`);
        if (!objResponse.ok) throw new Error("error al cargar el blog");

        const objData: objSingleBlogData = await objResponse.json();
        setObjBlog(objData);
      } catch (objError) {
        console.error("[FETCH_SINGLE_BLOG_ERROR]", objError);
        setBolHasError(true);
      } finally {
        setBolIsLoading(false);
      }
    };

    fnFetchSingleBlog();
  }, [resolvedParams.blogId]);

  if (bolIsLoading) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center">
        <p className="text-muted-foreground">Cargando artículo...</p>
      </div>
    );
  }

  if (bolHasError || !objBlog) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <p className="text-destructive font-bold text-xl">Error</p>
        <p className="text-muted-foreground">No se pudo encontrar este artículo.</p>
        <Link 
          href="/home/blogs"
          className={`px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium ${strBtnHoverClasses} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0`}
        >
          Volver a los blogs
        </Link>
      </div>
    );
  }

  return (
    <main className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-6">
      <span className="text-secondary font-semibold text-[1rem] uppercase tracking-wider">
        {objBlog.strDate}
      </span>

      <h1 className="text-foreground font-bold text-[2.5rem] leading-tight">
        {objBlog.strTitle}
      </h1>

      <p className="text-foreground/80 text-[1.25rem] leading-relaxed border-l-4 border-primary pl-4 italic">
        {objBlog.strDescription}
      </p>

      <div className="w-full aspect-[4/3] relative bg-muted rounded-2xl overflow-hidden border border-border/30 shadow-sm flex items-center justify-center text-muted-foreground mt-4 mb-4">
        {objBlog.strImageUrl ? (
          <Image
            src={objBlog.strImageUrl}
            alt={objBlog.strTitle}
            fill
            className="object-cover"
            priority 
          />
        ) : (
          <ObjXIcon className="w-20 h-20 opacity-20" strokeWidth={1} />
        )}
      </div>

      <div className="w-full text-foreground text-[1.1rem] leading-loose whitespace-pre-wrap">
        {objBlog.strContent}
      </div>

      <div className="w-full flex justify-center mt-12 pt-8 border-t border-border/50">
        <Link 
          href="/home/blogs"
          className={`flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-sm ${strBtnHoverClasses} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0`}
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
    </main>
  );
}