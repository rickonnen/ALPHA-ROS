"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollDirection } from "../hooks/useScrollDirection";
import AuthModal from "@/app/frontend/auth/AuthModal";
import ProtectedFeatureModal from "@/app/frontend/auth/ProtectedFeatureModal";
import { useAuth } from "@/app/frontend/auth/AuthContext";
import { NotificationPanel } from "@/app/frontend/home/components/notifications/NotificationPanel";

const arrNavLinks = [
  { strHref: "/busqueda?strOperacion=compra", strLabel: "COMPRA" },
  { strHref: "/busqueda?strOperacion=alquiler", strLabel: "ALQUILER" },
  { strHref: "/busqueda?strOperacion=anticretico", strLabel: "ANTICRÉTICO" },
];

/**
 * Dev: Rodrigo Saul Zarate Villarroel     Fecha: 27/03/2026
 * Dev: Erick Eduardo Arnez Torrico        Fecha: 26/03/2026
 * Funcionalidad: Renderizar el encabezado principal responsivo con menú desplegable para móviles.
 * Incluye lógica de autenticación (login/registro), panel de notificaciones, ocultamiento
 * automático inteligente al hacer scroll, animaciones interactivas unificadas (crecimiento y
 * resplandor color terracota), fondo crema personalizado, y optimización de renderizado
 * de enlaces aplicando el principio DRY.
 * @return {object} Componente visual Header para Next.js.
 */
export const Header = () => {
  const bolHideHeader = useScrollDirection();
  const { user } = useAuth();

  const [bolIsMobileMenuOpen, setBolIsMobileMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showProtected, setShowProtected] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [showNotifications, setShowNotifications] = useState(false);

  const refMobileMenuPanel = useRef<HTMLDivElement | null>(null);
  const refMobileMenuButton = useRef<HTMLDivElement | null>(null);

  const closeMobileMenu = () => setBolIsMobileMenuOpen(false);

  useEffect(() => {
    if (!bolIsMobileMenuOpen) return;

    const handleClickOutside = (objEvent: MouseEvent) => {
      const objTargetNode = objEvent.target as Node | null;
      if (!objTargetNode) return;
      if (refMobileMenuPanel.current?.contains(objTargetNode)) return;
      if (refMobileMenuButton.current?.contains(objTargetNode)) return;
      closeMobileMenu();
    };

    const handleEscapeKey = (objEvent: KeyboardEvent) => {
      if (objEvent.key === "Escape") closeMobileMenu();
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [bolIsMobileMenuOpen]);

  const strLinkClassesDesktop =
    "text-[15px] font-normal text-[#2E2E2E] transition-all duration-300 hover:text-[#c26e5a] hover:drop-shadow-[0_0_8px_#c26e5a] hover:scale-110 inline-block rounded-md px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7]";
  const strLinkClassesMobile =
    "text-[15px] font-normal text-[#E7E1D7] transition-all duration-300 hover:text-[#c26e5a] hover:drop-shadow-[0_0_8px_#c26e5a] rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E7E1D7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1F3A4D]";

  const btnLogoProbol = (
    <Link
      href="/"
      aria-label="Go to home page"
      className="inline-flex rounded-md transition-transform duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7]"
    >
      <img
        src="/logo-principal.svg"
        alt="Portal logo"
        className="h-10 w-auto object-contain lg:h-6 xl:h-8 2xl:h-12"
      />
    </Link>
  );

  const btnNotifications = user ? (
    <div className="relative">
      <button
        onClick={() => setShowNotifications((prev) => !prev)}
        title="Notificaciones"
        aria-label="Notificaciones"
        className="w-10 h-10 bg-[#E7E1D7] rounded-full flex items-center justify-center transition-all duration-300 hover:bg-[#d9d2c7] hover:shadow-[0_0_12px_#C26E5A] hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7]"
      >
        <Bell size={20} className="text-[#2E2E2E]" />
      </button>
      {showNotifications && <NotificationPanel />}
    </div>
  ) : (
    <button
      onClick={() => setShowProtected(true)}
      title="Notificaciones"
      aria-label="Notificaciones"
      className="w-10 h-10 bg-[#E7E1D7] rounded-full flex items-center justify-center transition-all duration-300 hover:bg-[#d9d2c7] hover:shadow-[0_0_12px_#C26E5A] hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7]"
    >
      <Bell size={20} className="text-[#2E2E2E]" />
    </button>
  );

  const btnProfile = user ? (
    <Link 
      href={`/frontend/perfil?id=${user.id}`} 
      className="transition-transform duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7] rounded-full inline-block"
    >
      <Button
        variant="ghost"
        className="flex items-center gap-3 h-10 px-2 bg-[#E7E1D7] rounded-full pr-4 transition-all duration-300 hover:bg-[#d9d2c7] hover:shadow-[0_0_12px_#C26E5A] focus-visible:outline-none"
        title="Mi perfil"
      >
        <img
          src="https://res.cloudinary.com/drjab27cq/image/upload/v1774550604/icon_profile_jxubhg.png"
          alt="Perfil"
          className="w-8 h-8 rounded-full object-contain"
        />
        <span className="text-[15px] font-semibold uppercase text-[#2E2E2E]">
          {user.name}
        </span>
      </Button>
    </Link>
  ) : (
    <Button
      variant="ghost"
      onClick={() => {
        setAuthMode("login");
        setShowAuth(true);
      }}
      className="flex items-center gap-2 h-10 px-3 bg-transparent transition-all duration-300 hover:bg-transparent hover:text-[#c26e5a] hover:drop-shadow-[0_0_8px_#c26e5a] hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7] text-[#555555] rounded-full"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="10" r="3" />
        <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
      </svg>
      <span className="text-[14px] font-bold uppercase tracking-wide">
        INICIAR SESIÓN
      </span>
    </Button>
  );

  return (
    <>
      <header
        className={`font-sans fixed top-0 w-full z-50 bg-[#E7E1D7] text-[#2E2E2E] shadow-sm border-b transition-transform duration-300 ${bolHideHeader ? "-translate-y-full" : "translate-y-0"}`}
      >
        <div className="w-full px-4 lg:px-[40px] h-20 flex items-center justify-between">
          <div className="flex lg:hidden">{btnLogoProbol}</div>

          <div className="flex lg:hidden" ref={refMobileMenuButton}>
            <Button
              variant="ghost"
              className="p-2 rounded-md transition-all duration-300 hover:shadow-[0_0_12px_#c26e5a] hover:text-[#c26e5a] hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7]"
              onClick={() => setBolIsMobileMenuOpen((bolPrev) => !bolPrev)}
              aria-expanded={bolIsMobileMenuOpen}
              aria-label="Abrir menú"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
          </div>

          <div className="hidden lg:flex flex-row items-center gap-6">
            {btnLogoProbol}
            <Link
              href={`/frontend/cobros/planes?id=${user?.id}`}
              className={strLinkClassesDesktop}
            >
              PLANES DE PUBLICACIÓN
            </Link>
          </div>

          <div className="hidden lg:flex flex-row items-center gap-6">
            {arrNavLinks.map((objLink) => (
              <Link
                key={objLink.strLabel}
                href={objLink.strHref}
                className={strLinkClassesDesktop}
              >
                {objLink.strLabel}
              </Link>
            ))}

            <Link
              href={user ? "/frontend/publicacion" : "/login"}
              className="transition-transform duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7] rounded-md"
            >
              <Button className="text-[15px] px-6 h-10 font-semibold bg-[#C26E5A] text-[#E7E1D7] transition-all duration-300 hover:bg-[#b05f4c] hover:shadow-[0_0_15px_#C26E5A] focus-visible:outline-none">
                PUBLICAR
              </Button>
            </Link>

            {btnNotifications}
            {btnProfile}
          </div>
        </div>

        {bolIsMobileMenuOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 z-40 bg-black/20"
              onClick={closeMobileMenu}
            />
            <div
              id="mobile-header-menu"
              ref={refMobileMenuPanel}
              className="lg:hidden absolute top-20 left-0 w-full bg-[#1F3A4D] text-[#E7E1D7] shadow-xl flex flex-col px-8 py-6 gap-6 z-50"
              onClick={(objEvent) => objEvent.stopPropagation()}
            >
              {user ? (
                <Link
                  href={`/frontend/perfil?id=${user.id}`}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-4 border-b border-slate-700 pb-4 ${strLinkClassesMobile}`}
                >
                  <img
                    src="https://res.cloudinary.com/drjab27cq/image/upload/v1774550604/icon_profile_jxubhg.png"
                    alt="Perfil"
                    className="w-10 h-10 rounded-full object-contain"
                  />
                  <span className="uppercase">MI PERFIL ({user.name})</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setShowAuth(true);
                    closeMobileMenu();
                  }}
                  className={`flex items-center gap-4 border-b border-slate-700 pb-4 ${strLinkClassesMobile}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="10" r="3" />
                    <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
                  </svg>
                  <span className="uppercase font-semibold">INICIAR SESIÓN</span>
                </button>
              )}

              <button
                className={`flex items-center gap-4 text-left border-b border-slate-700 pb-4 ${strLinkClassesMobile}`}
                onClick={() => {
                  if (!user) {
                    setShowProtected(true);
                    closeMobileMenu();
                    return;
                  }
                  setShowNotifications((prev) => !prev);
                  closeMobileMenu();
                }}
              >
                <Bell size={20} />
                <span>NOTIFICACIONES</span>
              </button>

              <Link
                href="/frontend/publicacion"
                prefetch={false}
                onClick={closeMobileMenu}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E7E1D7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1F3A4D] rounded-md"
              >
                <Button className="w-full h-12 mt-2 flex items-center justify-center bg-[#C26E5A] text-[#E7E1D7] text-[15px] font-semibold transition-all duration-300 hover:bg-[#b05f4c] hover:shadow-[0_0_15px_#C26E5A] focus-visible:outline-none">
                  PUBLICAR
                </Button>
              </Link>

              {arrNavLinks.map((objLink) => (
                <Link
                  key={objLink.strLabel}
                  href={objLink.strHref}
                  onClick={closeMobileMenu}
                  className={strLinkClassesMobile}
                >
                  {objLink.strLabel}
                </Link>
              ))}

              <Link
                href={`/frontend/cobros/planes?id=${user?.id}`}
                onClick={closeMobileMenu}
                className={`border-t border-slate-700 pt-6 mt-2 ${strLinkClassesMobile}`}
              >
                PLANES DE PUBLICACIÓN
              </Link>
            </div>
          </>
        )}
      </header>

      <ProtectedFeatureModal
        isOpen={showProtected}
        featureName="esta función"
        onClose={() => setShowProtected(false)}
        onLoginClick={() => {
          setShowProtected(false);
          setAuthMode("login");
          setShowAuth(true);
        }}
        onRegisterClick={() => {
          setShowProtected(false);
          setAuthMode("register");
          setShowAuth(true);
        }}
      />
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        initialMode={authMode}
      />
    </>
  );
};