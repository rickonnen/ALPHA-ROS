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
 * 
 * Modificado: Dylan Coca Beltran - 03/04/2026
 * Cambio: Corrección de bugs reportados por QA — botones en fila para mobile,
 * validación de contraseña nueva igual a la actual usando el endpoint existente
 * 
 * Modificado: Dylan Coca Beltran - 04/04/2026
 * Cambio: Implementación de estándares NIST SP 800-63B y OWASP —
 * maxLength de 72 caracteres en los tres campos,
 * validación de espacios al inicio o al final en nueva contraseña,
 * eliminación de exigencia de mayúscula y carácter especial,
 * reemplazo de regex restrictivo por validación de caracteres de control invisibles,
 * longitud mínima de 8 caracteres como única regla de complejidad,
 * ocultamiento del ojo nativo del navegador en los tres campos
 * 
 * Modificado: Dylan Coca Beltran - 09/04/2026
 * Cambio: Fix HU4B-1 — texto superpuesto con ícono de visibilidad en cadenas largas,
 * reestructuración de campos a layout flex nativo para separar área de texto y botón,
 * ocultamiento de ojo nativo del navegador en todos los campos (Chrome, Safari, Edge),
 * cambio de comportamiento del ojo a click toggle en vez de mantener pulsado,
 * alineado con WCAG 2.1 criterio 1.4.4 (resize text) y buenas prácticas de UX
 * para formularios de autenticación según OWASP Authentication Cheat Sheet
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

  // Prioridad 1.5 — espacios al inicio o al final
  if (strNewPassword !== strNewPassword.trim()) {
    setStrErrorNew("La contraseña no puede empezar ni terminar con espacios.");
    return;
  }

  // Prioridad 2 — caracteres de control invisibles
  const regexControlChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
  if (regexControlChars.test(strNewPassword)) {
    setStrErrorNew("La contraseña contiene caracteres no permitidos.");
    return;
  }

  // Prioridad 2.5 — longitud mínima
  if (strNewPassword.length < 8) {
    setStrErrorNew("La contraseña debe tener mínimo 8 caracteres.");
    return;
  }

  // Prioridad 3 — contraseñas nuevas no coinciden
  if (strNewPassword !== strConfirmPassword) {
    setStrErrorNew("Las contraseñas no concuerdan.");
    setStrErrorConfirm("Las contraseñas no concuerdan.");
    return;
  }

  try {
    setBolValidando(true);

    // Prioridad 4 — verificar contraseña actual con el backend
    const res = await fetch("/api/perfil/validarContrasenaActual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_usuario,
        password_actual: strCurrentPassword
      })
    });

    const json = await res.json();

    if (!res.ok || !json.ok) {
      setStrErrorModalMessage(json.error || "La contraseña actual es incorrecta.");
      setBolShowErrorModal(true);
      return;
    }

    // Prioridad 5 — verificar que nueva != actual contra el backend
    const resCheck = await fetch("/api/perfil/validarContrasenaActual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_usuario,
        password_actual: strNewPassword
      })
    });

    const jsonCheck = await resCheck.json();

    // Si la nueva contraseña pasa la validación, significa que es igual a la actual
    if (resCheck.ok && jsonCheck.ok) {
      setStrErrorNew("La nueva contraseña no puede ser igual a la actual.");
      return;
    }

    // Prioridad 6 — actualizar contraseña
    const resUpdate = await fetch("/api/perfil/actualizarContrasena", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_usuario,
        strNewPassword
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
    console.error("Error al cambiar contraseña:", error);
    setStrErrorModalMessage("Error de red al cambiar la contraseña.");
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
        <p className="text-sm text-white/60">Elige una contraseña segura.</p>
      </div>
    </div>

    <div className="flex flex-col gap-6">

      {/* Contraseña actual */}
      <div>
        <label className="mb-2 block text-sm font-black uppercase tracking-wider text-white/70">
          Contraseña actual
        </label>
        <div className={`flex h-12 rounded-lg border bg-white/10 overflow-hidden ${
          strErrorCurrent ? 'border-red-400/70' : 'border-white/25'
        }`}>
          <input
            type={bolShowCurrent ? "text" : "password"}
            value={strCurrentPassword}
            placeholder="••••••••••••"
            maxLength={72}
            onChange={(e) => setStrCurrentPassword(e.target.value)}
            autoComplete="new-password"
            className="flex-1 min-w-0 bg-transparent px-3 text-white/90 placeholder:text-white/30 
              focus:outline-none focus:ring-0 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden 
              [&::-webkit-contacts-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
          />
          <button
            type="button"
            onClick={() => setBolShowCurrent(!bolShowCurrent)}
            className="flex items-center px-3 border-l border-white/20 text-white/40 hover:text-white/70 transition-colors shrink-0"
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
        <div className={`flex h-12 rounded-lg border bg-white/10 overflow-hidden ${
          strErrorNew ? 'border-red-400/70' : 'border-white/25'
        }`}>
          <input
            type={bolShowNew ? "text" : "password"}
            value={strNewPassword}
            placeholder="••••••••••••"
            maxLength={72}
            onChange={(e) => setStrNewPassword(e.target.value)}
            autoComplete="new-password"
            className="flex-1 min-w-0 bg-transparent px-3 text-white/90 placeholder:text-white/30 
              focus:outline-none focus:ring-0 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden 
              [&::-webkit-contacts-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
          />
          <button
            type="button"
            onClick={() => setBolShowNew(!bolShowNew)}
            className="flex items-center px-3 border-l border-white/20 text-white/40 hover:text-white/70 transition-colors shrink-0"
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
        <div className={`flex h-12 rounded-lg border bg-white/10 overflow-hidden ${
          strErrorConfirm ? 'border-red-400/70' : 'border-white/25'
        }`}>
          <input
            type={bolShowConfirm ? "text" : "password"}
            value={strConfirmPassword}
            placeholder="••••••••••••"
            maxLength={72}
            onChange={(e) => setStrConfirmPassword(e.target.value)}
            autoComplete="new-password"
            className="flex-1 min-w-0 bg-transparent px-3 text-white/90 placeholder:text-white/30 
              focus:outline-none focus:ring-0 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden 
              [&::-webkit-contacts-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
          />
          <button
            type="button"
            onClick={() => setBolShowConfirm(!bolShowConfirm)}
            className="flex items-center px-3 border-l border-white/20 text-white/40 hover:text-white/70 transition-colors shrink-0"
          >
            {bolShowConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {strErrorConfirm && (
          <p className="text-red-300/80 text-xs mt-1">{strErrorConfirm}</p>
        )}
      </div>

        {/* Botones */}
        <div className="flex flex-row sm:flex-row gap-3 mt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={bolValidando}
            className="flex-1 sm:flex-none sm:w-auto h-10 rounded-lg border-white/25 bg-transparent text-white/70 hover:bg-white/10 
              hover:text-white hover:border-white/40 transition-colors"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={bolValidando}
            className="flex-1 sm:flex-none sm:w-auto h-10 rounded-lg bg-zinc-100 border border-zinc-300 text-zinc-700 font-bold 
              hover:bg-zinc-200 transition-colors shadow-sm shadow-black/20 disabled:opacity-60"
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