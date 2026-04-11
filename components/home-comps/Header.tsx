/**
 * Dev: Rodrigo Saul Zarate Villarroel      Fecha: 03/04/2026
 * Dev: Erick Eduardo Arnez Torrico         Fecha: 26/03/2026
 * Encabezado principal responsivo con menú desplegable para móviles.
 */
"use client";

import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useScrollDirection } from "../hooks/useScrollDirection";
import { useHoverAnimation } from "../hooks/useHoverAnimation";
import { useClickOutside } from "../hooks/useClickOutside";
import { usePublicarAccion } from "../hooks/usePublicarAccion";
import { useFotoPerfil } from "../hooks/useFotoPerfil";
import { useAuth } from "@/app/auth/AuthContext";

import AuthModal from "@/app/auth/AuthModal";
import ProtectedFeatureModal from "@/app/auth/ProtectedFeatureModal";
import FreePublicationLimitModal from "@/features/publicacion/components/FreePublicationLimitModal";
import { NotificationPanel } from "@/app/home/components/notifications/NotificationPanel";
import { NotificationBadge } from "@/app/home/components/notifications/NotificationBadge";
import { useUnreadCount } from "@/components/hooks/useUnreadCount";
import { Skeleton } from "@/components/ui/skeleton";

interface NavLink {
  strHref: string;
  strLabel: string;
  strValue: string;
}

const arrNavLinks: NavLink[] = [
  { strHref: "/busqueda", strLabel: "EN VENTA", strValue: "Venta" },
  { strHref: "/busqueda", strLabel: "ALQUILER", strValue: "Alquiler" },
  { strHref: "/busqueda", strLabel: "ANTICRÉTICO", strValue: "Anticrético" },
];

export const Header = () => {
  const bolHideHeader = useScrollDirection();
  const strHoverAnim = useHoverAnimation(true);
  const strHoverAnimNoTextColor = useHoverAnimation(false);

  const { user: objUser, isLoading: bolIsAuthLoading } = useAuth();
  const { strFotoPerfil } = useFotoPerfil(objUser?.id);
  const unreadCount = useUnreadCount(objUser);
  const objRouter = useRouter();
  const [objNombreHeader, setObjNombreHeader] = useState<{
    idUsuario: string;
    nombre: string;
  }>({ idUsuario: "", nombre: "" });

  const [bolIsMobileMenuOpen, setBolIsMobileMenuOpen] = useState(false);
  const [bolShowAuth, setBolShowAuth] = useState(false);
  const [bolShowProtected, setBolShowProtected] = useState(false);
  const [strAuthMode, setStrAuthMode] = useState<"login" | "register">("login");
  const [bolShowNotifications, setBolShowNotifications] = useState(false);
  const [bolShowLimitModal, setBolShowLimitModal] = useState(false);

  useEffect(() => {
    if (!objUser?.id) return;

    const fetchNombreActualizado = async () => {
      try {
        const res = await fetch(
          `/api/perfil/getUsuario?id_usuario=${objUser.id}`,
          {
            cache: "no-store",
          },
        );
        if (!res.ok) return;

        const json = await res.json();
        const strNombres = json?.data?.nombres?.trim() ?? "";
        const strApellidos = json?.data?.apellidos?.trim() ?? "";
        const strNombreCompleto = `${strNombres} ${strApellidos}`.trim();
        const strUsername = json?.data?.username?.trim() ?? "";

        setObjNombreHeader({
          idUsuario: objUser.id,
          nombre: strNombreCompleto || strUsername || objUser.name || "",
        });
      } catch {}
    };

    const handlePerfilActualizado = () => {
      void fetchNombreActualizado();
    };

    window.addEventListener("perfil:foto-actualizada", handlePerfilActualizado);
    return () => {
      window.removeEventListener(
        "perfil:foto-actualizada",
        handlePerfilActualizado,
      );
    };
  }, [objUser?.id, objUser?.name]);

  const strNombreHeader =
    objNombreHeader.idUsuario === (objUser?.id ?? "") && objNombreHeader.nombre
      ? objNombreHeader.nombre
      : (objUser?.name ?? "");

  const refMobileMenuPanel = useRef<HTMLDivElement | null>(null);
  const refMobileMenuButton = useRef<HTMLDivElement | null>(null);
  const refNotifPanelMobile = useRef<HTMLDivElement | null>(null);
  const refNotifPanelDesktop = useRef<HTMLDivElement | null>(null);

  // clases comunes para evitar reconstruir strings
  const clsFocusBase =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund";

  const strLinkClassesDesktop = useMemo(
    () =>
      `text-[0.83rem] md:text-[0.95rem] lg:text-[1.07rem] font-normal text-foreground inline-block rounded-md px-1 cursor-pointer whitespace-nowrap ${clsFocusBase} ${strHoverAnim}`,
    [strHoverAnim],
  );

  const strLinkClassesMobile = useMemo(
    () =>
      `text-body-info font-normal text-primary-foreground rounded-md 
       hover:bg-primary-foreground/10 active:bg-primary-foreground/20 
       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-primary`,
    [],
  );

  const handleCloseMobileMenu = useCallback(
    () => setBolIsMobileMenuOpen(false),
    [],
  );
  const handleCloseNotifications = useCallback(
    () => setBolShowNotifications(false),
    [],
  );

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

  const handleFilterNavigation = useCallback(
    (objLink: NavLink) => {
      const objParams = new URLSearchParams();
      objParams.set("operaciones", objLink.strValue);
      objRouter.push(`${objLink.strHref}?${objParams.toString()}`);
      handleCloseMobileMenu();
    },
    [objRouter, handleCloseMobileMenu],
  );

  const { handlePublicar, bolIsChecking: bolIsCheckingLimit } =
    usePublicarAccion({
      objUser,
      onShowProtected: () => setBolShowProtected(true),
      onShowLimit: () => setBolShowLimitModal(true),
      onCloseMobileMenu: handleCloseMobileMenu,
      bolIsAuthLoading,
    });

  useClickOutside(
    [refMobileMenuPanel, refMobileMenuButton],
    handleCloseMobileMenu,
    bolIsMobileMenuOpen,
  );
  useClickOutside(
    [refNotifPanelMobile, refNotifPanelDesktop],
    handleCloseNotifications,
    bolShowNotifications,
  );

  const objLogoElement = useMemo(
    () => (
      <Link
        href="/"
        aria-label="Ir a inicio"
        className={`inline-flex items-center gap-2 rounded-md shrink-0 ${clsFocusBase} ${strHoverAnim}`}
      >
        <Image
          src="/logo-principal.svg"
          alt="Logo PROBOL"
          width={40}
          height={40}
          className="h-10 w-auto object-contain lg:h-8 xl:h-10 2xl:h-14"
          priority
        />
        <span className="text-subtitle lg:text-body-info xl:text-subtitle 2xl:text-main-title font-heading font-black tracking-tighter leading-none">
          <span className="text-primary">PROP</span>
          <span className="text-secondary">BOL</span>
        </span>
      </Link>
    ),
    [strHoverAnim],
  );

  return (
    <>
      <header
        className={`fixed top-0 w-full z-[100] bg-secondary-fund text-foreground shadow-sm border-b border-border transition-transform duration-300 ${
          bolHideHeader ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="w-full px-4 lg:px-[40px] h-18 flex items-center justify-between gap-4 lg:gap-8">
          
          {/* mobil lado izquierdo */}
          <div className="flex lg:hidden shrink-0">
            {bolIsAuthLoading ? (
              <Skeleton className="h-10 w-28" />
            ) : (
              objLogoElement
            )}
          </div>

          {/* mobil lado derecho */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            <div className="relative" ref={refNotifPanelMobile}>
              {bolIsAuthLoading ? (
                <Skeleton className="w-10 h-10 rounded-full" />
              ) : (
                <button
                  aria-label="Notificaciones"
                  onClick={() =>
                    objUser
                      ? setBolShowNotifications((p) => !p)
                      : setBolShowProtected(true)
                  }
                  className={`relative w-10 h-10 rounded-md flex items-center justify-center ${clsFocusBase}`}
                >
                  <img
                    src="/bell_icon.svg"
                    alt=""
                    className="w-6 h-6 object-contain"
                  />
                  <NotificationBadge count={unreadCount} />
                </button>
              )}
              {objUser && bolShowNotifications && (
                <div className="absolute right-[-15px] top-full mt-0">
                  <NotificationPanel />
                </div>
              )}
            </div>

            <div ref={refMobileMenuButton}>
              <button
                aria-label="Menú principal"
                aria-expanded={bolIsMobileMenuOpen}
                className={`p-2 rounded-md ${clsFocusBase}`}
                onClick={() => setBolIsMobileMenuOpen((p) => !p)}
              >
                <img
                  src="/hamburger_icon.svg"
                  alt=""
                  className="w-7 h-7 object-contain"
                />
              </button>
            </div>
          </div>

          {/* pc lado izquierdo (Solo Logo) */}
          <div className="hidden lg:flex flex-row items-center shrink-0">
            {bolIsAuthLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              objLogoElement
            )}
          </div>

          {/* pc lado derecho */}
          <div className="hidden lg:flex flex-row items-center gap-x-4 md:gap-x-6">
            
            {bolIsAuthLoading ? (
              <div className="flex gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-5 w-20" />
                ))}
              </div>
            ) : (
              arrNavLinks.map((objLink) => (
                <button
                  key={objLink.strLabel}
                  onClick={() => handleFilterNavigation(objLink)}
                  className={strLinkClassesDesktop}
                >
                  {objLink.strLabel}
                </button>
              ))
            )}

            {bolIsAuthLoading ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              <Link
                href="/cobros/planes"
                className={`${strLinkClassesDesktop} text-center leading-[1.1] uppercase whitespace-nowrap`}
              >
                planes de
                <br />
                publicacion
              </Link>
            )}

            {bolIsAuthLoading ? (
              <Skeleton className="h-10 w-28 rounded-lg" />
            ) : (
              <button
                onClick={handlePublicar}
                disabled={bolIsCheckingLimit}
                className={`text-[0.83rem] md:text-[0.95rem] lg:text-[1.07rem] px-6 h-10 font-semibold rounded-lg border border-border bg-secondary text-secondary-foreground flex items-center justify-center disabled:opacity-60 whitespace-nowrap ${clsFocusBase} ${strHoverAnimNoTextColor}`}
              >
                PUBLICAR
              </button>
            )}

            <div className="relative" ref={refNotifPanelDesktop}>
              {bolIsAuthLoading ? (
                <Skeleton className="w-10 h-10 rounded-full" />
              ) : (
                <button
                  aria-label="Notificaciones"
                  onClick={() =>
                    objUser
                      ? setBolShowNotifications((p) => !p)
                      : setBolShowProtected(true)
                  }
                  className={`relative w-10 h-10 bg-background border border-border rounded-full flex items-center justify-center ${clsFocusBase} ${strHoverAnimNoTextColor}`}
                >
                  <img
                    src="/bell_icon.svg"
                    alt=""
                    className="w-6 h-6 object-contain"
                  />
                  <NotificationBadge count={unreadCount} />
                </button>
              )}
              {objUser && bolShowNotifications && <NotificationPanel />}
            </div>

            {bolIsAuthLoading ? (
              <Skeleton className="h-10 w-36 rounded-full" />
            ) : objUser ? (
              <button
                aria-label="Perfil de usuario"
                onClick={() => objRouter.push(`/perfil?id=${objUser.id}`)}
                className={`flex items-center gap-3 h-10 px-4 bg-background border border-border rounded-full ${clsFocusBase} ${strHoverAnimNoTextColor}`}
              >
                <img
                  src={strFotoPerfil}
                  alt=""
                  className="w-7 h-7 object-contain rounded-full bg-muted"
                  onError={(e) => {
                    e.currentTarget.src = "/account_avatar.svg";
                  }}
                />
                <span className="text-[0.83rem] md:text-[0.95rem] lg:text-[1.07rem] font-semibold uppercase text-foreground leading-none whitespace-nowrap">
                  {strNombreHeader}
                </span>
              </button>
            ) : (
              <button
                onClick={handleOpenLogin}
                className={`h-10 px-4 rounded-full bg-background border border-border flex items-center gap-3 transition-all duration-300 ${clsFocusBase} ${strHoverAnimNoTextColor}`}
              >
                <div className="relative flex items-center justify-center">
                  <img
                    src="/account_avatar.svg"
                    alt=""
                    className="w-7 h-7 object-contain"
                  />
                  <div className="absolute w-[120%] h-[2px] bg-foreground rotate-45 rounded-full" />
                </div>
                <span className="text-[0.83rem] md:text-[0.95rem] lg:text-[1.07rem] font-semibold uppercase text-foreground leading-none pt-0.5 whitespace-nowrap">
                  INICIAR SESIÓN
                </span>
              </button>
            )}
          </div>
        </div>

        {/* movil menú desplegable */}
        {bolIsMobileMenuOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 z-40"
              onClick={handleCloseMobileMenu}
              aria-hidden="true"
            />
            <nav
              aria-label="Menú móvil"
              ref={refMobileMenuPanel}
              className="lg:hidden absolute top-18 left-0 w-full bg-primary text-primary-foreground shadow-xl flex flex-col px-8 py-6 z-50 animate-in slide-in-from-top-2"
              onClick={(e) => e.stopPropagation()}
            >
              {objUser ? (
                <button
                  onClick={() => {
                    objRouter.push(`/perfil?id=${objUser.id}`);
                    handleCloseMobileMenu();
                  }}
                  className={`flex items-center gap-4 pb-12 w-full text-left uppercase ${strLinkClassesMobile}`}
                >
                  <img
                    src={strFotoPerfil}
                    alt=""
                    className="w-7 h-7 object-contain rounded-full bg-primary-foreground/20"
                    onError={(e) => {
                      e.currentTarget.src = "/account_avatar.svg";
                    }}
                  />
                  <span>{strNombreHeader}</span>
                </button>
              ) : (
                <button
                  onClick={handleOpenLogin}
                  className={`flex items-center gap-4 pb-12 w-full text-left uppercase ${strLinkClassesMobile}`}
                >
                  <div className="relative flex items-center justify-center">
                    <img
                      src="/account_avatar.svg"
                      alt=""
                      className="w-7 h-7 object-contain brightness-0 invert"
                    />
                    <div className="absolute w-[120%] h-[2px] bg-background rotate-45 rounded-full" />
                  </div>
                  <span>INICIAR SESIÓN</span>
                </button>
              )}

              <div className="flex flex-col gap-6">
                <button
                  onClick={handlePublicar}
                  disabled={bolIsCheckingLimit || bolIsAuthLoading}
                  className={`border-b border-primary-foreground/10 pb-4 w-full text-left uppercase disabled:opacity-60 ${strLinkClassesMobile}`}
                >
                  PUBLICAR
                </button>

                <div
                  onClick={() => {
                    objRouter.push(`/cobros/planes`);
                    handleCloseMobileMenu();
                  }}
                  className={`cursor-pointer border-b border-primary-foreground/10 pb-4 uppercase ${strLinkClassesMobile}`}
                >
                  PLANES DE PUBLICACIÓN
                </div>

                {arrNavLinks.map((objLink) => (
                  <button
                    key={objLink.strLabel}
                    onClick={() => handleFilterNavigation(objLink)}
                    className={`text-left border-b border-primary-foreground/10 pb-4 uppercase w-full ${strLinkClassesMobile}`}
                  >
                    {objLink.strLabel}
                  </button>
                ))}
              </div>
            </nav>
          </>
        )}
      </header>

      {/* modals */}
      <ProtectedFeatureModal
        isOpen={bolShowProtected}
        onClose={() => setBolShowProtected(false)}
        onLoginClick={handleOpenLogin}
        onRegisterClick={handleOpenRegister}
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