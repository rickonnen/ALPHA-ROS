"use client";

import { useRef, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useScrollDirection } from "../hooks/useScrollDirection";
import { useHoverAnimation } from "../hooks/useHoverAnimation";
import { useClickOutside } from "../hooks/useClickOutside";
import AuthModal from "@/app/auth/AuthModal";
import ProtectedFeatureModal from "@/app/auth/ProtectedFeatureModal";
import { useAuth } from "@/app/auth/AuthContext";
import { NotificationPanel } from "@/app/home/components/notifications/NotificationPanel";
import { Skeleton } from "@/components/ui/skeleton";

import { usePublicarAccion } from "../hooks/usePublicarAccion";
import FreePublicationLimitModal from "@/features/publicacion/components/FreePublicationLimitModal";

/**
 * Dev: Rodrigo Saul Zarate Villarroel       Fecha: 03/04/2026
 * Dev: Erick Eduardo Arnez Torrico         Fecha: 26/03/2026
 * Encabezado principal responsivo con menú desplegable para móviles.
 * Incluye lógica de autenticación, panel de notificaciones con cierre automático,
 * verificación de límites de publicación y optimización de renders con Skeletons.
 */
interface NavLink {
  strHref: string;
  strLabel: string;
}

const arrNavLinks: NavLink[] = [
  { strHref: "/busqueda?strOperacion=compra", strLabel: "COMPRA" },
  { strHref: "/busqueda?strOperacion=alquiler", strLabel: "ALQUILER" },
  { strHref: "/busqueda?strOperacion=anticretico", strLabel: "ANTICRÉTICO" },
];

export const Header = () => {
  const bolHideHeader = useScrollDirection();
  const strHoverAnim = useHoverAnimation(true);
  const strHoverAnimNoTextColor = useHoverAnimation(false);
  
  const { user: objUser, logout, isLoading: bolIsAuthLoading } = useAuth();
  const objRouter = useRouter();

  const [bolIsMobileMenuOpen, setBolIsMobileMenuOpen] = useState(false);
  const [bolShowAuth, setBolShowAuth] = useState(false);
  const [bolShowProtected, setBolShowProtected] = useState(false);
  const [strAuthMode, setStrAuthMode] = useState<"login" | "register">("login");
  const [bolShowNotifications, setBolShowNotifications] = useState(false);
  
  const [bolShowLimitModal, setBolShowLimitModal] = useState(false);

  const refMobileMenuPanel = useRef<HTMLDivElement | null>(null);
  const refMobileMenuButton = useRef<HTMLDivElement | null>(null);
  const refNotifPanel = useRef<HTMLDivElement | null>(null);

  const objLogoElement = useMemo(() => (
    <Link
      href="/"
      aria-label="Go to home page"
      className={`inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund ${strHoverAnim}`}
    >
      <img src="/logo-principal.svg" alt="Portal logo" className="h-10 w-auto object-contain lg:h-8 xl:h-10 2xl:h-14" />
    </Link>
  ), [strHoverAnim]);

  const handleCloseMobileMenu = useCallback(() => setBolIsMobileMenuOpen(false), []);
  const handleCloseNotifications = useCallback(() => setBolShowNotifications(false), []);
  
  const handleLogoutAction = useCallback(() => {
    logout();
    handleCloseMobileMenu();
  }, [logout, handleCloseMobileMenu]);

  const { handlePublicar, bolIsChecking: bolIsCheckingLimit } = usePublicarAccion({
    objUser,
    onShowProtected: () => setBolShowProtected(true),
    onShowLimit: () => setBolShowLimitModal(true),
    onCloseMobileMenu: handleCloseMobileMenu,
    bolIsAuthLoading: bolIsAuthLoading,
  });

  useClickOutside([refMobileMenuPanel, refMobileMenuButton], handleCloseMobileMenu, bolIsMobileMenuOpen);
  useClickOutside([refNotifPanel], handleCloseNotifications, bolShowNotifications);

  const strLinkClassesDesktop = useMemo(() => 
    `text-[15px] font-normal text-foreground inline-block rounded-md px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund ${strHoverAnim}`,
  [strHoverAnim]);

  const strLinkClassesMobile = useMemo(() => 
    `text-[15px] font-normal text-primary-foreground rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-primary ${strHoverAnim}`,
  [strHoverAnim]);

  return (
    <>
      <header
        className={`fixed top-0 w-full z-[100] bg-secondary-fund text-foreground shadow-sm border-b border-border transition-transform duration-300 ${
          bolHideHeader ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="w-full px-4 lg:px-[40px] h-18 flex items-center justify-between">
          <div className="flex lg:hidden">
            {bolIsAuthLoading ? <Skeleton className="h-10 w-28" /> : objLogoElement}
          </div>

          <div className="flex lg:hidden items-center gap-2">
            {/* Notificaciones para móvil */}
            <div className="relative" ref={refNotifPanel}>
              {bolIsAuthLoading ? (
                <Skeleton className="w-10 h-10 rounded-full" />
              ) : (
                <button
                  onClick={() => objUser ? setBolShowNotifications((p) => !p) : setBolShowProtected(true)}
                  className={`w-10 h-10 rounded-md flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${strHoverAnim}`}
                >
                  <img src="/bell_icon.svg" alt="Notificaciones" className="w-6 h-6 object-contain" />
                </button>
              )}
              {objUser && bolShowNotifications && (
                <div className="absolute right-0 top-full mt-0">
                  <NotificationPanel />
                </div>
              )}
            </div>

            <div ref={refMobileMenuButton}>
              <button
                className={`p-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund ${strHoverAnim}`}
                onClick={() => setBolIsMobileMenuOpen((bolPrev) => !bolPrev)}
              >
                <img src="/hamburger_icon.svg" alt="Menú" className="w-7 h-7 object-contain" />
              </button>
            </div>
          </div>

          <div className="hidden lg:flex flex-row items-center gap-6">
            {bolIsAuthLoading ? <Skeleton className="h-10 w-32" /> : objLogoElement}
            {bolIsAuthLoading ? (
              <Skeleton className="h-5 w-40" />
            ) : (
              <Link href={`/cobros/planes`} className={strLinkClassesDesktop}>PLANES DE PUBLICACIÓN</Link>
            )}
          </div>

          <div className="hidden lg:flex flex-row items-center gap-6">
            {bolIsAuthLoading ? (
              <div className="flex gap-6">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
            ) : (
              arrNavLinks.map((objLink) => (
                <Link key={objLink.strLabel} href={objLink.strHref} className={strLinkClassesDesktop}>{objLink.strLabel}</Link>
              ))
            )}

            {bolIsAuthLoading ? (
              <Skeleton className="h-10 w-28 rounded-lg" />
            ) : (
              <button
                onClick={handlePublicar}
                disabled={bolIsCheckingLimit}
                className={`text-[15px] px-6 h-10 font-semibold rounded-lg border border-border bg-secondary text-secondary-foreground flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60 ${strHoverAnimNoTextColor}`}
              >
                PUBLICAR
              </button>
            )}

            <div className="relative" ref={refNotifPanel}>
              {bolIsAuthLoading ? (
                <Skeleton className="w-10 h-10 rounded-full" />
              ) : (
                <button
                  onClick={() => objUser ? setBolShowNotifications((p) => !p) : setBolShowProtected(true)}
                  className={`w-10 h-10 bg-background border border-border rounded-full flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${strHoverAnimNoTextColor}`}
                >
                  <img src="/bell_icon.svg" alt="Notificaciones" className="w-6 h-6 object-contain" />
                </button>
              )}
              {objUser && bolShowNotifications && <NotificationPanel />}
            </div>

            {bolIsAuthLoading ? (
              <Skeleton className="h-10 w-36 rounded-full" />
            ) : objUser ? (
              <button
                onClick={() => objRouter.push(`/perfil?id=${objUser.id}`)}
                className={`flex items-center gap-3 h-10 px-4 bg-background border border-border rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${strHoverAnimNoTextColor}`}
              >
                <img src="/account_avatar.svg" alt="Perfil" className="w-7 h-7 object-contain" />
                <span className="text-[15px] font-semibold uppercase text-foreground leading-none">{objUser.name}</span>
              </button>
            ) : (
              <button
                onClick={() => { setStrAuthMode("login"); setBolShowAuth(true); }}
                className={`h-10 px-4 rounded-full bg-background border border-border flex items-center gap-3 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${strHoverAnimNoTextColor}`}
              >
                <div className="relative flex items-center justify-center">
                  <img src="/account_avatar.svg" alt="Icono cuenta" className="w-7 h-7 object-contain" />
                  <div className="absolute w-[120%] h-[2px] bg-foreground rotate-45 rounded-full" />
                </div>
                <span className="text-[15px] font-semibold uppercase text-foreground leading-none pt-0.5">INICIAR SESIÓN</span>
              </button>
            )}
          </div>
        </div>

        {bolIsMobileMenuOpen && (
          <>
            <div className="lg:hidden fixed inset-0 z-40" onClick={handleCloseMobileMenu} />
            <div
              ref={refMobileMenuPanel}
              className="lg:hidden absolute top-18 left-0 w-full bg-primary text-primary-foreground shadow-xl flex flex-col px-8 py-6 gap-6 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              {objUser ? (
                <button onClick={() => { objRouter.push(`/perfil?id=${objUser.id}`); handleCloseMobileMenu(); }}
                  className={`flex items-center gap-4 border-b border-primary-foreground/10 pb-4 ${strLinkClassesMobile}`}>
                  <img src="/account_avatar.svg" alt="Perfil" className="w-6 h-6 object-contain brightness-0 invert" />
                  <span className="uppercase font-semibold">PERFIL: {objUser.name}</span>
                </button>
              ) : (
                <button onClick={() => { setStrAuthMode("login"); setBolShowAuth(true); handleCloseMobileMenu(); }}
                  className={`flex items-center gap-4 border-b border-primary-foreground/10 pb-4 ${strLinkClassesMobile}`}>
                  <div className="relative flex items-center justify-center">
                    <img src="/account_avatar.svg" alt="Login" className="w-6 h-6 object-contain brightness-0 invert" />
                    <div className="absolute w-[120%] h-[2px] bg-background rotate-45 rounded-full" />
                  </div>
                  <span className="uppercase font-semibold pt-0.5">INICIAR SESIÓN</span>
                </button>
              )}

              <button 
                onClick={handlePublicar}
                disabled={bolIsCheckingLimit || bolIsAuthLoading}
                className={`w-full h-12 mt-2 flex items-center justify-center bg-secondary text-secondary-foreground text-[15px] font-semibold rounded-lg disabled:opacity-60 ${strHoverAnimNoTextColor}`}
              >
                PUBLICAR
              </button>

              {arrNavLinks.map((objLink) => (
                <div key={objLink.strLabel} onClick={() => { objRouter.push(objLink.strHref); handleCloseMobileMenu(); }}
                  className={`cursor-pointer border-b border-primary-foreground/10 pb-4 ${strLinkClassesMobile}`}>
                  {objLink.strLabel}
                </div>
              ))}

              <div onClick={() => { objRouter.push(`/cobros/planes`); handleCloseMobileMenu(); }}
                className={`pt-2 cursor-pointer ${strLinkClassesMobile}`}>
                PLANES DE PUBLICACIÓN
              </div>
            </div>
          </>
        )}
      </header>

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
    </>
  );
};