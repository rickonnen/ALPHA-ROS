"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type FreePublicationLimitModalProps = {
  publicationCount: number;
  isPremium: boolean;
  onBack: () => void;
  freeLimit?: number;
  plansHref?: string;
  title?: string;
  description?: string;
};

export default function FreePublicationLimitModal({
  publicationCount,
  isPremium,
  onBack,
  freeLimit = 2,
  plansHref = "/pagina-cobros",
  title = "Has excedido tus publicaciones gratuitas",
  description =
    "Tu plan gratuito te permite hasta 2 publicaciones gratuitas. Para seguir publicando, revisa nuestros planes de pago.",
}: FreePublicationLimitModalProps) {
  const hasExceededFreePosts = !isPremium && publicationCount >= freeLimit;
  const [isMounted, setIsMounted] = useState(hasExceededFreePosts);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let enterTimeoutId: ReturnType<typeof setTimeout> | undefined;
    let exitTimeoutId: ReturnType<typeof setTimeout> | undefined;

    if (hasExceededFreePosts) {
      setIsMounted(true);
      enterTimeoutId = setTimeout(() => setIsVisible(true), 20);
    } else if (isMounted) {
      setIsVisible(false);
      exitTimeoutId = setTimeout(() => setIsMounted(false), 380);
    }

    return () => {
      if (enterTimeoutId) clearTimeout(enterTimeoutId);
      if (exitTimeoutId) clearTimeout(exitTimeoutId);
    };
  }, [hasExceededFreePosts, isMounted]);

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-out ${
        isVisible ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="free-publication-limit-title"
      aria-describedby="free-publication-limit-description"
    >
      <div
        className={`max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform will-change-opacity sm:p-8 ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-6 scale-95 opacity-0"
        }`}
      >
        <div className="text-center">
          <h2
            id="free-publication-limit-title"
            className="text-3xl font-semibold leading-tight text-slate-900"
          >
            {title}
          </h2>
          <p
            id="free-publication-limit-description"
            className="mx-auto mt-3 max-w-100 text-sm leading-relaxed text-slate-600 "
          >
            {description}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-40 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-11 w-full items-center justify-center  px-5 py-2.5 text-sm font-medium text-red-600 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 hover:scale-110 sm:w-auto"
          >
            {"<    Atras"}
          </button>

          <Link
            href={plansHref}
            className="inline-flex min-h-11 w-full items-center justify-center border border-red-600 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 sm:w-auto"
          >
            {"Ver Planes  >"}
          </Link>
        </div>
      </div>
    </div>
  );
}