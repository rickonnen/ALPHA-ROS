"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight as ObjArrowRight, PenSquare } from "lucide-react"; 
import ArticleCard from "@/app/home/blogs/articleCard";
import { useHoverAnimation } from "@/components/hooks/useHoverAnimation";
import { ArticleCardSkeleton } from "@/app/home/blogs/articleCardSkeleton";

interface blogData {
  IntIdBlo: number;
  StrTitleBlo: string;
  StrDescriptionBlo: string;
  StrImageUrlBlo: string;
  StrDateBlo: string;
  ObjAuthorBlo?: {
    name: string;
    avatar?: string;
  };
  StrReadTimeBlo?: string;
}

/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 23/04/2026
 * funcionalidad: consume la api de blogs y muestra maximo 3 tarjetas en cuadricula horizontal
 * @return {React.JSX.Element} contenedor de la seccion de blogs
 */
export default function blogSection() {
  // variables en PascalCase con prefijo y sufijo de entidad
  const [arrBlogsBlo, setArrBlogsBlo] = useState<blogData[]>([]);
  const [bolIsLoadingBlo, setBolIsLoadingBlo] = useState<boolean>(true);

  // hook de animacion para el enlace inferior
  const strBtnHoverClassesBlo = useHoverAnimation(true, false, 'pointer', true, true);

  useEffect(() => {
    // funcion asincrona para recuperar los blogs de la base de datos
    const fnFetchBlogsBlo = async () => {
      try {
        const objResponseBlo = await fetch("/api/home/blogs");
        if (!objResponseBlo.ok) throw new Error("error en la peticion");
        
        const arrDataBlo: blogData[] = await objResponseBlo.json();
        setArrBlogsBlo(arrDataBlo.slice(0, 3));
      } catch (objErrorBlo) {
        console.error("[FETCH_BLOGS_ERROR]", objErrorBlo);
      } finally {
        setBolIsLoadingBlo(false);
      }
    };

    fnFetchBlogsBlo();
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
        {bolIsLoadingBlo ? (
          // Renderizamos 3 skeletons para la página de inicio
          Array.from({ length: 3 }).map((_, index) => (
            <ArticleCardSkeleton key={index} />
          ))
        ) : arrBlogsBlo.length > 0 ? (
          arrBlogsBlo.map((objBlogBlo) => (
            <ArticleCard
              key={objBlogBlo.IntIdBlo}
              IntIdBlo={objBlogBlo.IntIdBlo}
              StrTitleBlo={objBlogBlo.StrTitleBlo}
              StrDescriptionBlo={objBlogBlo.StrDescriptionBlo}
              StrImageUrlBlo={objBlogBlo.StrImageUrlBlo}
              StrDateBlo={objBlogBlo.StrDateBlo}
              ObjAuthorBlo={objBlogBlo.ObjAuthorBlo}
              StrReadTimeBlo={objBlogBlo.StrReadTimeBlo}
            />
          ))
        ) : (
          <p className="text-muted-foreground col-span-1 md:col-span-3 text-center py-8">
            No hay publicaciones disponibles en este momento.
          </p>
        )}
      </div>

      {/* Contenedor inferior: Boton de crear a la izquierda, enlace de ver mas a la derecha */}
      <div className="w-full flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4 mt-2">

        {/* enlace de redireccion al listado completo de blogs */}
        <Link 
          href="/home/blogs" 
          className={`flex items-center justify-center sm:justify-end gap-2 font-semibold text-[1.25rem] text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md w-full sm:w-auto ${strBtnHoverClassesBlo}`}
        >
          Ver mas blogs <ObjArrowRight className="w-6 h-6" strokeWidth={2} />
        </Link>
        
      </div>
    </section>
  );
}