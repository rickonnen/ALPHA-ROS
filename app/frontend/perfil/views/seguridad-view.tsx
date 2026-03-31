/* Dev: Camila - xdev/sow-camila
    Fecha: 28/03/2026
    Funcionalidad: Vista de Configuración de Seguridad (HU: MP002)
*/
"use client";
import { useState, useEffect } from "react";
import TelefonosView from "./telefono-view";
import ChangePasswordForm from "./contrasena-view";
import CambiarCorreoView from "./cambiar-correo/cambiar-correo";
import ConfirmarCorreoView from "./cambiar-correo/confirmar-correo";
import EditProfile from "./editardatos/editar-datos";

interface SeguridadProps {
  id_usuario: string;
  email: string;
  telefonos: string[];
  onSuccess: () => void;
};
export default function SeguridadView({id_usuario, email, telefonos, onSuccess}: SeguridadProps) {
  const [subView, setSubView] = useState("menu");
  const [strNuevoEmailPendiente, setStrNuevoEmailPendiente] = useState("");
  const [objUsuario, setObjUsuario] = useState<any>(null);

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const res = await fetch(`/backend/perfil/getUsuario?id_usuario=${id_usuario}`);
        const json = await res.json();
        setObjUsuario(json.data);
      } catch {
        console.error("Error al cargar usuario");
      }
    };
    fetchUsuario();
  }, [id_usuario]);

  const VIEWS: Record<string, React.ReactNode> = {
    menu: (
      <div className="space-y-4">
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
        <button
          onClick={() => setSubView("correo")}
          className="w-full flex justify-between items-center bg-white/10 p-4 rounded-xl hover:bg-white/20 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300"
        >
          <div className="text-left">
            <p className="font-semibold">Cambiar Correo</p>
            <p className="text-sm text-gray-300">{email}</p>
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
              {telefonos.length > 0 ? telefonos.join(' · ') : 'Sin teléfonos'}
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

    perfil: objUsuario ? (
      <EditProfile
        usuario={objUsuario}
        onGuardar={(objDatosActualizados) => {
          setObjUsuario((prev: any) => ({ ...prev, ...objDatosActualizados }));
          setSubView("menu");
        }}
        onCancelar={() => setSubView("menu")}
      />
    ) : null,

    password: (
      <ChangePasswordForm 
        id_usuario={id_usuario} 
        email={email} 
        onCancel={() => setSubView("menu")}
        onSuccess={onSuccess}
      />
    ),

    correo: (
      <CambiarCorreoView
        onBack={() => setSubView("menu")}
        onContinue={(nuevoEmail) => {
          setStrNuevoEmailPendiente(nuevoEmail);
          setSubView("confirmar-correo");
        }}
        email_actual={email}
        id_usuario={id_usuario}
      />
    ),
    "confirmar-correo": (
      <ConfirmarCorreoView
        id_usuario={id_usuario}
        nuevo_email={strNuevoEmailPendiente}
        onBack={() => setSubView("correo")}
      />
    ),

  };

  return (
    <div className={`p-8 text-white ${subView === "menu" ? "space-y-6" : "space-y-0"}`}>
      {subView === "menu" && <h1 className="text-2xl font-bold">Seguridad</h1>}
      {VIEWS[subView] || VIEWS.menu}
    </div>
  );
}