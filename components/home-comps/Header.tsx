"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useScrollDirection } from '../hooks/useScrollDirection';

interface HeaderProps {
  bolIsLoggedIn: boolean;
  strUserName?: string;
}

/**
 * Dev: Rodrigo Zarate     Fecha: 24/03/2026
 * Funcionalidad: Renderizar el encabezado principal con flujos horizontales en ambos extremos, utilizando tipografía Geist.
 * @param {object} objProps Propiedades que incluyen el estado de sesión del usuario.
 * @return {object} Componente visual Header para Next.js.
 */
export const Header = (objProps: HeaderProps) => {
  const bolHideHeader = useScrollDirection();

  // Variable del Logo
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
      
      {/* CONTENEDOR PRINCIPAL: px-[40px] asegura la distancia de ambos bordes de pantalla */}
      <div className="w-full px-[40px] h-16 flex items-center justify-between">
        
        {/* LADO IZQUIERDO */}
        <div className="flex flex-row items-center gap-6">
          {btnLogoProbol}
          <Link href="/planes" className="text-xl font-semibold hover:text-primary transition-colors">
            PLANES DE PUBLICACIÓN
          </Link>
        </div>

        {/* LADO DERECHO */}
        {/* Todo el bloque derecho dentro de este único div flex */}
        <div className="hidden lg:flex flex-row items-center gap-6">
          
          <Link href="/busqueda?strOperacion=compra" className="text-xl font-semibold hover:text-primary transition-colors">COMPRA</Link>
          <Link href="/busqueda?strOperacion=alquiler" className="text-xl font-semibold hover:text-primary transition-colors">ALQUILER</Link>
          <Link href="/busqueda?strOperacion=anticretico" className="text-xl font-semibold hover:text-primary transition-colors">ANTICRÉTICO</Link>

          <Link href={objProps.bolIsLoggedIn ? "/publicacion" : "/login"}>
            <Button className="text-xl px-6 h-10 font-semibold bg-slate-800 hover:bg-slate-700 text-white">PUBLICAR</Button>
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
    </header>
  );
};