"use client";

import { useRef, useState, useEffect } from "react";
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
/**
 * Dev: Rodrigo Saul Zarate Villarroel     Fecha: 03/04/2026
 * Dev: Erick Eduardo Arnez Torrico        Fecha: 26/03/2026
 * Encabezado principal responsivo con menú desplegable para móviles.
 * Incluye lógica de autenticación, panel de notificaciones con cierre automático,
 * y soporte para el hook de animación con tipos de cursor.
 * @return {object} Componente visual Header para Next.js.
 */
const arrNavLinks = [
  { strHref: "/busqueda?strOperacion=compra", strLabel: "COMPRA" },
  { strHref: "/busqueda?strOperacion=alquiler", strLabel: "ALQUILER" },
  { strHref: "/busqueda?strOperacion=anticretico", strLabel: "ANTICRÉTICO" },
];

export const Header = () => {
  const bolHideHeader = useScrollDirection();
  const strHoverAnim = useHoverAnimation(true);
  const strHoverAnimNoTextColor = useHoverAnimation(false);

  const { user, logout } = useAuth();
  const router = useRouter();

  const [bolIsMobileMenuOpen, setBolIsMobileMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showProtected, setShowProtected] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [showNotifications, setShowNotifications] = useState(false);

  const refMobileMenuPanel = useRef<HTMLDivElement | null>(null);
  const refMobileMenuButton = useRef<HTMLDivElement | null>(null);
  const refNotifPanel = useRef<HTMLDivElement | null>(null);

  const closeMobileMenu = () => setBolIsMobileMenuOpen(false);

  useClickOutside(
    [refMobileMenuPanel, refMobileMenuButton],
    closeMobileMenu,
    bolIsMobileMenuOpen,
  );

  useEffect(() => {
    const handleClickOutside = (objEvent: MouseEvent) => {
      if (
        refNotifPanel.current &&
        !refNotifPanel.current.contains(objEvent.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const strLinkClassesDesktop = `text-[15px] font-normal text-foreground inline-block rounded-md px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund ${strHoverAnim}`;
  const strLinkClassesMobile = `text-[15px] font-normal text-primary-foreground rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-primary ${strHoverAnim}`;

  const btnLogoProbol = (
    <Link
      href="/"
      aria-label="Go to home page"
      className={`inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund ${strHoverAnim}`}
    >
      <img
        src="/logo-principal.svg"
        alt="Portal logo"
        className="h-10 w-auto object-contain lg:h-8 xl:h-10 2xl:h-14"
      />
    </Link>
  );

  const btnNotifications = (
    <div className="relative" ref={refNotifPanel}>
      <button
        onClick={() =>
          user ? setShowNotifications((prev) => !prev) : setShowProtected(true)
        }
        title="Notificaciones"
        aria-label="Notificaciones"
        className={`w-10 h-10 bg-background border border-border rounded-full flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${strHoverAnimNoTextColor}`}
      >
        <img
          src="/bell_icon.svg"
          alt="Notificaciones"
          className="w-6 h-6 object-contain"
        />
      </button>
      {user && showNotifications && <NotificationPanel />}
    </div>
  );

  const btnProfile = user ? (
    <div className="flex items-center gap-2">
      <button
        onClick={() => router.push(`/perfil?id=${user.id}`)}
        className={`flex items-center gap-3 h-10 px-4 bg-background border border-border rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${strHoverAnimNoTextColor}`}
        title="Mi perfil"
      >
        <img
          src="/account_avatar.svg"
          alt="Perfil"
          className="w-7 h-7 object-contain"
        />
        <span className="text-[15px] font-semibold uppercase text-foreground leading-none">
          {user.name}
        </span>
      </button>
    </div>
  ) : (
    <button
      onClick={() => {
        setAuthMode("login");
        setShowAuth(true);
      }}
      className={`h-10 px-4 rounded-full bg-background border border-border flex items-center gap-3 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${strHoverAnimNoTextColor}`}
    >
      <div className="relative flex items-center justify-center">
        <img
          src="/account_avatar.svg"
          alt="Icono cuenta"
          className="w-7 h-7 object-contain"
        />
        <div className="absolute w-[120%] h-[2px] bg-foreground rotate-45 rounded-full" />
      </div>
      <span className="text-[15px] font-semibold uppercase text-foreground leading-none pt-0.5">
        INICIAR SESIÓN
      </span>
    </button>
  );

  return (
    <>
      <header
        className={`fixed top-0 w-full z-[100] bg-background text-foreground shadow-sm border-b border-border transition-transform duration-300 ${bolHideHeader ? "-translate-y-full" : "translate-y-0"}`}
      >
        <div className="w-full px-4 lg:px-[40px] h-18 flex items-center justify-between">
          <div className="flex lg:hidden">{btnLogoProbol}</div>

          <div className="flex lg:hidden" ref={refMobileMenuButton}>
            <button
              className={`p-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-fund ${strHoverAnim}`}
              onClick={() => setBolIsMobileMenuOpen((bolPrev) => !bolPrev)}
              aria-expanded={bolIsMobileMenuOpen}
              aria-label="Abrir menú"
            >
              <img
                src="/hamburger_icon.svg"
                alt="Menú"
                className="w-7 h-7 object-contain"
              />
            </button>
          </div>

          <div className="hidden lg:flex flex-row items-center gap-6">
            {btnLogoProbol}
            <Link href={`/cobros/planes`} className={strLinkClassesDesktop}>
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

            <button
              onClick={() => router.push(user ? "/publicacion" : "/login")}
              className={`text-[15px] px-6 h-10 font-semibold rounded-lg border border-border bg-secondary text-secondary-foreground flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${strHoverAnimNoTextColor}`}
            >
              PUBLICAR
            </button>

            {btnNotifications}
            {btnProfile}
          </div>
        </div>

        {bolIsMobileMenuOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 z-40"
              onClick={closeMobileMenu}
            />
            <div
              id="mobile-header-menu"
              ref={refMobileMenuPanel}
              className="lg:hidden absolute top-18 left-0 w-full bg-primary text-primary-foreground shadow-xl flex flex-col px-8 py-6 gap-6 z-50"
              onClick={(objEvent) => objEvent.stopPropagation()}
            >
              {user ? (
                <button
                  onClick={() => {
                    router.push(`/perfil?id=${user.id}`);
                    closeMobileMenu();
                  }}
                  className={`flex items-center gap-4 border-b border-primary-foreground/10 pb-4 ${strLinkClassesMobile}`}
                >
                  <div className="relative flex items-center justify-center">
                    <img
                      src="/account_avatar.svg"
                      alt="Perfil"
                      className="w-6 h-6 object-contain brightness-0 invert"
                    />
                  </div>
                  <span className="uppercase font-semibold text-left">
                    PERFIL: {user.name}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setShowAuth(true);
                    closeMobileMenu();
                  }}
                  className={`flex items-center gap-4 border-b border-primary-foreground/10 pb-4 ${strLinkClassesMobile}`}
                >
                  <div className="relative flex items-center justify-center">
                    <img
                      src="/account_avatar.svg"
                      alt="Iniciar Sesión"
                      className="w-6 h-6 object-contain brightness-0 invert"
                    />
                    <div className="absolute w-[120%] h-[2px] bg-background rotate-45 rounded-full" />
                  </div>
                  <span className="uppercase font-semibold">
                    INICIAR SESIÓN
                  </span>
                </button>
              )}

              <button
                className={`flex items-center gap-4 text-left border-b border-primary-foreground/10 pb-4 ${strLinkClassesMobile}`}
                onClick={() => {
                  if (!user) setShowProtected(true);
                  else setShowNotifications((p) => !p);
                  closeMobileMenu();
                }}
              >
                <img
                  src="/bell_icon.svg"
                  alt="Campana"
                  className="w-6 h-6 object-contain brightness-0 invert"
                />
                <span className="uppercase">NOTIFICACIONES</span>
              </button>

              <button
                onClick={() => {
                  router.push("/publicacion");
                  closeMobileMenu();
                }}
                className={`w-full h-12 mt-2 flex items-center justify-center bg-secondary text-secondary-foreground text-[15px] font-semibold rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background ${strHoverAnimNoTextColor}`}
              >
                PUBLICAR
              </button>

              {arrNavLinks.map((objLink) => (
                <div
                  key={objLink.strLabel}
                  onClick={() => {
                    router.push(objLink.strHref);
                    closeMobileMenu();
                  }}
                  className={`cursor-pointer border-b border-primary-foreground/10 pb-4 ${strLinkClassesMobile}`}
                >
                  {objLink.strLabel}
                </div>
              ))}

              <div
                onClick={() => {
                  router.push(`/cobros/planes`);
                  closeMobileMenu();
                }}
                className={`pt-2 cursor-pointer ${strLinkClassesMobile}`}
              >
                PLANES DE PUBLICACIÓN
              </div>
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
