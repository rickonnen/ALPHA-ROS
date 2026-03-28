"use client";

import { useState } from "react";
import TelefonosView from "./telefono-view";
import CambiarCorreoView from "./cambiar-correo/cambiar-correo";
// IMPORT COMENTADO TEMPORALMENTE PARA QUE NO FALLE:

interface SeguridadProps{
  id_usuario: string;
  email: string;
  telefonos: string[];
};

export default function SeguridadView({id_usuario, email, telefonos}: SeguridadProps) {
  const [subView, setSubView] = useState("menu");

  const VIEWS: Record<string, React.ReactNode> = {
    menu: (
      <div className="space-y-4">
        <button
          onClick={() => setSubView("perfil")}
          className="w-full flex justify-between items-center bg-white/10 p-4 rounded-xl hover:bg-white/20 transition"
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
          className="w-full flex justify-between items-center bg-white/10 p-4 rounded-xl hover:bg-white/20 transition"
        >
          <div className="text-left">
            <p className="font-semibold">Cambiar Password</p>
            <p className="text-sm text-gray-300">**</p>
          </div>
          <span className="text-gray-400">›</span>
        </button>

        <button
          onClick={() => setSubView("correo")}
          className="w-full flex justify-between items-center bg-white/10 p-4 rounded-xl hover:bg-white/20 transition"
        >
          <div className="text-left">
            <p className="font-semibold">Cambiar Correo</p>
            <p className="text-sm text-gray-300">gmail@gmail.com</p>
          </div>
          <span className="text-gray-400">›</span>
        </button>

        <button
          onClick={() => setSubView("telefonos")}
          className="w-full flex justify-between items-center bg-white/10 p-4 rounded-xl hover:bg-white/20 transition"
        >
          <div className="text-left">
            <p className="font-semibold">Gestionar Teléfonos</p>
            <p className="text-sm text-gray-300">
              +591 70054545  +591 54454444487
            </p>
          </div>
          <span className="text-gray-400">›</span>
        </button>
      </div>
    ),


    telefonos: (
      <TelefonosView
        telefonos={telefonos}
        id_usuario={id_usuario}
        onBack={() => setSubView("menu")} 
      />
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
        <CambiarCorreoView
          onBack={() => setSubView("menu")}
          email_actual={email}
          id_usuario={id_usuario}
        />
      </div>
    ),
  };

  return (
    <div
      className={`p-8 text-white ${subView === "menu" ? "space-y-6" : "space-y-0"}`}
    >
      {subView === "menu" && <h1 className="text-2xl font-bold">Seguridad</h1>}
      {VIEWS[subView] || VIEWS.menu}
    </div>
  );
}