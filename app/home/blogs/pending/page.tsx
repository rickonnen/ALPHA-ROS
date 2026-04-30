/**
 * Author: Maicol Ismael Nina Zarate
 * Date: 29/04/2026
 * Description: Pending blog page for the real estate platform.
 * It displays the authenticated user's blog post awaiting administrative approval.
 * It also differentiates between a newly submitted blog and an existing pending blog.
 * @return Pending blog page content.
 */

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { X as ObjXIcon } from "lucide-react";
import { useHoverAnimation } from "@/components/hooks/useHoverAnimation";

interface PendingBlogData {
  id_blog: number;
  titulo: string | null;
  descripcion: string | null;
  contenido: string | null;
  imagen_url: string | null;
  fecha_creacion: string | null;
  estado: string | boolean | null;
}

export default function PendingBlogPage() {
  const ObjSearchParamsBlo = useSearchParams();

  const [ObjBlogBlo, SetObjBlogBlo] = useState<PendingBlogData | null>(null);
  const [BolIsLoadingBlo, SetBolIsLoadingBlo] = useState<boolean>(true);
  const [BolHasErrorBlo, SetBolHasErrorBlo] = useState<boolean>(false);

  const StrBtnHoverClassesBlo = useHoverAnimation(
    false,
    true,
    "pointer",
    true,
    true
  );

  const BolWasCreatedBlo = ObjSearchParamsBlo.get("created") === "1";
  const BolAlreadyExistingBlo = ObjSearchParamsBlo.get("existing") === "1";

  // ======================================================
  // Mensajes dinámicos según el origen de la redirección
  // ======================================================
  const StrMainTitleBlo = BolWasCreatedBlo
    ? "Tu blog fue enviado a revisión"
    : BolAlreadyExistingBlo
    ? "Ya tienes un blog pendiente"
    : "Tu blog está pendiente de aprobación";

  const StrMainDescriptionBlo = BolWasCreatedBlo
    ? "El administrador revisará tu publicación antes de que aparezca en la sección pública de blogs."
    : BolAlreadyExistingBlo
    ? "Solo puedes tener un blog pendiente a la vez. Cuando el administrador lo apruebe o lo gestione, podrás enviar otro blog."
    : "El administrador revisará tu publicación. Cuando sea aprobada, aparecerá en la sección pública de blogs.";

  useEffect(() => {
    const FnFetchPendingBlogBlo = async () => {
      try {
        const ObjResponseBlo = await fetch("/api/home/blogs/pendingBlog");

        if (!ObjResponseBlo.ok) {
          throw new Error("error al cargar el blog pendiente");
        }

        const ObjDataBlo = await ObjResponseBlo.json();

        SetObjBlogBlo(ObjDataBlo.data);
      } catch (ObjErrorBlo) {
        console.error("[FETCH_PENDING_BLOG_ERROR]", ObjErrorBlo);
        SetBolHasErrorBlo(true);
      } finally {
        SetBolIsLoadingBlo(false);
      }
    };

    FnFetchPendingBlogBlo();
  }, []);

  if (BolIsLoadingBlo) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <p className="text-muted-foreground">Cargando blog pendiente...</p>
      </div>
    );
  }

  if (BolHasErrorBlo || !ObjBlogBlo) {
    return (
      <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-4">
        <p className="text-xl font-bold text-destructive">Sin blog pendiente</p>

        <p className="text-muted-foreground">
          No se pudo encontrar un blog pendiente para este usuario.
        </p>

        <Link
          href="/home/blogs/createBlog"
          className={`rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground ${StrBtnHoverClassesBlo}`}
        >
          Crear blog
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-12">
      {/* ======================================================
          Encabezado de estado pendiente
      ====================================================== */}
      <span className="font-semibold uppercase tracking-wider text-secondary text-[1rem]">
        Revisión pendiente
      </span>

      <h1 className="font-bold leading-tight text-black text-[2.5rem]">
        {StrMainTitleBlo}
      </h1>

      <p className="border-l-4 border-primary pl-4 italic leading-relaxed text-black/80 text-[1.25rem]">
        {StrMainDescriptionBlo}
      </p>

      {/* ======================================================
          Título del blog pendiente
      ====================================================== */}
      <div className="mt-4 rounded-2xl border border-border/30 bg-card-bg p-6 shadow-sm">
        <span className="inline-flex rounded-full bg-secondary-fund px-4 py-2 text-xs font-semibold text-secondary">
          Pendiente de aprobación
        </span>

        <h2 className="mt-5 font-bold leading-tight text-foreground text-[2rem]">
          {ObjBlogBlo.titulo}
        </h2>

        <p className="mt-3 leading-relaxed text-foreground/80 text-[1.1rem]">
          {ObjBlogBlo.descripcion}
        </p>
      </div>

      {/* ======================================================
          Imagen del blog
      ====================================================== */}
      <div className="relative mt-4 mb-4 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-border/30 bg-muted text-muted-foreground shadow-sm">
        {ObjBlogBlo.imagen_url ? (
          <Image
            src={ObjBlogBlo.imagen_url}
            alt={ObjBlogBlo.titulo || "Imagen del blog pendiente"}
            fill
            sizes="1800px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex flex-col items-center gap-3">
            <ObjXIcon className="h-20 w-20 opacity-20" strokeWidth={1} />
            <p className="text-sm text-muted-foreground">
              Este blog fue enviado sin imagen.
            </p>
          </div>
        )}
      </div>

      {/* ======================================================
          Contenido del blog
      ====================================================== */}
      <div className="w-full whitespace-pre-wrap leading-loose text-foreground text-[1.1rem]">
        {ObjBlogBlo.contenido}
      </div>

      {/* ======================================================
          Estado
      ====================================================== */}
      <div className="mt-4 w-full text-right">
        <p className="text-lg font-medium text-secondary">
          Estado: Pendiente de aprobación
        </p>
      </div>

      {/* ======================================================
          Botones de navegación
      ====================================================== */}
      <div className="mt-12 flex w-full justify-center border-t border-border/50 pt-8">
        <Link
          href="/home/blogs"
          className={`flex items-center gap-2 rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-sm ${StrBtnHoverClassesBlo}`}
        >
          <Image
            src="/leftArrow.svg"
            alt="Flecha izquierda"
            width={20}
            height={20}
            className="h-5 w-5 object-contain brightness-0 invert"
          />
          Volver a todos los blogs
        </Link>
      </div>
    </main>
  );
}