"use client";

import { useEffect, useState, use } from "react"; 
import Image from "next/image";
import Link from "next/link"; 
import { X as ObjXIcon } from "lucide-react"; 
import { useHoverAnimation } from "@/components/hooks/useHoverAnimation";
import BlogComments from "@/app/home/components/blog/BlogComments";
import { useAuth } from "@/app/auth/AuthContext";
/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 24/04/2026
 * funcionalidad: renderiza la vista completa de un blog especifico
 */
interface singleBlogData {
  IntIdBlo: number;
  StrTitleBlo: string;
  StrDescriptionBlo: string;
  StrContentBlo: string;
  StrImageUrlBlo: string;
  StrDateBlo: string;
  StrAuthorBlo: string;
}

export default function blogPostPage({ params }: { params: Promise<{ blogId: string }> }) {
  const ResolvedParamsBlo = use(params);
  const { user: objUser } = useAuth();
  
  const [ObjBlogBlo, SetObjBlogBlo] = useState<singleBlogData | null>(null);
  const [BolIsLoadingBlo, SetBolIsLoadingBlo] = useState<boolean>(true);
  const [BolHasErrorBlo, SetBolHasErrorBlo] = useState<boolean>(false);

  const StrBtnHoverClassesBlo = useHoverAnimation(false, true, 'pointer', true, true);

  useEffect(() => {
    const FnFetchSingleBlogBlo = async () => {
      try {
        const ObjResponseBlo = await fetch(`/api/home/blogs/${ResolvedParamsBlo.blogId}`);
        if (!ObjResponseBlo.ok) throw new Error("error al cargar el blog");

        const ObjDataBlo: singleBlogData = await ObjResponseBlo.json();
        SetObjBlogBlo(ObjDataBlo);
      } catch (ObjErrorBlo) {
        console.error("[FETCH_SINGLE_BLOG_ERROR]", ObjErrorBlo);
        SetBolHasErrorBlo(true);
      } finally {
        SetBolIsLoadingBlo(false);
      }
    };

    FnFetchSingleBlogBlo();
  }, [ResolvedParamsBlo.blogId]);

  if (BolIsLoadingBlo) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center">
        <p className="text-muted-foreground">Cargando artículo...</p>
      </div>
    );
  }

  if (BolHasErrorBlo || !ObjBlogBlo) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <p className="text-destructive font-bold text-xl">Error</p>
        <p className="text-muted-foreground">No se pudo encontrar este artículo.</p>
        <Link 
          href="/home/blogs"
          className={`px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium ${StrBtnHoverClassesBlo}`}
        >
          Volver a los blogs
        </Link>
      </div>
    );
  }

  return (
    <main className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-6 overflow-hidden">
      <span className="text-secondary font-semibold text-[1rem] uppercase tracking-wider">
        {ObjBlogBlo.StrDateBlo}
      </span>

      <h1 className="text-foreground font-bold text-[2.5rem] leading-tight break-words">
        {ObjBlogBlo.StrTitleBlo}
      </h1>

      <p className="text-foreground/80 text-[1.25rem] leading-relaxed border-l-4 border-primary pl-4 italic break-words">
        {ObjBlogBlo.StrDescriptionBlo}
      </p>

      <div className="w-full aspect-[4/3] relative bg-muted rounded-2xl overflow-hidden border border-border/30 shadow-sm flex items-center justify-center text-muted-foreground mt-4 mb-4">
        {ObjBlogBlo.StrImageUrlBlo ? (
          <Image
            src={ObjBlogBlo.StrImageUrlBlo}
            alt={ObjBlogBlo.StrTitleBlo}
            fill
            sizes="1800px"
            className="object-cover"
            priority 
          />
        ) : (
          <ObjXIcon className="w-20 h-20 opacity-20" strokeWidth={1} />
        )}
      </div>

      <div className="w-full text-foreground text-[1.1rem] leading-loose whitespace-pre-wrap break-words">
        {ObjBlogBlo.StrContentBlo}
      </div>

      <div className="w-full mt-4 text-right">
        <p className="text-secondary font-medium text-lg">
          Escrito por: {ObjBlogBlo.StrAuthorBlo}
        </p>
      </div>

      {/* comentarios pasamos el id del blog */}
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
    </main>
  );
}