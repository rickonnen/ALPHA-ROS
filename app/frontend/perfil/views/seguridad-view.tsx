"use client";

import { useState } from "react";
// IMPORT COMENTADO TEMPORALMENTE PARA QUE NO FALLE:
// import TelefonosView from "./telefono-view";

export default function SeguridadView({ usuario, telefonos }: { usuario?: any, telefonos?: string[] }) {
  const [subView, setSubView] = useState("menu");

  const VIEWS: Record<string, React.ReactNode> = {

    menu: (
      <div className="space-y-4">
        <button
          onClick={() => setSubView("perfil")}
          className="w-full flex justify-between items-center bg-white/10 p-4 rounded-xl hover:bg-white/20 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300"
        >
          <div className="text-left">
            <p className="font-semibold">Editar Perfil</p>
            <p className="text-sm text-gray-300">
              Cambiar nombre, foto y datos personales
            </p>
          </div>
          <span className="text-gray-400">›</span>
        </button>

        <button
          onClick={() => setSubView("password")}
          className="w-full flex justify-between items-center bg-white/10 p-4 rounded-xl hover:bg-white/20 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300"
        >
          <div className="text-left">
            <p className="font-semibold">Cambiar Password</p>
            <p className="text-sm text-gray-300">**</p>
          </div>
          <span className="text-gray-400">›</span>
        </button>

        <button
          onClick={() => setSubView("correo")}
          className="w-full flex justify-between items-center bg-white/10 p-4 rounded-xl hover:bg-white/20 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300"
        >
          <div className="text-left">
            <p className="font-semibold">Cambiar Correo</p>
            <p className="text-sm text-gray-300">{usuario?.email || "gmail@gmail.com"}</p>
          </div>
          <span className="text-gray-400">›</span>
        </button>

        <button
          onClick={() => setSubView("telefonos")}
          className="w-full flex justify-between items-center bg-white/10 p-4 rounded-xl hover:bg-white/20 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300"
        >
          <div className="text-left">
            <p className="font-semibold">Gestionar Teléfonos</p>
            <p className="text-sm text-gray-300">
              {telefonos && telefonos.length > 0 ? telefonos.join(" - ") : "+591 70054545  +591 54454444487"}
            </p>
          </div>
          <span className="text-gray-400">›</span>
        </button>
      </div>
    ),

    // VISTA TEMPORAL DE TELÉFONOS
    telefonos: (
      <div>
        <button onClick={() => setSubView("menu")}>← Volver</button>
        <p className="mt-4">Vista Teléfonos (Archivo pendiente por crear)...</p>
      </div>
    ),

    perfil: (
      <div>
        <button onClick={() => setSubView("menu")}>← Volver</button>
        <p className="mt-4">Vista Editar Perfil...</p>
      </div>
    ),

    password: (
      <div>
        <button onClick={() => setSubView("menu")}>← Volver</button>
        <p className="mt-4">Vista Password...</p>
      </div>
    ),

    correo: (
      <div>
        <button onClick={() => setSubView("menu")}>← Volver2222</button>
        <p className="mt-4">Vista Correo...</p>
      </div>
    ),
  };

  return (
    <div className="p-8 space-y-6 text-white">
      <h1 className="text-2xl font-bold">Seguridad</h1>
      {VIEWS[subView] || VIEWS.menu}
    </div>
  );
}