"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useScrollDirection } from '../hooks/useScrollDirection';

interface HeaderProps {
  bolIsLoggedIn: boolean;
  strUserName?: string;
}

/**
 * Dev: Rodrigo Zarate     Fecha: 25/03/2026
 * Funcionalidad: Renderizar el encabezado responsivo. Botón PUBLICAR en desktop actualizado a color terracota (secondary).
 * @param {object} objProps Propiedades que incluyen el estado de sesión del usuario.
 * @return {object} Componente visual Header para Next.js.
 */
export const Header = (objProps: HeaderProps) => {
  const bolHideHeader = useScrollDirection();
  
  // Estado para controlar el menú de celular
  const [bolIsMobileMenuOpen, setBolIsMobileMenuOpen] = useState(false);
  const refMobileMenuPanel = useRef<HTMLDivElement | null>(null);
  const refMobileMenuButton = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!bolIsMobileMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const targetNode = event.target as Node | null;

      if (!targetNode) {
        return;
      }

      if (refMobileMenuPanel.current?.contains(targetNode)) {
        return;
      }

      if (refMobileMenuButton.current?.contains(targetNode)) {
        return;
      }

      setBolIsMobileMenuOpen(false);
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setBolIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [bolIsMobileMenuOpen]);

  // Variable del Logo (Reutilizable tanto en PC como en Celular)
  const btnLogoProbol = (
    <Link
            href="/"
            aria-label="Go to home page"
            className="inline-flex rounded-sm transition-opacity duration-200 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7]"
          >
            <img
              src="/logo-principal.svg"
              alt="Portal logo"
              className="h-10 w-auto object-contain lg:h-6 xl:h-8 2xl:h-12"
            />
          </Link>
  );

  return (
    <header className={`font-sans fixed top-0 w-full z-50 bg-background text-foreground shadow-sm border-b transition-transform duration-300 ${bolHideHeader ? '-translate-y-full' : 'translate-y-0'}`}>
      
      {/* Contenedor Principal */}
      <div className="w-full px-4 lg:px-[40px] h-16 flex items-center justify-between">
        
        {/* VISTA MÓVIL (Celulares) */}
        <div className="flex lg:hidden">
          {btnLogoProbol}
        </div>

        {/* DERECHA: Botón Hamburguesa */}
        <div className="flex lg:hidden" ref={refMobileMenuButton}>
          <Button 
            variant="ghost" 
            className="p-2" 
            onClick={() => setBolIsMobileMenuOpen((prevState) => !prevState)}
            aria-expanded={bolIsMobileMenuOpen}
            aria-controls="mobile-header-menu"
            aria-label="Abrir menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        </div>


        {/* VISTA DESKTOP (Computadoras) */}
        {/* LADO IZQUIERDO: Logo + Planes */}
        <div className="hidden lg:flex flex-row items-center gap-6">
          {btnLogoProbol}
          <Link href="/planes" className="text-xl font-normal hover:text-primary transition-colors">
            PLANES DE PUBLICACIÓN
          </Link>
        </div>

        {/* LADO DERECHO: Navegación Completa */}
        <div className="hidden lg:flex flex-row items-center gap-6">
          <Link href="/busqueda?strOperacion=compra" className="text-xl font-normal hover:text-primary transition-colors">COMPRA</Link>
          <Link href="/busqueda?strOperacion=alquiler" className="text-xl font-normal hover:text-primary transition-colors">ALQUILER</Link>
          <Link href="/busqueda?strOperacion=anticretico" className="text-xl font-normal hover:text-primary transition-colors">ANTICRÉTICO</Link>

          <Link href={objProps.bolIsLoggedIn ? "/publicacion" : "/login"}>
            <Button className="text-xl px-6 h-10 font-semibold bg-secondary hover:bg-secondary/90 text-white transition-colors">PUBLICAR</Button>
          </Link>

          <button 
            className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center hover:bg-slate-300 transition-colors"
            onClick={() => !objProps.bolIsLoggedIn && alert('Debe iniciar sesión primero')}
            title="Notificaciones"
          >
            <img
               src="https://res.cloudinary.com/drjab27cq/image/upload/v1774551632/notification_dchcxp.png"
               alt="Notificaciones"
               className="w-5 h-5 object-contain"
            />
          </button>

          <Link href={objProps.bolIsLoggedIn ? "/perfil" : "/login"}>
            <Button variant="ghost" className="flex items-center gap-3 h-10 px-2 hover:bg-slate-100 transition-colors bg-slate-200 rounded-full pr-4">
              <img
                  src="https://res.cloudinary.com/drjab27cq/image/upload/v1774550604/icon_profile_jxubhg.png"
                  alt="Perfil"
                  className="w-13 h-13 rounded-full object-contain"
              />
              <span className="text-sm font-semibold uppercase text-slate-700">
                {objProps.bolIsLoggedIn ? "MI PERFIL" : "INICIAR SESIÓN"}
              </span>
            </Button>
          </Link>
        </div>

      </div>

{/* MENÚ DESPLEGABLE MÓVIL (Dropdown) */}
{bolIsMobileMenuOpen && (
  <>
    {/* Overlay para cerrar al tocar fuera */}
    <div
      className="lg:hidden fixed inset-0 z-40 bg-black/20"
      onClick={() => setBolIsMobileMenuOpen(false)}
    />

    {/* Panel del menú */}
    <div
      id="mobile-header-menu"
      ref={refMobileMenuPanel}
      className="lg:hidden absolute top-16 left-0 w-full bg-slate-800 text-white shadow-xl flex flex-col px-8 py-6 gap-6 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Iniciar sesión / Mi Perfil */}
      <Link 
        href={objProps.bolIsLoggedIn ? "/perfil" : "/login"}
        onClick={() => setBolIsMobileMenuOpen(false)}
        className="flex items-center gap-4 border-b border-slate-700 pb-4"
      >
        <img
           src="https://res.cloudinary.com/drjab27cq/image/upload/v1774550604/icon_profile_jxubhg.png"
           alt="Perfil"
           className="w-10 h-10 rounded-full object-contain"
        />
        <span className="text-xl font-normal uppercase">
          {objProps.bolIsLoggedIn ? "MI PERFIL" : "INICIAR SESIÓN"}
        </span>
      </Link>

      {/* Notificaciones */}
      <button 
        className="flex items-center gap-4 text-left border-b border-slate-700 pb-4"
        onClick={() => {
          if (!objProps.bolIsLoggedIn) {
            alert('Debe iniciar sesión primero');
          }
          setBolIsMobileMenuOpen(false);
        }}
      >
         <img
             src="https://res.cloudinary.com/drjab27cq/image/upload/v1774551632/notification_dchcxp.png"
             alt="Notificaciones"
             className="w-6 h-6 object-contain"
          />
        <span className="text-xl font-normal">NOTIFICACIONES</span>
      </button>

      <Link href={objProps.bolIsLoggedIn ? "/publicacion" : "/login"} onClick={() => setBolIsMobileMenuOpen(false)}>
        <Button className="w-full text-xl h-12 font-normal bg-white text-slate-900 hover:bg-slate-200 mt-2">
          PUBLICAR INMUEBLE
        </Button>
      </Link>

      <Link href="/busqueda?strOperacion=compra" onClick={() => setBolIsMobileMenuOpen(false)} className="text-xl font-normal hover:text-slate-300 transition-colors">
        COMPRA
      </Link>

      <Link href="/busqueda?strOperacion=alquiler" onClick={() => setBolIsMobileMenuOpen(false)} className="text-xl font-normal hover:text-slate-300 transition-colors">
        ALQUILER
      </Link>

      <Link href="/busqueda?strOperacion=anticretico" onClick={() => setBolIsMobileMenuOpen(false)} className="text-xl font-normal hover:text-slate-300 transition-colors">
        ANTICRÉTICO
      </Link>

      <Link href="/planes" onClick={() => setBolIsMobileMenuOpen(false)} className="text-xl font-normal hover:text-slate-300 transition-colors border-t border-slate-700 pt-6 mt-2">
        PLANES DE PUBLICACIÓN
      </Link>
    </div>
  </>
)}
    </header>
  );
};
