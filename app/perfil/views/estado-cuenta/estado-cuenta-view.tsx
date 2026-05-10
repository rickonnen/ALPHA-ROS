/* Dev: HU-04
   Funcionalidad: Vista "Estado de Cuenta" dentro de Seguridad
   Paleta: El panel de perfil tiene fondo oscuro (#1F3A4D-ish) con texto blanco,
           igual que contrasena-view y cambiar-correo.
           El modal interno usa fondo claro #F4EFE6.
   CAs: CA-2, CA-4, CA-5, CA-6, CA-8, CA-9, CA-11, CA-14, CA-17, CA-18, CA-24
   FIX: Al confirmar desactivación, se limpia el estado local del historial
        en el UI antes de redirigir, para que no queden datos visibles en pantalla.
*/
"use client";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import ModalDesactivar from "./modal-desactivar";

interface EstadoCuentaViewProps {
  id_usuario: string;
  estadoCuenta: number | null; // 1 = activa, 0 = desactivada
  onBack: () => void;
  onLimpiarDatos?: () => void; // callback para limpiar historial/favoritos en el padre
}

export default function EstadoCuentaView({
  id_usuario,
  estadoCuenta,
  onBack,
  onLimpiarDatos,
}: EstadoCuentaViewProps) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [exitosa, setExitosa] = useState(false);

  // CA-6: botón habilitado solo si la cuenta está activa
  const cuentaActiva = estadoCuenta !== 0;

  const handleAbrirModal = () => {
    setMensajeError("");
    setModalAbierto(true); // CA-18: sin recargar página
  };

  // CA-7 / CA-10
  const handleCerrarModal = () => {
    if (!isLoading) setModalAbierto(false);
  };

  // CA-2, CA-4, CA-5, CA-8, CA-9, CA-11, CA-17
  const handleConfirmar = async () => {
    setIsLoading(true);
    setMensajeError("");

    try {
      const res = await fetch("/api/perfil/desactivarCuenta", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario }),
      });

      if (!res.ok) {
        // CA-8: error → cuenta sigue activa
        const data = await res.json();
        setMensajeError(
          data.error ?? "Ocurrió un error. La cuenta permanece activa."
        );
        setIsLoading(false);
        return;
      }

      // CA-5: limpiar datos del historial en el UI inmediatamente,
      // antes de redirigir, para que no queden visibles en pantalla
      onLimpiarDatos?.();

      setModalAbierto(false);
      setIsLoading(false);
      setExitosa(true); // CA-24

      // CA-4 / CA-17: logout, limpiar sesión completamente y redirigir
      setTimeout(async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        // limpia todo el estado de auth
        const { signOut } = await import("next-auth/react");
        await signOut({ redirect: false });
        window.location.href = "/";
      }, 2500);
    } catch {
      // CA-8: error de red
      setMensajeError("Error de conexión. La cuenta permanece activa.");
      setIsLoading(false);
    }
  };

  // ── Pantalla de éxito — CA-24 ──
  if (exitosa) {
    return (
      <div className="p-8 text-white">
        <div className="flex flex-col items-center gap-4 py-10 text-center animate-in fade-in zoom-in-95 duration-500">
          {/* Check sobre fondo azul petróleo translúcido */}
          <div
            className="rounded-full p-4"
            style={{ backgroundColor: "#1F3A4D44" }}
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Cuenta desactivada
          </h2>
          <p className="text-white/70 text-sm max-w-xs">
            Tu perfil ha sido desactivado y ya no es visible para otros usuarios.
          </p>
          {/* CA-24: mensaje de reactivación */}
          <div
            className="rounded-xl p-4 text-sm max-w-xs border"
            style={{
              backgroundColor: "#1F3A4D55",
              borderColor: "#1F3A4D88",
              color: "#F4EFE6",
            }}
          >
            ¿Deseas reactivar tu cuenta? Comunícate con nuestro equipo de
            soporte técnico para restaurar el acceso.
          </div>
          <p className="text-white/40 text-xs animate-pulse">
            Cerrando sesión y redirigiendo...
          </p>
        </div>
      </div>
    );
  }

  // ── Vista principal ──
  return (
    <div className="p-8 text-white space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Encabezado */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          aria-label="Volver a seguridad"
          className="flex items-center gap-1 text-white/60 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 rounded"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs font-bold tracking-widest uppercase">Seguridad</span>
        </button>
      </div>

      <div className="flex items-center gap-3 pb-5 border-b border-white/15 mb-6">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: "#ffffff15" }}
        >
          <svg className="h-5 w-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Estado de Cuenta
          </h2>
          <p className="text-sm text-white/60">
            Administra el estado de tu perfil.
          </p>
        </div>
      </div>

      <p className="text-sm text-white/70">
        Desde aquí puedes desactivar tu perfil temporalmente. Tu información
        no se eliminará, pero dejará de ser visible para otros usuarios hasta
        que contactes a soporte para reactivarla.
      </p>

      {/* CA-8: banner de error */}
      {mensajeError && (
        <div
          className="rounded-xl p-4 text-sm border"
          style={{
            backgroundColor: "#C26E5A22",
            borderColor: "#C26E5A55",
            color: "#fca5a5",
          }}
        >
          ⚠️ {mensajeError}
        </div>
      )}

      {/* CA-6: botón solo si cuenta activa */}
      {cuentaActiva ? (
        <button
          onClick={handleAbrirModal}
          className="w-full flex justify-between items-center p-4 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] focus:outline-none focus:ring-2"
          style={{
            backgroundColor: "#C26E5A18",
            borderColor: "#C26E5A44",
          }}
        >
          <div className="text-left">
            <p className="font-semibold" style={{ color: "#f8b4a0" }}>
              Desactivar Perfil
            </p>
            <p className="text-sm text-white/50">
              Suspender temporalmente tu cuenta
            </p>
          </div>
          <span className="text-lg" style={{ color: "#C26E5A" }}>›</span>
        </button>
      ) : (
        // CA-6: cuenta ya desactivada — solo informativo
        <div
          className="w-full p-4 rounded-xl border"
          style={{
            backgroundColor: "#ffffff0a",
            borderColor: "#ffffff20",
          }}
        >
          <p className="font-semibold text-white/40">Perfil desactivado</p>
          <p className="text-sm text-white/30">
            Tu cuenta ya está desactivada. Contacta a soporte para reactivarla.
          </p>
        </div>
      )}

      {/* Modal */}
      <ModalDesactivar
        isOpen={modalAbierto}
        onClose={handleCerrarModal}
        onConfirm={handleConfirmar}
        isLoading={isLoading}
      />
    </div>
  );
}
