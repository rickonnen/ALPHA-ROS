"use client";

import Link from "next/link";
import { CreditCard, Newspaper, ArrowRight, MessageSquare } from "lucide-react";

const arrAdminOptions = [
  {
    strTitle: "Verificación de pagos",
    strDescription:
      "Revisa comprobantes, valida pagos pendientes y controla solicitudes financieras.",
    strHref: "/admin/verificacion-pagos",
    Icon: CreditCard,
    strButtonText: "Inspeccionar",
  },
  {
    strTitle: "Gestión de blogs",
    strDescription:
      "Administra artículos, publicaciones y contenido informativo para la plataforma.",
    strHref: "/admin/manageBlogs",
    Icon: Newspaper,
    strButtonText: "Inspeccionar",
  },
  {
    strTitle: "Gestión de comentarios",
    strDescription:
      "Modera o elimina las opiniones y mensajes dejados por los usuarios en el blog.",
    strHref: "/admin/commentManagement",
    Icon: MessageSquare,
    strButtonText: "Inspeccionar",
  },
];

export default function MenuAdmin() {
  return (
    <section className="w-full">
      <div className="mb-8">
        <h2 className="text-subtitle font-bold text-foreground">
          Panel de Administración
        </h2>
        <p className="mt-2 max-w-2xl text-body-info text-muted-foreground">
          Selecciona una sección para administrar las funciones principales de la plataforma.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {arrAdminOptions.map((objOption) => {
          const Icon = objOption.Icon;

          return (
            <article
              key={objOption.strTitle}
              className="group rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-md"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-xl border border-border bg-secondary-fund text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-12 w-12" />
                </div>

                <h3 className="text-lg font-bold uppercase text-foreground">
                  {objOption.strTitle}
                </h3>

                <p className="mt-3 min-h-12 max-w-sm text-sm text-muted-foreground">
                  {objOption.strDescription}
                </p>

                <Link
                  href={objOption.strHref}
                  className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold uppercase text-primary-foreground shadow-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {objOption.strButtonText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}