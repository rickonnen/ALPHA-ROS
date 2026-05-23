"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";

const STORAGE_KEY = "propbol_terms_accepted";

export default function TermsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isLegalPage =
    pathname?.startsWith("/home/terminos-condiciones") ||
    pathname?.startsWith("/home/politicas-privacidad");

  useEffect(() => {
    if (isLegalPage) {
      setIsOpen(false);
      return;
    }

    const accepted = localStorage.getItem(STORAGE_KEY);

    if (!accepted) {
      setIsOpen(true);
    }
  }, [isLegalPage]);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  if (!isOpen || isLegalPage) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/55 px-4 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl border border-white/35 bg-card-bg/35 p-7 shadow-2xl ring-1 ring-white/20 backdrop-blur-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/40 text-primary shadow-sm ring-1 ring-white/30 backdrop-blur-md">
            <ShieldCheck className="h-5 w-5 drop-shadow-sm" />
          </div>

          <h2 className="text-lg font-extrabold tracking-wide text-primary drop-shadow-sm">
            Términos y Privacidad
          </h2>
        </div>

        <div className="space-y-4 rounded-2xl bg-background/25 p-5 text-sm font-medium leading-7 text-foreground shadow-inner ring-1 ring-white/25 backdrop-blur-md">
          <p className="drop-shadow-sm">
            Antes de continuar, necesitamos que leas y aceptes nuestros{" "}
            <a
              href="/home/terminos-condiciones"
              target="_blank"
              rel="noopener noreferrer"
              className="font-extrabold text-primary underline underline-offset-4 transition-opacity hover:opacity-80"
            >
              Términos y Condiciones
            </a>{" "}
            y nuestra{" "}
            <a
              href="/home/politicas-privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="font-extrabold text-primary underline underline-offset-4 transition-opacity hover:opacity-80"
            >
              Política de Privacidad
            </a>
            .
          </p>

          <p className="text-foreground drop-shadow-sm">
            Al aceptar, confirmas que has leído y comprendido cómo utilizamos tu
            información y las condiciones de uso de{" "}
            <span className="font-extrabold text-primary">PROPBOL</span>.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleAccept}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-extrabold uppercase text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            <ShieldCheck className="h-4 w-4" />
            Acepto
          </button>
        </div>
      </div>
    </div>
  );
}