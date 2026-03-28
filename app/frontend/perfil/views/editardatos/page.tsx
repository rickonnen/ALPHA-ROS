/** *Dev: Alvarado Alisson Dalet - xdev/sow-AlissonA
 * Fecha: 26/03/2026
 * Funcionalidad: Editar datos de el usuario desde la vista de mi perfil
 * @param {String} nombres - Para editar datos
 * @param {String} apellidos - Para editar datos
 * @param {String} url_foto_perfil - Para editar datos
 * @param {String} direccion - Para editar datos
 * @return {Object} - Datos modificados en la base de datos
 *    
*/ 
/* Dev: Alvarado Alisson Dalet - xdev/sow-AlissonA
    Fecha: 27/03/2026
    Funcionalidad: Adaptación Mobile y Cambio a Azul Primary
*/
"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// feat: agregado Menu, X, LogOut para el menu hamburguesa mobile
import { Home, Menu, X, LogOut } from "lucide-react";
import PerfilView from "../perfil-view";

const HeaderMock = () => (
  <header className="w-full h-[70px] bg-white border-b flex items-center px-6 md:px-8 text-slate-400 italic sticky top-0 z-50 justify-between">
    <span className="text-sm md:text-base">[ Componente Header - Equipo Externo ]</span>
    <Button variant="ghost" asChild className="hidden md:flex">
      <Link href="/">
        <Home className="mr-2 h-4 w-4" /> Inicio
      </Link>
    </Button>
  </header>
);

const USER_MOCK = {
  usuario: "ArvirzuzztS",
  nombres: "David",
  apellidos: "Chavez",
  direccion: "Av. Principal lado del vecino #123, Cochabamba",
  url_foto: "https://github.com/shadcn.png",
  email: "david.chavez@email.com",
};

function EditarPerfil({ user }: { user: typeof USER_MOCK }) {
  return (
    <Card className="border-none bg-transparent shadow-none text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold border-b border-white/20 pb-2 tracking-tight">
          Editar Perfil
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 flex flex-col gap-6">
        <p className="text-xs font-black tracking-widest text-white/50 uppercase -mt-2">
          Seguridad › Editar Perfil
        </p>
        <div>
          <p className="text-xs font-black tracking-widest text-white/50 uppercase mb-4">
            Foto de perfil
          </p>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.url_foto} alt={user.nombres} />
              <AvatarFallback className="text-xl font-black bg-white/20 text-white">
                {user.nombres[0]}{user.apellidos[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white text-xs font-black tracking-widest"
              >
                Cambiar foto
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border-red-300/50 text-red-300 hover:bg-red-400/10 hover:text-red-200 text-xs font-black tracking-widest"
              >
                Eliminar foto
              </Button>
            </div>
          </div>
        </div>
        <Separator className="bg-white/20" />
        <div>
          <p className="text-xs font-black tracking-widest text-white/50 uppercase mb-5">
            Datos personales
          </p>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombres" className="text-xs font-black tracking-widest text-white/60 uppercase">
                  Nombre
                </Label>
                <Input
                  id="nombres"
                  defaultValue={user.nombres}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/30"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="apellidos" className="text-xs font-black tracking-widest text-white/60 uppercase">
                  Apellido
                </Label>
                <Input
                  id="apellidos"
                  defaultValue={user.apellidos}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="direccion" className="text-xs font-black tracking-widest text-white/60 uppercase">
                  Dirección
                </Label>
                <Input
                  id="direccion"
                  defaultValue={user.direccion}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/30"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="usuario" className="text-xs font-black tracking-widest text-white/60 uppercase">
                  Usuario
                </Label>
                <Badge className="text-xs font-black tracking-widest bg-white/10 text-white/40 border-white/20 hover:bg-white/10">
                  No editable
                </Badge>
              </div>
              <Input
                id="usuario"
                defaultValue={user.usuario}
                disabled
                className="bg-white/5 border-white/10 text-white/40 cursor-not-allowed"
              />
            </div>
          </div>
        </div>
        <Separator className="bg-white/20" />
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white text-xs font-black tracking-widest"
          >
            Cancelar
          </Button>
          <Button className="bg-white text-[var(--primary)] font-black tracking-widest text-xs hover:bg-white/90">
            Guardar cambios
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EditarDatosView() {
  const [view, setView] = useState("seguridad");
  // feat: estado para controlar apertura del menu hamburguesa en mobile
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const VIEWS_COMPONENTS: Record<string, React.ReactNode> = {
    perfil:        <PerfilView usuario={USER_MOCK} />,
    seguridad:     <EditarPerfil user={USER_MOCK} />,
    publicaciones: <div className="p-8 text-white">Vista de Publicaciones - Equipo C</div>,
    favoritos:     <div className="p-8 text-white">Vista de Favoritos - Equipo D</div>,
    historial:     <div className="p-8 text-white">Vista de Historial - Equipo E</div>,
  };

  const NAV_ITEMS = [
    { id: "perfil",        name: "MI PERFIL" },
    { id: "seguridad",     name: "SEGURIDAD" },
    { id: "publicaciones", name: "PUBLICACIONES" },
    { id: "favoritos",     name: "FAVORITOS" },
    { id: "historial",     name: "HISTORIAL" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <HeaderMock />
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* foto + nombre */}
        <div id="info" className="flex items-center justify-between gap-6 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <img
              src={USER_MOCK.url_foto}
              alt="User"
              className="w-20 h-20 md:w-40 md:h-40 rounded-full border-4 border-[var(--primary)] shadow-md"
            />
            <div className="text-center md:text-left">
              <h1 className="font-[900] text-2xl md:text-5xl text-[var(--foreground)] tracking-tight">
                {USER_MOCK.nombres} {USER_MOCK.apellidos}
              </h1>
              <h2 className="text-slate-500 text-sm md:text-2xl font-medium">{USER_MOCK.email}</h2>
            </div>
          </div>

          {/* Boton hamburguesa - solo visible en mobile */}
          <Button
            variant="outline"
            size="icon"
            className="md:hidden border-[var(--primary)] text-[var(--primary)]"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Overlay del menu hamburguesa mobile */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-[100] bg-black/50 md:hidden animate-in fade-in duration-300">
            <div className="absolute right-0 top-0 h-full w-64 bg-white p-6 shadow-xl animate-in slide-in-from-right duration-300">
              <div className="flex justify-between items-center mb-8">
                <span className="font-black text-[var(--primary)] text-xs tracking-widest">MENÚ</span>
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <nav className="flex flex-col gap-2">
                {NAV_ITEMS.map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => { setView(btn.id); setIsMenuOpen(false); }}
                    className={`text-left px-4 py-3 rounded-lg text-xs font-bold transition-colors ${
                      view === btn.id
                        ? "bg-[var(--primary)] text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {btn.name}
                  </button>
                ))}
                <hr className="my-4" />
                <button className="flex items-center gap-2 text-red-500 px-4 py-3 text-xs font-bold hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut className="h-4 w-4" /> CERRAR SESIÓN
                </button>
              </nav>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-0 items-stretch">
          {/* Sidebar - solo visible en desktop */}
          <nav id="btns" className="hidden md:flex flex-col w-64 z-10 relative">
            {NAV_ITEMS.map((btn) => {
              const isSelected = view === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => setView(btn.id)}
                  className={`text-left px-6 py-4 transition-all duration-300 text-xs font-black tracking-widest outline-none ${
                    isSelected
                      ? "bg-[var(--primary)] text-white md:rounded-l-2xl md:-mr-[1px] shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.2)] z-20"
                      : "bg-white text-slate-500 hover:bg-slate-50 hover:text-[var(--primary)] hover:pl-8 border-transparent z-10"
                  }`}
                >
                  {btn.name}
                </button>
              );
            })}
          </nav>

          {/* Panel dinámico */}
          <div
            id="dinamic"
            className="flex-grow bg-[var(--primary)] text-white md:rounded-r-2xl md:rounded-bl-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            {VIEWS_COMPONENTS[view] ?? VIEWS_COMPONENTS.perfil}
          </div>
        </div>
      </div>
    </div>
  );
}