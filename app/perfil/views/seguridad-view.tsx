/* eslint-disable @typescript-eslint/no-explicit-any */
/* tslint:disable */
// @ts-nocheck
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
/* Dev: [Tu nombre] - HU-04
   Fecha: [fecha]
   Feature: Agrega opción "Estado de Cuenta" al menú de seguridad.
*/
/* Dev: [Tu nombre] - HU-04
   Fecha: [fecha]
   Fix: Pasa prop onLimpiarDatos a EstadoCuentaView para limpiar el historial
        de visitas del UI inmediatamente al confirmar la desactivación (CA-5).
*/
"use client";
import { useState, useEffect } from "react";
import TelefonosView from "./telefono-view";
import ChangePasswordForm from "./contrasena-view";
import CambiarCorreoView from "./cambiar-correo/cambiar-correo";
import ConfirmarCorreoView from "./cambiar-correo/confirmar-correo";
import EditProfile from "./editardatos/editar-datos";
import RedesView from "./redes-vinculadas/redes-view";
import Autenticacion2FAView from "./2fa/autenticacion-2fa";
import EstadoCuentaView from "./estado-cuenta/estado-cuenta-view";

interface SeguridadProps {
  id_usuario: string;
  email: string;
  telefonos: string[];
  onSuccess: () => void;
  onTelefonosChange: (nuevosTelefonos: string[]) => void;
  onPerfilActualizado: () => void;
  initialSubView?: string;
}

// Definir el tipo para los metadatos OTP
interface OtpMeta {
  expiresInSec?: number;
  resendAfterSec?: number;
}

export default function SeguridadView({ id_usuario, email, telefonos, onSuccess, onTelefonosChange, onPerfilActualizado, initialSubView }: SeguridadProps) {
  const [subView, setSubView] = useState<string>(initialSubView ?? "menu");
  const [strNuevoEmailPendiente, setStrNuevoEmailPendiente] = useState<string>("");
  const [objOtpMeta, setObjOtpMeta] = useState<OtpMeta>({});
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
        <button
          onClick={() => setSubView("redes")}
          className="w-full flex justify-between items-center bg-white/10 p-4 rounded-xl hover:bg-white/20 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300"
        >
          <div className="text-left">
            <p className="font-semibold">Redes Vinculadas</p>
            <p className="text-sm text-gray-300">Vincula o desvincula tus cuentas de Facebook y Discord</p>
          </div>
          <span className="text-gray-400">›</span>
        </button>
        <button
          onClick={() => setSubView("2fa")}
          className="w-full flex justify-between items-center bg-white/10 p-4 rounded-xl hover:bg-white/20 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300"
        >
          <div className="text-left">
            <p className="font-semibold">Autenticacion 2FA</p>
            <p className="text-sm text-gray-300">Autenticacion en Dos Pasos</p>
          </div>
          <span className="text-gray-400">›</span>
        </button>

        {/* HU-04: Estado de Cuenta */}
        <button
          onClick={() => setSubView("estado-cuenta")}
          className="w-full flex justify-between items-center bg-white/10 p-4 rounded-xl hover:bg-white/20 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300"
        >
          <div className="text-left">
            <p className="font-semibold">Estado de Cuenta</p>
            <p className="text-sm text-gray-300">Desactivar perfil</p>
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
        onContinue={(nuevoEmail: string, otpMeta?: OtpMeta) => {
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

    redes: (
      <RedesView
        id_usuario={id_usuario}
        onBack={() => setSubView("menu")}
      />
    ),

    "2fa": (
      <Autenticacion2FAView
        id_usuario={id_usuario}
        primary_provider={objUsuario?.google_id ? "google" : null}
        onBack={() => setSubView("menu")}
      />
    ),

    "estado-cuenta": (
      <EstadoCuentaView
        id_usuario={id_usuario}
        estadoCuenta={objUsuario?.estado ?? 1}
        onBack={() => setSubView("menu")}
        onLimpiarDatos={() =>
          setObjUsuario((prev: any) =>
            prev ? { ...prev, HistorialVistos: [] } : prev
          )
        }
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
