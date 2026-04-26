"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight as ObjArrowRight } from "lucide-react"; 
import ArticleCard from "@/app/home/blogs/articleCard";
import { useHoverAnimation } from "@/components/hooks/useHoverAnimation";

// titulo de la interface en camel case
interface blogData {
  IntIdBlo: number;
  StrTitleBlo: string;
  StrDescriptionBlo: string;
  StrImageUrlBlo: string;
  StrDateBlo: string;
}

/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 23/04/2026
 * funcionalidad: consume la api de blogs y muestra maximo 3 tarjetas en cuadricula horizontal
 * @return {React.JSX.Element} contenedor de la seccion de blogs
 */
export default function blogSection() {
  // variables en PascalCase con prefijo y sufijo de entidad
  const [ArrBlogsBlo, SetArrBlogsBlo] = useState<blogData[]>([]);
  const [BolIsLoadingBlo, SetBolIsLoadingBlo] = useState<boolean>(true);

  // hook de animacion para el enlace inferior
  const StrBtnHoverClassesBlo = useHoverAnimation(true, false, 'pointer', true, true);

  useEffect(() => {
    // funcion asincrona para recuperar los blogs de la base de datos
    const FnFetchBlogsBlo = async () => {
      try {
        const ObjResponseBlo = await fetch("/api/home/blogs");
        if (!ObjResponseBlo.ok) throw new Error("error en la peticion");
        
        const ArrDataBlo: blogData[] = await ObjResponseBlo.json();
        SetArrBlogsBlo(ArrDataBlo.slice(0, 3));
      } catch (ObjErrorBlo) {
        console.error("[FETCH_BLOGS_ERROR]", ObjErrorBlo);
      } finally {
        SetBolIsLoadingBlo(false);
      }
    };

    FnFetchBlogsBlo();
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
        {BolIsLoadingBlo ? (
          <p className="text-muted-foreground col-span-1 md:col-span-3 text-center py-8">
            Cargando publicaciones...
          </p>
        ) : ArrBlogsBlo.length > 0 ? (
          ArrBlogsBlo.map((ObjBlogBlo) => (
            <ArticleCard 
              key={ObjBlogBlo.IntIdBlo}
              IntIdBlo={ObjBlogBlo.IntIdBlo}
              StrTitleBlo={ObjBlogBlo.StrTitleBlo}
              StrDescriptionBlo={ObjBlogBlo.StrDescriptionBlo}
              StrImageUrlBlo={ObjBlogBlo.StrImageUrlBlo}
              StrDateBlo={ObjBlogBlo.StrDateBlo}
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
          className={`flex items-center gap-2 font-semibold text-[1.25rem] text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md ${StrBtnHoverClassesBlo}`}
        >
          Ver mas blogs <ObjArrowRight className="w-6 h-6" strokeWidth={2} />
        </Link>
      </div>
    </section>
  );
}