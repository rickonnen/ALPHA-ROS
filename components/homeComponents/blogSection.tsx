"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight as ObjArrowRight } from "lucide-react"; 
import ArticleCard from "@/app/home/blogs/articleCard";
import { useHoverAnimation } from "@/components/hooks/useHoverAnimation";

/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 23/04/2026
 * funcionalidad: consume la api de blogs y muestra maximo 3 tarjetas en cuadricula horizontal
 * @return {React.JSX.Element} contenedor de la seccion de blogs
 */
interface objBlogData {
  intId: number;
  strTitle: string;
  strDescription: string;
  strImageUrl: string;
  strDate: string;
}

export default function blogSection() {
  const [arrBlogs, setArrBlogs] = useState<objBlogData[]>([]);
  const [bolIsLoading, setBolIsLoading] = useState<boolean>(true);

  // hook de animacion para el enlace inferior
  const strBtnHoverClasses = useHoverAnimation(true, false, 'pointer', true, true);

  useEffect(() => {
    // funcion asincrona para recuperar los blogs de la base de datos
    const fnFetchBlogs = async () => {
      try {
        const objResponse = await fetch("/api/home/blogs");
        if (!objResponse.ok) throw new Error("error en la peticion");
        
        const arrData: objBlogData[] = await objResponse.json();
        setArrBlogs(arrData.slice(0, 3));
      } catch (objError) {
        console.error("[FETCH_BLOGS_ERROR]", objError);
      } finally {
        setBolIsLoading(false);
      }
    };

    fnFetchBlogs();
  }, []);

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-12 flex flex-col gap-6">
      {/* cabecera de la seccion con titulo y descripcion */}
      <div className="w-full mb-2">
        <h2 className="text-[1.5rem] font-bold text-foreground">
          Blogs de la comunidad
        </h2>
        <p className="text-[1rem] text-foreground/70 mt-1">
          Descubre las últimas novedades, consejos y artículos destacados.
        </p>
      </div>

      {/* cuadricula responsiva para el listado de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {bolIsLoading ? (
          <p className="text-muted-foreground col-span-1 md:col-span-3 text-center py-8">
            Cargando publicaciones...
          </p>
        ) : arrBlogs.length > 0 ? (
          arrBlogs.map((objBlog) => (
            <ArticleCard 
              key={objBlog.intId}
              intId={objBlog.intId}
              strTitle={objBlog.strTitle}
              strDescription={objBlog.strDescription}
              strImageUrl={objBlog.strImageUrl}
              strDate={objBlog.strDate}
            />
          ))
        ) : (
          <p className="text-muted-foreground col-span-1 md:col-span-3 text-center py-8">
            No hay publicaciones disponibles en este momento.
          </p>
        )}
      </div>

      {/* enlace de redireccion al listado completo de blogs */}
      <div className="w-full flex justify-end mt-2">
        <Link 
          href="/home/blogs" 
          className={`flex items-center gap-2 font-semibold text-[1.25rem] text-primary ${strBtnHoverClasses}`}
        >
          Ver mas blogs <ObjArrowRight className="w-6 h-6" strokeWidth={2} />
        </Link>
      </div>
    </section>
  );
}