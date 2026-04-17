/**
 * Author: Maicol Ismael Nina Zarate
 * Date: 26/03/2026
 * Description: Footer component for frontend pages with internal navigation,
 * legal access links, social media links and home redirection through the logo.
 * @return Footer component rendered at the bottom of frontend pages.
 */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useHoverAnimation } from "../hooks/useHoverAnimation";
import { useAuth } from "@/app/auth/AuthContext";
import { usePublicarAccion } from "../hooks/usePublicarAccion";
import ProtectedFeatureModal from "@/app/auth/ProtectedFeatureModal";
import AuthModal from "@/app/auth/AuthModal";
import FreePublicationLimitModal from "@/features/publicacion/components/FreePublicationLimitModal";
import { Skeleton } from "@/components/ui/skeleton";

const arrExploreLinks = [
  { strHref: "/busqueda", strLabel: "En venta", strValue: "Venta" },
  { strHref: "/busqueda", strLabel: "Alquiler", strValue: "Alquiler" },
  { strHref: "/busqueda", strLabel: "Anticrético", strValue: "Anticrético" },
];

const arrInfoLinks = [
  { strHref: "/home/sobre-nosotros", strLabel: "Sobre nosotros" },
  { strHref: "/home/terminos-condiciones", strLabel: "Términos y condiciones" },
  { strHref: "/home/politicas-privacidad", strLabel: "Políticas de privacidad" },
];

const arrSocialLinks = [
  { strHref: "https://www.facebook.com/share/1Fgy1caBsd/", strAriaLabel: "Facebook", strImgSrc: "/logo-facebook.svg", strImgAlt: "Facebook icon", strImgClasses: "h-8 w-8", objStyle: { transform: "scale(1.12)" } },
  { strHref: "https://www.instagram.com/propbol.inmo/", strAriaLabel: "Instagram", strImgSrc: "/logo-instagram.svg", strImgAlt: "Instagram icon", strImgClasses: "h-10 w-10" },
  { strHref: "https://www.tiktok.com/@propbolinmo", strAriaLabel: "TikTok", strImgSrc: "/logo-tiktok.svg", strImgAlt: "TikTok icon", strImgClasses: "h-9 w-9", objStyle: { transform: "scale(1.12)" } },
];

export default function Footer() {
  const { user: objUser, isLoading: bolIsAuthLoading } = useAuth();
  const objRouter = useRouter();
  
  const [bolShowAuth, setBolShowAuth] = useState(false);
  const [bolShowProtected, setBolShowProtected] = useState(false);
  const [strAuthMode, setStrAuthMode] = useState<"login" | "register">("login");
  const [bolShowLimitModal, setBolShowLimitModal] = useState(false);

  const strHoverAnim = useHoverAnimation(true, true, "pointer");
  const strHoverIconAnim = useHoverAnimation(false, true, "pointer");
  // animación para redes sociales: sin color, sin resplandor, solo escala
  const strSocialAnim = useHoverAnimation(false, false, "pointer");

  const { handlePublicar } = usePublicarAccion({
    objUser,
    onShowProtected: () => setBolShowProtected(true), 
    onShowLimit: () => setBolShowLimitModal(true), 
    onCloseMobileMenu: () => {}, 
    bolIsAuthLoading,
  });

  // función para manejar la navegación con parámetros de filtro
  const handleFilterNavigation = (objLink: { strHref: string; strValue: string }) => {
    const objParams = new URLSearchParams();
    objParams.set("operaciones", objLink.strValue);
    objRouter.push(`${objLink.strHref}?${objParams.toString()}`);
  };

  const strBaseLinkClasses = useMemo(() => 
    `inline-block rounded-sm text-[0.83rem] md:text-[0.95rem] lg:text-[1.07rem] text-foreground transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund ${strHoverAnim}`, 
  [strHoverAnim]);

  return (
    <footer className="mt-16 border-t border-border bg-secondary-fund">
      <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-10 px-6 py-10 md:grid-cols-[1.55fr_0.95fr_0.95fr] md:px-10 lg:gap-24 xl:max-w-[1650px] xl:grid-cols-[1.8fr_1fr_1fr] xl:px-16 2xl:px-24">
        
        <div className="flex items-start">
          {bolIsAuthLoading ? (
            <Skeleton className="h-10 w-32" />
          ) : (
            <Link href="/" className={`inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund ${strHoverIconAnim}`}>
              <img src="/logo-principal.svg" alt="Logo" className="h-10 w-auto" />
              <span className="text-[0.83rem] lg:text-[0.95rem] xl:text-[1.07rem] 2xl:text-[1.5rem] font-heading font-black tracking-tighter leading-none">
                <span className="text-primary">PROP</span>
                <span className="text-secondary">BOL</span>
              </span>
            </Link>
          )}
        </div>

        <div className="md:pl-6 lg:pl-10 xl:pl-16">
          <h3 className="mb-4 text-[1.07rem] font-heading font-semibold text-primary cursor-default">Explorar</h3>
          <ul className="space-y-3">
            {bolIsAuthLoading ? (
              <>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                {arrExploreLinks.map((link) => (
                  <li key={link.strLabel}>
                    <button 
                      onClick={() => handleFilterNavigation(link)} 
                      className={strBaseLinkClasses}
                    >
                      {link.strLabel}
                    </button>
                  </li>
                ))}
                <li><button onClick={handlePublicar} className={strBaseLinkClasses}>Publica tu inmueble</button></li>
              </>
            )}
          </ul>
        </div>

        <div className="md:pl-4 lg:pl-8 xl:pl-12">
          <h3 className="mb-4 text-[1.07rem] font-heading font-semibold text-primary cursor-default">Información</h3>
          <ul className="space-y-3">
            {bolIsAuthLoading ? (
              <>
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-36" />
              </>
            ) : (
              arrInfoLinks.map((link) => (
                <li key={link.strLabel}><Link href={link.strHref} className={strBaseLinkClasses}>{link.strLabel}</Link></li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex flex-row flex-wrap items-center justify-center gap-6 px-6 py-8">
          {bolIsAuthLoading ? (
            <Skeleton className="h-6 w-64" />
          ) : (
            <>
              <span className="text-muted-foreground text-[0.83rem] md:text-[0.95rem] cursor-default">Síguenos:</span>
              {arrSocialLinks.map((soc) => (
                <a 
                  key={soc.strAriaLabel} 
                  href={soc.strHref} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund ${strSocialAnim}`}
                >
                  <img src={soc.strImgSrc} alt={soc.strAriaLabel} className={soc.strImgClasses} />
                </a>
              ))}
              <span className="text-foreground text-[0.83rem] md:text-[0.95rem] cursor-default">© 2026 PROPBOL</span>
            </>
          )}
        </div>
      </div>

      <ProtectedFeatureModal
        isOpen={bolShowProtected}
        onClose={() => setBolShowProtected(false)}
        onLoginClick={() => { setBolShowProtected(false); setStrAuthMode("login"); setBolShowAuth(true); }}
        onRegisterClick={() => { setBolShowProtected(false); setStrAuthMode("register"); setBolShowAuth(true); }}
      />
      
      <AuthModal 
        isOpen={bolShowAuth} 
        onClose={() => setBolShowAuth(false)} 
        initialMode={strAuthMode} 
      />

      <FreePublicationLimitModal
        bolOpen={bolShowLimitModal}
        onBack={() => setBolShowLimitModal(false)}
      />
    </footer>
  );
}