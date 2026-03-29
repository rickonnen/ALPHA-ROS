/*
 * Dev: Dylan Coca Beltran
 * Fecha: 26/03/2026
 * Funcionalidad: Formulario para cambiar la contraseña del usuario
 * @param onCancel - Regresa a la vista anterior al presionar Cancelar
 * @param id_usuario - ID del usuario logueado
 * @return Formulario de cambio de contraseña
 *
 * Modificado: Dylan Coca Beltran - 28/03/2026
 * Cambio: Se agregaron validaciones de campos vacíos, caracteres inválidos,
 * requisitos de seguridad (mínimo 8 caracteres, mayúscula y carácter especial),
 * contraseñas que no coinciden, nueva igual a la actual, modales de éxito y error,
 * ícono de candado, transición de entrada, estilos mejorados y conexión al backend
 * 
 * Modificado: Dylan Coca Beltran - 29/03/2026
 * Cambio: Conexión al backend para verificar y actualizar contraseña,
 * flecha de regreso a seguridad, redirección a perfil al éxito con recarga,
 * soporte táctil para mostrar/ocultar contraseña en mobile,
 * botones responsivos apilados en mobile y en fila en desktop
 */
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";
import ResultModal from "@/components/ui/modal";

interface ChangePasswordFormProps {
  onCancel: () => void;
  id_usuario: string;
  email: string;
  onSuccess: () => void;
}

export default function ChangePasswordForm({ onCancel, id_usuario, email, onSuccess }: ChangePasswordFormProps) {
  const [strCurrentPassword, setStrCurrentPassword] = useState("");
  const [strNewPassword, setStrNewPassword] = useState("");
  const [strConfirmPassword, setStrConfirmPassword] = useState("");

  // Estado independiente del ojo por cada campo
  const [bolShowCurrent, setBolShowCurrent] = useState(false);
  const [bolShowNew, setBolShowNew] = useState(false);
  const [bolShowConfirm, setBolShowConfirm] = useState(false);

  // Estado de errores por campo
  const [strErrorCurrent, setStrErrorCurrent] = useState("");
  const [strErrorNew, setStrErrorNew] = useState("");
  const [strErrorConfirm, setStrErrorConfirm] = useState("");

  // Estado de modales
  const [bolShowModal, setBolShowModal] = useState(false);
  const [bolShowErrorModal, setBolShowErrorModal] = useState(false);
  const [strErrorModalMessage, setStrErrorModalMessage] = useState("");

  // Estado de carga
  const [bolValidando, setBolValidando] = useState(false);

  // Limpia todos los campos y errores
  const handleReset = () => {
    setStrCurrentPassword("");
    setStrNewPassword("");
    setStrConfirmPassword("");
    setStrErrorCurrent("");
    setStrErrorNew("");
    setStrErrorConfirm("");
    setBolShowErrorModal(false);
    setStrErrorModalMessage("");
  };

  const handleSave = async () => {
    if (bolValidando) return;

    // Limpiar errores anteriores
    setStrErrorCurrent("");
    setStrErrorNew("");
    setStrErrorConfirm("");

    // Prioridad 1 — campos vacíos
    let bolHasErrors = false;

    if (strCurrentPassword === "") {
      setStrErrorCurrent("Este campo es obligatorio.");
      bolHasErrors = true;
    }
    if (strNewPassword === "") {
      setStrErrorNew("Este campo es obligatorio.");
      bolHasErrors = true;
    }
    if (strConfirmPassword === "") {
      setStrErrorConfirm("Este campo es obligatorio.");
      bolHasErrors = true;
    }
    if (bolHasErrors) return;

    // Prioridad 2 — caracteres inválidos en nueva contraseña
    const regexPassword = /^[a-zA-Z0-9 .,;:!?@#$%^&*()_+\-=\[\]{}'"\\|<>\/`~]+$/;
    if (!regexPassword.test(strNewPassword)) {
      setStrErrorNew("Solo se permiten letras, números, espacios y signos de puntuación.");
      return;
    }

    // Prioridad 2.5 — requisitos mínimos de seguridad
      const bolTieneMinimo8 = strNewPassword.length >= 8;
      const bolTieneMayuscula = /[A-Z]/.test(strNewPassword);
      const bolTieneEspecial = /[.,;:!?@#$%^&*()_+\-=\[\]{}'"\\|<>\/`~]/.test(strNewPassword);

      if (!bolTieneMinimo8 || !bolTieneMayuscula || !bolTieneEspecial) {
        setStrErrorNew("La contraseña debe tener mínimo 8 caracteres, una mayúscula y un carácter especial.");
        return;
      }

    // Prioridad 3 — nueva igual a la actual
    if (strNewPassword === strCurrentPassword) {
      setStrErrorNew("La nueva contraseña no puede ser igual a la actual.");
      return;
    }

    // Prioridad 4 — contraseñas nuevas no coinciden
    if (strNewPassword !== strConfirmPassword) {
      setStrErrorNew("Las contraseñas no concuerdan.");
      setStrErrorConfirm("Las contraseñas no concuerdan.");
      return;
    }

    // Prioridad 5 — verificar contraseña actual con el backend
    try {
      setBolValidando(true);

      const res = await fetch("/backend/perfil/validarContrasenaActual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: id_usuario,
          email: email,
          password_actual: strCurrentPassword
        })
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        setStrErrorModalMessage(json.error || "La contraseña actual es incorrecta.");
        setBolShowErrorModal(true);
        return;
      }

      // Contraseña correcta, ahora actualizar
      const resUpdate = await fetch("/backend/perfil/actualizarContrasena", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario,
          strNewPassword: strNewPassword
        })
      });

      const jsonUpdate = await resUpdate.json();

      if (!resUpdate.ok || !jsonUpdate.ok) {
        setStrErrorModalMessage(jsonUpdate.error || "No se pudo actualizar la contraseña.");
        setBolShowErrorModal(true);
        return;
      }

      // Todo correcto
      setBolShowModal(true);


    } catch (error) {
      console.error("Error al validar contraseña:", error);
      setStrErrorModalMessage("Error de red al validar la contraseña.");
      setBolShowErrorModal(true);
    } finally {
      setBolValidando(false);
    }

  };

  return (
  <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
    
    {/* Breadcrumb */}
    <button
      type="button"
      onClick={onCancel}
      className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="text-xs font-bold tracking-widest">SEGURIDAD</span>
    </button>
    
    {/* Título con ícono */}
    <div className="flex items-center gap-3 mb-8 pb-5 border-b border-white/15">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
        <Lock className="h-5 w-5 text-white/70" />
      </div>
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white">Cambiar contraseña</h2>
        <p className="text-sm text-white/60">Elige una contraseña segura que no uses en otros sitios.</p>
      </div>
    </div>

    <div className="flex flex-col gap-6">

      {/* Contraseña actual */}
      <div>
        <label className="mb-2 block text-sm font-black uppercase tracking-wider text-white/70">
          Contraseña actual
        </label>
        <div className="relative">
          <Input
            type={bolShowCurrent ? "text" : "password"}
            value={strCurrentPassword}
            placeholder="••••••••••••"
            onChange={(e) => setStrCurrentPassword(e.target.value)}
            className={`h-12 rounded-lg border bg-white/10 pr-10 px-3 text-white/90 placeholder:text-white/30 focus-visible:ring-2 transition-colors ${
              strErrorCurrent
                ? "border-red-400/70 focus-visible:ring-red-400/40"
                : "border-white/25 focus-visible:ring-white/30"
            }`}
          />
          <button
            type="button"
            onMouseDown={() => setBolShowCurrent(true)}
            onMouseUp={() => setBolShowCurrent(false)}
            onMouseLeave={() => setBolShowCurrent(false)}
            onTouchStart={() => setBolShowCurrent(true)}
            onTouchEnd={() => setBolShowCurrent(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
          >
            {bolShowCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {strErrorCurrent && (
          <p className="text-red-300/80 text-xs mt-1">{strErrorCurrent}</p>
        )}
      </div>

      {/* Nueva contraseña */}
      <div>
        <label className="mb-2 block text-sm font-black uppercase tracking-wider text-white/70">
          Nueva contraseña
        </label>
        <div className="relative">
          <Input
            type={bolShowNew ? "text" : "password"}
            value={strNewPassword}
            placeholder="••••••••••••"
            onChange={(e) => setStrNewPassword(e.target.value)}
            className={`h-12 rounded-lg border bg-white/10 pr-10 px-3 text-white/90 placeholder:text-white/30 focus-visible:ring-2 transition-colors ${
              strErrorNew
                ? "border-red-400/70 focus-visible:ring-red-400/40"
                : "border-white/25 focus-visible:ring-white/30"
            }`}
          />
          <button
            type="button"
            onMouseDown={() => setBolShowNew(true)}
            onMouseUp={() => setBolShowNew(false)}
            onMouseLeave={() => setBolShowNew(false)}
            onTouchStart={() => setBolShowNew(true)}
            onTouchEnd={() => setBolShowNew(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
          >
            {bolShowNew ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {strErrorNew && (
          <p className="text-red-300/80 text-xs mt-1">{strErrorNew}</p>
        )}
      </div>

      {/* Confirmar contraseña */}
      <div>
        <label className="mb-2 block text-sm font-black uppercase tracking-wider text-white/70">
          Confirmar contraseña
        </label>
        <div className="relative">
          <Input
            type={bolShowConfirm ? "text" : "password"}
            value={strConfirmPassword}
            placeholder="••••••••••••"
            onChange={(e) => setStrConfirmPassword(e.target.value)}
            className={`h-12 rounded-lg border bg-white/10 pr-10 px-3 text-white/90 placeholder:text-white/30 focus-visible:ring-2 transition-colors ${
              strErrorConfirm
                ? "border-red-400/70 focus-visible:ring-red-400/40"
                : "border-white/25 focus-visible:ring-white/30"
            }`}
          />
          <button
            type="button"
            onMouseDown={() => setBolShowConfirm(true)}
            onMouseUp={() => setBolShowConfirm(false)}
            onMouseLeave={() => setBolShowConfirm(false)}
            onTouchStart={() => setBolShowConfirm(true)}
            onTouchEnd={() => setBolShowConfirm(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
          >
            {bolShowConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {strErrorConfirm && (
          <p className="text-red-300/80 text-xs mt-1">{strErrorConfirm}</p>
        )}
      </div>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={bolValidando}
          className="w-full sm:w-auto h-10 rounded-lg border-white/25 bg-transparent text-white/70 hover:bg-white/10 hover:text-white hover:border-white/40 transition-colors"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={bolValidando}
          className="w-full sm:w-auto h-10 rounded-lg bg-zinc-100 border border-zinc-300 text-zinc-700 font-bold hover:bg-zinc-200 transition-colors shadow-sm shadow-black/20 disabled:opacity-60"
        >
          {bolValidando ? "Verificando..." : "Guardar"}
        </Button>
      </div>

    </div>

    {/* Modales */}
    {bolShowModal && (
      <ResultModal
        type="success"
        title="¡Contraseña actualizada!"
        message="Tu contraseña se cambió exitosamente."
        onClose={() => {
          setBolShowModal(false);
          handleReset();
          onSuccess();
          window.location.reload();
        }}
      />
    )}

    {bolShowErrorModal && (
      <ResultModal
        type="error"
        title="¡Ocurrió un error!"
        message={strErrorModalMessage}
        onClose={handleReset}
        onRetry={handleReset}
      />
    )}

  </div>
);
} 