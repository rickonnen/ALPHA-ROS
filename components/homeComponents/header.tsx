/**
 * Dev: Rodrigo Saul Zarate Villarroel      Fecha: 12/04/2026
 * Dev: Erick Eduardo Arnez Torrico         Fecha: 26/03/2026
 * encabezado principal responsivo orquestador gestiona estados globales y rutas
 */
"use client";

import { useRef, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

/* hooks y ui */
import { useScrollDirection } from "../hooks/useScrollDirection";
import { useHoverAnimation } from "../hooks/useHoverAnimation";
import { useClickOutside } from "../hooks/useClickOutside";
import { usePublicarAccion } from "../hooks/usePublicarAccion";
import { useFotoPerfil } from "../hooks/useFotoPerfil";
import { useUsuarioHeader } from "../hooks/useUsuarioHeader";
import { useAuth } from "@/app/auth/AuthContext";

/* componentes de ui */
import AuthModal from "@/app/auth/AuthModal";
import ProtectedFeatureModal from "@/app/auth/ProtectedFeatureModal";
import FreePublicationLimitModal from "@/features/publicacion/components/FreePublicationLimitModal";
import PlanLimitModal from "@/features/publicacion/components/PlanLimitModal";
import { useUnreadCount } from "@/components/hooks/useUnreadCount";
import { Skeleton } from "@/components/ui/skeleton";

/* subcomponentes */
import { NotificationButton } from "./headerSubcomponents/notificationButton";
import { MobileMenu } from "./headerSubcomponents/mobileMenu";

interface NavLink {
  strHref: string;
  strLabel: string;
  strValue: string;
}

//rutas
const APP_PATHS = {
  home: "/",
  profile: "/perfil",
  plans: "/cobros/planes",
};

// rutas navegación de operaciones
const arrNavLinks: NavLink[] = [
  { strHref: "/busqueda", strLabel: "EN VENTA", strValue: "Venta" },
  { strHref: "/busqueda", strLabel: "ALQUILER", strValue: "Alquiler" },
  { strHref: "/busqueda", strLabel: "ANTICRÉTICO", strValue: "Anticrético" },
];

export const Header = () => {
  // hooks de lógica
  const bolHideHeader = useScrollDirection();
  // animación estándar escala + color
  const strHoverAnim = useHoverAnimation(true);
  // solo resplandor
  const strHoverAnimNoTextColor = useHoverAnimation(false);

  // datos de usuario y autenticación
  const { user: objUser, isLoading: bolIsAuthLoading } = useAuth();
  const { strFotoPerfil } = useFotoPerfil(objUser?.id);
  const { strNombreHeader } = useUsuarioHeader(objUser); // centraliza el nombre/username actualizado
  const unreadCount = useUnreadCount(objUser);
  const objRouter = useRouter();

  // modales y menus
  const [bolIsMobileMenuOpen, setBolIsMobileMenuOpen] = useState(false);
  const [bolShowAuth, setBolShowAuth] = useState(false);
  const [bolShowProtected, setBolShowProtected] = useState(false);
  const [strAuthMode, setStrAuthMode] = useState<"login" | "register">("login");
  const [bolShowLimitModal, setBolShowLimitModal] = useState(false);
  const [bolShowLimitPlanModal, setBolShowLimitPlanModal] = useState(false);

  const refMobileMenuPanel = useRef<HTMLDivElement | null>(null);
  const refMobileMenuButton = useRef<HTMLDivElement | null>(null);

  const clsFocusBase = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund";

  // memoización de estilos
  const strLinkClassesDesktop = useMemo(
    () => `text-[0.83rem] md:text-[0.95rem] lg:text-[1.07rem] font-normal text-foreground inline-block rounded-md px-1 cursor-pointer whitespace-nowrap ${clsFocusBase} ${strHoverAnim}`,
    [strHoverAnim]
  );

  const strLinkClassesMobile = useMemo(
    () => `text-body-info font-normal text-primary-foreground rounded-md hover:bg-primary-foreground/10 active:bg-primary-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-primary`,
    []
  );

  // maneja eventos
  const handleCloseMobileMenu = useCallback(() => setBolIsMobileMenuOpen(false), []);
  const handleShowProtected = useCallback(() => setBolShowProtected(true), []);

  const handleOpenLogin = useCallback(() => {
    setStrAuthMode("login");
    setBolShowAuth(true);
    handleCloseMobileMenu();
    setBolShowProtected(false);
  }, [handleCloseMobileMenu]);

  const handleOpenRegister = useCallback(() => {
    setStrAuthMode("register");
    setBolShowAuth(true);
    handleCloseMobileMenu();
    setBolShowProtected(false);
  }, [handleCloseMobileMenu]);

  // navegación con parámetros de búsqueda
  const handleFilterNavigation = useCallback((objLink: NavLink) => {
    const objParams = new URLSearchParams();
    objParams.set("operaciones", objLink.strValue);
    objRouter.push(`${objLink.strHref}?${objParams.toString()}`);
    handleCloseMobileMenu();
  }, [objRouter, handleCloseMobileMenu]);

  // botón de publicar (verificación de límites y sesión)
  const { handlePublicar, bolIsChecking: bolIsCheckingLimit } = usePublicarAccion({
    objUser,
    onShowProtected: handleShowProtected,
    onShowLimit: () => setBolShowLimitModal(true),         // HU5 — ya existía
    onShowLimitPlan: () => setBolShowLimitPlanModal(true), // HU7 — nuevo
    onCloseMobileMenu: handleCloseMobileMenu,
    bolIsAuthLoading,
  });

  useClickOutside([refMobileMenuPanel, refMobileMenuButton], handleCloseMobileMenu, bolIsMobileMenuOpen);

  // renderizado optimizado del logo
  const objLogoElement = useMemo(() => (
    <Link href={APP_PATHS.home} aria-label="ir a inicio" className={`inline-flex items-center gap-2 rounded-md shrink-0 ${clsFocusBase} ${strHoverAnim}`}>
      <Image src="/logo-principal.svg" alt="logo probol" width={40} height={40} className="h-10 w-auto object-contain lg:h-8 xl:h-10 2xl:h-14" priority />
      <span className="text-subtitle lg:text-body-info xl:text-subtitle 2xl:text-main-title font-heading font-black tracking-tighter leading-none">
        <span className="text-primary">PROP</span>
        <span className="text-secondary">BOL</span>
      </span>
    </Link>
  ), [strHoverAnim]);

  return (
    <>
      <header className={`fixed top-0 w-full z-[100] bg-secondary-fund text-foreground shadow-sm border-b border-border transition-transform duration-300 ${bolHideHeader ? "-translate-y-full" : "translate-y-0"}`}>
        <div className="w-full px-4 lg:px-[40px] h-18 flex items-center justify-between gap-4 lg:gap-8">

          {/* móvil izquierda logo */}
          <div className="flex lg:hidden shrink-0">{objLogoElement}</div>

          {/* móvil derecha notificaciones y hamburger */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            {bolIsAuthLoading ? (
              <Skeleton className="w-10 h-10 rounded-full" />
            ) : objUser ? (
              <NotificationButton
                objUser={objUser}
                unreadCount={unreadCount}
                onRequireAuth={handleShowProtected}
                strButtonClasses={`relative w-10 h-10 rounded-md flex items-center justify-center ${clsFocusBase}`}
              />
            ) : null}
            <div ref={refMobileMenuButton}>
              <button aria-label="menú principal" className={`p-2 rounded-md ${clsFocusBase}`} onClick={() => setBolIsMobileMenuOpen((p) => !p)}>
                <Image src="/hamburger_icon.svg" alt="menú" width={28} height={28} className="w-7 h-7 object-contain" />
              </button>
            </div>
          </div>

          {/* desktop izquierda logo */}
          <div className="hidden lg:flex flex-row items-center shrink-0">{objLogoElement}</div>

          {/* desktop derecha navegación, publicar, etc) */}
          <div className="hidden lg:flex flex-row items-center gap-x-4 md:gap-x-6">
            {arrNavLinks.map((objLink) => (
              <button key={objLink.strLabel} onClick={() => handleFilterNavigation(objLink)} className={strLinkClassesDesktop}>{objLink.strLabel}</button>
            ))}

            <Link href={APP_PATHS.plans} className={`${strLinkClassesDesktop} text-center leading-[1.1] uppercase whitespace-nowrap`}>planes de<br />publicacion</Link>

            {/* mejora: botón publicar sin borde gris y texto en mayúsculas para mejor alineación */}
            <button onClick={handlePublicar} disabled={bolIsCheckingLimit}
              className={`text-[0.83rem] md:text-[0.95rem] lg:text-[1.07rem] px-6 h-10 font-bold rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center disabled:opacity-60 whitespace-nowrap ${clsFocusBase} ${strHoverAnimNoTextColor}`}>
              {bolIsCheckingLimit ? "VERIFICANDO..." : "PUBLICAR"}
            </button>

            {/* solo muestra skeletons mientras auth carga */}
            {bolIsAuthLoading ? (
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="h-10 w-36 rounded-full" />
              </div>
            ) : objUser ? (
              <>
                <NotificationButton
                  objUser={objUser}
                  unreadCount={unreadCount}
                  onRequireAuth={handleShowProtected}
                  strButtonClasses={`relative w-10 h-10 bg-background border border-border rounded-full flex items-center justify-center ${clsFocusBase} ${strHoverAnimNoTextColor}`}
                />
                <button aria-label="perfil de usuario" onClick={() => objRouter.push(`${APP_PATHS.profile}`)}
                  className={`flex items-center gap-3 h-10 px-4 bg-background border border-border rounded-full ${clsFocusBase} ${strHoverAnimNoTextColor}`}>
                  <Image src={strFotoPerfil || "/account_avatar.svg"} alt="perfil" width={28} height={28} className="w-7 h-7 object-cover rounded-full bg-muted"
                    unoptimized={true} onError={(e) => { e.currentTarget.src = "/account_avatar.svg"; e.currentTarget.srcset = "/account_avatar.svg"; }} />
                  <span className="text-[0.83rem] md:text-[0.95rem] lg:text-[1.07rem] font-semibold uppercase text-foreground leading-none whitespace-nowrap">{strNombreHeader}</span>
                </button>
              </>
            ) : (
              <button onClick={handleOpenLogin} className={`h-10 px-4 rounded-full bg-background border border-border flex items-center gap-3 transition-all duration-300 ${clsFocusBase} ${strHoverAnimNoTextColor}`}>
                <div className="relative flex items-center justify-center">
                  <Image src="/account_avatar.svg" alt="iniciar sesión" width={28} height={28} className="w-7 h-7 object-contain" />
                  <div className="absolute w-[120%] h-[2px] bg-foreground rotate-45 rounded-full" />
                </div>
                <span className="text-[0.83rem] md:text-[0.95rem] lg:text-[1.07rem] font-semibold uppercase text-foreground leading-none pt-0.5 whitespace-nowrap">iniciar sesión</span>
              </button>
            )}
          </div>
        </div>

        {/* menú móvil delegación de toda la interfaz móvil para reducir peso en el header principal */}
        <MobileMenu
          menuRef={refMobileMenuPanel}
          isOpen={bolIsMobileMenuOpen}
          onClose={handleCloseMobileMenu}
          objUser={objUser}
          strNombreHeader={strNombreHeader}
          strFotoPerfil={strFotoPerfil}
          arrNavLinks={arrNavLinks}
          onLoginClick={handleOpenLogin}
          onPublicarClick={handlePublicar}
          onProfileClick={() => { if (!objUser) return; objRouter.push(`${APP_PATHS.profile}?id=${objUser.id}`); handleCloseMobileMenu(); }}
          onPlansClick={() => { objRouter.push(APP_PATHS.plans); handleCloseMobileMenu(); }}
          onNavigate={handleFilterNavigation}
          bolIsCheckingLimit={bolIsCheckingLimit}
          bolIsAuthLoading={bolIsAuthLoading}
          strLinkClassesMobile={strLinkClassesMobile}
        />
      </header>

      {/* modales globales */}
      <ProtectedFeatureModal isOpen={bolShowProtected} onClose={() => setBolShowProtected(false)} onLoginClick={handleOpenLogin} onRegisterClick={handleOpenRegister} />
      <AuthModal isOpen={bolShowAuth} onClose={() => setBolShowAuth(false)} initialMode={strAuthMode} />
      <FreePublicationLimitModal bolOpen={bolShowLimitModal} onBack={() => setBolShowLimitModal(false)} />
      <PlanLimitModal bolOpen={bolShowLimitPlanModal} onBack={() => setBolShowLimitPlanModal(false)} />
    </>
  );
};