/* Dev: Camila - xdev/sow-camila
    Fecha: 28/03/2026
    Funcionalidad: Vista de Configuración de Seguridad (HU: MP002)*/
"use client";

import { useState } from "react";

// interface 
export interface SeguridadProps {
  id_usuario?: string;
  email_actual?: string;
  usuario?: any;
  telefonos?: string[];
}

export default function SeguridadView({ id_usuario, email_actual, usuario, telefonos = [] }: SeguridadProps) {
  const [subView, setSubView] = useState("menu");

  const VIEWS: Record<string, React.ReactNode> = {
    menu: (
      <div className="space-y-4">
        {/* editar perfil */}
        <button
          onClick={() => setSubView("perfil")}
          className="w-full flex justify-between items-center bg-white/10 p-4 rounded-xl hover:bg-white/20 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300"
        >
          <div className="text-left">
            <p className="font-semibold">Editar Perfil</p>
            <p className="text-sm text-gray-300">Cambiar nombre, foto y datos personales</p>
          </div>
          <span className="text-gray-400">›</span>
        </button>

        {/* password */}
        <button
          onClick={() => setSubView("password")}
          className="w-full flex justify-between items-center bg-white/10 p-4 rounded-xl hover:bg-white/20 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300"
        >
          <div className="text-left">
            <p className="font-semibold">Cambiar Password</p>
            <p className="text-sm text-gray-300">********</p>
          </div>
          <span className="text-gray-400">›</span>
        </button>

        {/* correo */}
        <button
          onClick={() => setSubView("correo")}
          className="w-full flex justify-between items-center bg-white/10 p-4 rounded-xl hover:bg-white/20 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300"
        >
          <div className="text-left">
            <p className="font-semibold">Cambiar Correo</p>
            <p className="text-sm text-gray-300">{usuario?.email || email_actual || "gmail@gmail.com"}</p>
          </div>
          <span className="text-gray-400">›</span>
        </button>

        {/* telefonos */}
        <button
          onClick={() => setSubView("telefonos")}
          className="w-full flex justify-between items-center bg-white/10 p-4 rounded-xl hover:bg-white/20 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300"
        >
          <div className="text-left">
            <p className="font-semibold">Gestionar Teléfonos</p>
            <p className="text-sm text-gray-300">
              {telefonos.length > 0 ? telefonos.join(" - ") : "+591 70054545"}
            </p>
          </div>
          <span className="text-gray-400">›</span>
        </button>
      </div>
    ),

    perfil: (
      <div>
        <button onClick={() => setSubView("menu")} className="text-gray-400 hover:text-white transition-colors">
          ← Volver
        </button>
        <p className="mt-4">Vista Editar Perfil (Cargando)...</p>
      </div>
    ),

    password: (
      <div>
        <button onClick={() => setSubView("menu")} className="text-gray-400 hover:text-white transition-colors">
          ← Volver
        </button>
        <p className="mt-4">Vista Password (Cargando)...</p>
      </div>
    ),

    correo: (
      <div>
        <button onClick={() => setSubView("menu")} className="text-gray-400 hover:text-white transition-colors">
          ← Volver2222
        </button>
        <p className="mt-4">Vista Correo (Cargando)...</p>
      </div>
    ),

    telefonos: (
      <div>
        <button onClick={() => setSubView("menu")} className="text-gray-400 hover:text-white transition-colors">
          ← Volver
        </button>
        <p className="mt-4">Vista Teléfonos (Cargando)...</p>
      </div>
    ),
  };

  return (
    <div className="p-8 space-y-6 text-white">
      {subView === "menu" && <h1 className="text-2xl font-bold">Seguridad</h1>}
      {VIEWS[subView] || VIEWS.menu}
    </div>
  );
}