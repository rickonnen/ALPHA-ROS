/* Dev: Camila Magne Hinojosa - xdev/sow-camila
    Fecha: 28/03/2026
    Funcionalidad: Vista de Configuración de Seguridad (HU: MP002)
*/
/* Dev: Alvarado Alisson Dalet - sow-alissona
    Fecha: 04/04/2026
    Fix: Agrega prop onPerfilActualizado para notificar al padre (PerfilPage)
         que debe re-fetchear el usuario y actualizar el header tras guardar
         cambios en editar perfil
*/
/* Dev: Camila Magne Hinojosa - xdev/sow-camilaM
   Fecha: 06/04/2026
   Fix: Corrección de defecto, ajustando la cantidad (4) y tamaño de asteriscos en la sección password según mockup oficial.
*/
/* Dev: Camila Magne Hinojosa - xdev/sow-camilaM
   Fecha: 07/04/2026
   Style: Sincronización de animaciones de vistas con perfil-view y agregado de línea separadora en el título principal.
*/
/* Dev: Camila Magne Hinojosa - xdev/sow-camilaM
   Fecha: 09/04/2026
   Fix: Resolución del defecto de navegación por teclado ilógica. Restauración de corrección visual de la contraseña (****).
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
  onTelefonosChange: (nuevosTelefonos: string[]) => void;
  onPerfilActualizado: () => void;
}

export default function SeguridadView({ id_usuario, email, telefonos, onSuccess, onTelefonosChange, onPerfilActualizado }: SeguridadProps) {
  const [subView, setSubView] = useState("menu");
  const [strNuevoEmailPendiente, setStrNuevoEmailPendiente] = useState("");
  const [objOtpMeta, setObjOtpMeta] = useState<{
    expiresInSec?: number;
    resendAfterSec?: number;
  }>({});
  const [objUsuario, setObjUsuario] = useState<any>(null);

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const res = await fetch(`/api/perfil/getUsuario?id_usuario=${id_usuario}`);
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
          autoFocus
          onClick={() => setSubView("perfil")}
          className="w-full flex justify-between items-center bg-white/10 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 hover:bg-white/20 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300"
        >
          <div className="text-left">
            <p className="font-semibold">Editar Perfil</p>
            <p className="text-sm text-gray-300">Cambiar nombre, foto y datos personales</p>
          </div>
          <span className="text-gray-400">›</span>
        </button>
        <button
          onClick={() => setSubView("password")}
          className="w-full flex justify-between items-center bg-white/10 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 hover:bg-white/20 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300"
        >
          <div className="text-left">
            <p className="font-semibold">Cambiar Contraseña</p>
            <p className="text-lg text-gray-300 tracking-widest mt-1">****</p>
          </div>
          <span className="text-gray-400">›</span>
        </button>
        <button
          onClick={() => setSubView("correo")}
          className="w-full flex justify-between items-center bg-white/10 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 hover:bg-white/20 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300"
        >
          <div className="text-left">
            <p className="font-semibold">Cambiar Correo</p>
            <p className="text-sm text-gray-300">{email}</p>
          </div>
          <span className="text-gray-400">›</span>
        </button>
        <button
          onClick={() => setSubView("telefonos")}
          className="w-full flex justify-between items-center bg-white/10 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 hover:bg-white/20 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300"
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
        onTelefonosChange={onTelefonosChange}
      />
    ),

    perfil: objUsuario ? (
      <EditProfile
        usuario={objUsuario}
        onGuardar={(objDatosActualizados) => {
          setObjUsuario((prev: any) => ({ ...prev, ...objDatosActualizados }));
          onPerfilActualizado();
          window.dispatchEvent(new Event("perfil:foto-actualizada"));
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
        onBack={() => {
          setStrNuevoEmailPendiente("");
          setObjOtpMeta({});
          setSubView("menu");
        }}
        onContinue={(nuevoEmail, otpMeta) => {
          setStrNuevoEmailPendiente(nuevoEmail);
          setObjOtpMeta(otpMeta ?? {});
          setSubView("confirmar-correo");
        }}
        email_actual={email}
        id_usuario={id_usuario}
        nuevo_email_inicial={strNuevoEmailPendiente}
      />
    ),

    "confirmar-correo": (
      <ConfirmarCorreoView
        id_usuario={id_usuario}
        nuevo_email={strNuevoEmailPendiente}
        expires_in_sec={objOtpMeta.expiresInSec}
        resend_after_sec={objOtpMeta.resendAfterSec}
        onBack={() => setSubView("correo")}
      />
    ),
  };

  return (
    <div className={`p-8 text-white ${subView === "menu" ? "space-y-6" : "space-y-0"}`}>
      {subView === "menu" && (
        <h1 className="text-2xl font-bold border-b border-gray-600/50 pb-4 mb-4">
          Seguridad
        </h1>
      )}
      <div key={subView} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {VIEWS[subView] || VIEWS.menu}
      </div>
    </div>
  );
}
