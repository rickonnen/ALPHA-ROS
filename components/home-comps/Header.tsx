"use client";

import { useState } from 'react';
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

  // Variable del Logo (Reutilizable tanto en PC como en Celular)
  const btnLogoProbol = (
    <Link 
      href="/" 
      className="flex items-center justify-center w-32 h-10 bg-slate-300 rounded-md hover:bg-slate-400 transition-colors"
      title="Ir al inicio"
    >
       <span className="text-sm font-bold text-slate-600">LOGO PROBOL</span>
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
        <div className="flex lg:hidden">
          <Button 
            variant="ghost" 
            className="p-2" 
            onClick={() => setBolIsMobileMenuOpen(!bolIsMobileMenuOpen)}
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
          <Link href="/planes" className="text-xl font-semibold hover:text-primary transition-colors">
            PLANES DE PUBLICACIÓN
          </Link>
        </div>

        {/* LADO DERECHO: Navegación Completa */}
        <div className="hidden lg:flex flex-row items-center gap-6">
          <Link href="/busqueda?strOperacion=compra" className="text-xl font-semibold hover:text-primary transition-colors">COMPRA</Link>
          <Link href="/busqueda?strOperacion=alquiler" className="text-xl font-semibold hover:text-primary transition-colors">ALQUILER</Link>
          <Link href="/busqueda?strOperacion=anticretico" className="text-xl font-semibold hover:text-primary transition-colors">ANTICRÉTICO</Link>

          <Link href={objProps.bolIsLoggedIn ? "/publicacion" : "/login"}>
            <Button className="text-xl px-6 h-10 font-semibold bg-secondary hover:bg-secondary/90 text-white transition-colors">PUBLICAR</Button>
          </Link>

          <button 
            className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center hover:bg-slate-300 transition-colors"
            onClick={() => !objProps.bolIsLoggedIn && alert('Debe iniciar sesión primero')}
            title="Notificaciones"
          >
            <span className="text-xl opacity-70">🔔</span>
          </button>

          <Link href={objProps.bolIsLoggedIn ? "/perfil" : "/login"}>
            <Button variant="ghost" className="flex items-center gap-3 h-10 px-2 hover:bg-slate-100 transition-colors bg-slate-200 rounded-full pr-4">
              <div className="w-8 h-8 bg-slate-300 rounded-full"></div>
              <span className="text-sm font-semibold uppercase text-slate-700">
                {objProps.bolIsLoggedIn ? "MI PERFIL" : "INICIAR SESIÓN"}
              </span>
            </Button>
          </Link>
        </div>

      </div>

      {/* MENÚ DESPLEGABLE MÓVIL (Dropdown) */}
      {bolIsMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-slate-800 text-white shadow-xl flex flex-col px-8 py-6 gap-6 z-50">
          
          {/* Iniciar sesión / Mi Perfil */}
          <Link 
            href={objProps.bolIsLoggedIn ? "/perfil" : "/login"}
            onClick={() => setBolIsMobileMenuOpen(false)}
            className="flex items-center gap-4 border-b border-slate-700 pb-4"
          >
            <div className="w-10 h-10 bg-slate-600 rounded-full"></div>
            <span className="text-xl font-semibold uppercase">
              {objProps.bolIsLoggedIn ? "MI PERFIL" : "INICIAR SESIÓN"}
            </span>
          </Link>

          {/* Notificaciones */}
          <button 
            className="flex items-center gap-4 text-left border-b border-slate-700 pb-4"
            onClick={() => {
              !objProps.bolIsLoggedIn && alert('Debe iniciar sesión primero');
              setBolIsMobileMenuOpen(false);
            }}
          >
            <span className="text-2xl">🔔</span>
            <span className="text-xl font-semibold">NOTIFICACIONES</span>
          </button>

          <Link href={objProps.bolIsLoggedIn ? "/publicacion" : "/login"} onClick={() => setBolIsMobileMenuOpen(false)}>
            <Button className="w-full text-xl h-12 font-bold bg-white text-slate-900 hover:bg-slate-200 mt-2">
              PUBLICAR INMUEBLE
            </Button>
          </Link>

          <Link href="/busqueda?strOperacion=compra" onClick={() => setBolIsMobileMenuOpen(false)} className="text-xl font-semibold hover:text-slate-300 transition-colors">
            COMPRA
          </Link>

          <Link href="/busqueda?strOperacion=alquiler" onClick={() => setBolIsMobileMenuOpen(false)} className="text-xl font-semibold hover:text-slate-300 transition-colors">
            ALQUILER
          </Link>

          <Link href="/busqueda?strOperacion=anticretico" onClick={() => setBolIsMobileMenuOpen(false)} className="text-xl font-semibold hover:text-slate-300 transition-colors">
            ANTICRÉTICO
          </Link>

          <Link href="/planes" onClick={() => setBolIsMobileMenuOpen(false)} className="text-xl font-semibold hover:text-slate-300 transition-colors border-t border-slate-700 pt-6 mt-2">
            PLANES DE PUBLICACIÓN
          </Link>

        </div>
      )}
    </header>
  );
};