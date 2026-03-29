/*  Dev: David Chavez Totora - xdev/davidc 
    Fecha: 25/03/2026
    Funcionalidad: se llega desde el boton del header de home
      - @param {PerfilPage()} - ubicacion default de Mi Perfil
      - @return {perfil-view} - muestra los datos del usuario 
*/
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

import PerfilView from "./views/perfil-view";
import HistorialView from "./views/historial-view";

const HeaderMock = () => (
  <header className="w-full h-[70px] bg-white border-b flex items-center px-8 text-slate-400 italic sticky top-0 z-50 justify-between">
    <span>[ Componente Header - Equipo Externo ]</span>
    <Button variant="ghost" asChild>
      <Link href="/">
        <Home className="mr-2 h-4 w-4" /> Inicio
      </Link>
    </Button>
  </header>
);

export default function PerfilPage() {
  const [view, setView] = useState("perfil");

  const user = {
    usuario: "ArvirzuzztS",
    nombres: "David",
    apellidos: "Chavez",
    email: "virzuzz12345@gmail.com",
    direccion: "Av. Principal lado del vecino #123, Cochabamba",
    url_foto: "https://github.com/shadcn.png",
    telefono1: "+591 67231718",
    telefono2: "+591 0000000",
    telefono3: "No registrado"
  };

  // ##################################################################
  // aqui sustituyen como hice con sus componentes de views
  const VIEWS_COMPONENTS: Record<string, React.ReactNode> = {
    perfil: <PerfilView user={user} />,
    seguridad: <div className="p-8">Vista de Seguridad - Equipo B</div>, 
    publicaciones: <div className="p-8">Vista de Publicaciones - Equipo C</div>,
    favoritos: <div className="p-8">Vista de Favoritos - Equipo D</div>,
    historial: <HistorialView />,
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <HeaderMock />

      <main className="mx-auto max-w-5xl px-4 py-8">
        
        <div id="info" className="flex flex-col md:flex-row items-center gap-6 mb-8">
          <img 
            src={user.url_foto} 
            alt="User" 
            className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[var(--secondary)] shadow-md"
          />
          <div className="text-center md:text-left">
            <h1 className="font-[900] text-4xl md:text-5xl text-[var(--foreground)] tracking-tight">
              {user.nombres} {user.apellidos}
            </h1>
            <h2 className="text-slate-500 text-xl md:text-2xl font-medium">{user.email}</h2>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-0 items-stretch">
          <nav id="btns" className="flex flex-col w-full md:w-64 z-50 relative">
            {[
              { id: "perfil", name: "MI PERFIL" },
              { id: "seguridad", name: "SEGURIDAD" },
              { id: "publicaciones", name: "PUBLICACIONES" },
              { id: "favoritos", name: "FAVORITOS" },
              { id: "historial", name: "HISTORIAL" },
            ].map((btn) => {
              const isSelected = view === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => {
                    console.log("CLICK:", btn.id);
                    setView(btn.id);
                  }}
                  className={`text-left px-6 py-4 transition-all duration-300 text-xs font-black tracking-widest outline-none ${
                    isSelected 
                      ? "bg-[var(--secondary)] text-white md:rounded-l-2xl md:-mr-[1px] shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.2)] z-20" 
                      : "bg-white text-slate-500 hover:bg-slate-50 hover:text-[var(--secondary)] hover:pl-8 border-transparent z-10"
                  }`}
                >
                  {btn.name}
                </button>
              );
            })}
          </nav>
          
          <div id="dinamic" 
            className="flex-grow bg-[var(--secondary)] text-white md:rounded-r-2xl md:rounded-bl-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {VIEWS_COMPONENTS[view] || VIEWS_COMPONENTS.perfil}
          </div>

        </div>
      </main>
    </div>
  );
}