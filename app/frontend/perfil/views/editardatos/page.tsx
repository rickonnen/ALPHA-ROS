/** *Dev: Alvarado Alisson Dalet
 * Fecha: 26/03/2026
 * Funcionalidad: Editar datos de el usuario desde la vista de mi perfil
 * @param {String} nombres - Para editar datos
 * @param {String} apellidos - Para editar datos
 * @param {String} url_foto_perfil - Para editar datos
 * @param {String} direccion - Para editar datos
 * @return {Object} - Datos modificados en la base de datos
 *    
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
import { Home } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PerfilView from "../perfil-view";

// Mock para el header
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

// Usuario mockeado
const USER_MOCK = {
  usuario: "ArvirzuzztS",
  nombres: "David",
  apellidos: "Chavez",
  direccion: "Av. Principal lado del vecino #123, Cochabamba",
  url_foto: "https://github.com/shadcn.png",
  email: "david.chavez@email.com",
  telefono1: "+591 71234567",
  telefono2: "+591 76543210",
};

// Formulario para editar datos 
function EditarPerfil({ user }: { user: typeof USER_MOCK }) {
  return (
    <Card className="border-none bg-transparent shadow-none text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold border-b border-white/20 pb-2 tracking-tight">
          Editar Perfil
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6 flex flex-col gap-6">

        {/* Breadcrumb */}
        <p className="text-xs font-black tracking-widest text-white/50 uppercase -mt-2">
          Seguridad › Editar Perfil
        </p>

        {/* Foto de perfil */}
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

        {/* Datos personales */}
        <div>
          <p className="text-xs font-black tracking-widest text-white/50 uppercase mb-5">
            Datos personales
          </p>

          <div className="space-y-5">

            {/* Nombre y Apellido */}
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

            {/* Dirección y País */}
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

            {/* Usuario (no editable) */}
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

        {/* Acciones */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white text-xs font-black tracking-widest"
          >
            Cancelar
          </Button>
          <Button className="bg-white text-[var(--secondary)] font-black tracking-widest text-xs hover:bg-white/90">
            Guardar cambios
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}

// Page principal
export default function EditarDatosView() {
  const [view, setView] = useState("seguridad");

  const VIEWS_COMPONENTS: Record<string, React.ReactNode> = {
    perfil:        <PerfilView user={USER_MOCK} />,
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
        {/* foto */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          <img
            src={USER_MOCK.url_foto}
            alt="User"
            className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[var(--secondary)] shadow-md"
          />
          <div className="text-center md:text-left">
            <h1 className="font-[900] text-4xl md:text-5xl text-[var(--foreground)] tracking-tight">
              {USER_MOCK.nombres} {USER_MOCK.apellidos}
            </h1>
            <h2 className="text-slate-500 text-xl md:text-2xl font-medium">{USER_MOCK.email}</h2>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-0 items-stretch">

          {/* Sidebar */}
          <nav className="flex flex-col w-full md:w-64 z-10 relative">
            {NAV_ITEMS.map((btn) => {
              const isSelected = view === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => setView(btn.id)}
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

          {/* Panel dinámico */}
          <div
            className="flex-grow bg-[var(--secondary)] text-white md:rounded-r-2xl md:rounded-bl-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            {VIEWS_COMPONENTS[view] ?? VIEWS_COMPONENTS.perfil}
          </div>

        </div>
      </div>
    </div>
  );
}