"use client";
/**
 * Dev: Dylan Coca Beltran
 * Fecha: 26/03/2026
 * Funcionalidad: Formulario para cambiar la contraseña del usuario
 * @param onCancel - Regresa a la vista anterior al presionar Cancelar
 * @return Formulario de cambio de contraseña
 * Modificado: Dylan Coca Beltran - 28/03/2026
 * Cambio: Se agregaron validaciones de campos, modal de éxito y modal de error
 */
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import ResultModal from "@/components/ui/modal";

interface ChangePasswordFormProps {
  onCancel: () => void;
}

export default function ChangePasswordForm({ onCancel }: ChangePasswordFormProps) {
  const [strCurrentPassword, setStrCurrentPassword] = useState("");
  const [strNewPassword, setStrNewPassword] = useState("");
  const [strConfirmPassword, setStrConfirmPassword] = useState("");

  // Estado independiente del ojo por cada campo
  const [bolShowCurrent, setBolShowCurrent] = useState(false);
  const [bolShowNew, setBolShowNew] = useState(false);
  const [bolShowConfirm, setBolShowConfirm] = useState(false);

  // Estado del modal
  const [bolShowModal, setBolShowModal] = useState(false);
  const [bolShowErrorModal, setBolShowErrorModal] = useState(false);


  // Contraseña falsa de prueba (luego se reemplaza por la del backend)
  const strFakeCurrentPassword = "123456";

  // Estado para los errores
  const [strErrorCurrent, setStrErrorCurrent] = useState("");
  const [strErrorNew, setStrErrorNew] = useState("");
  const [strErrorConfirm, setStrErrorConfirm] = useState("");

  // Limpia todos los campos
  const handleReset = () => {
    setStrCurrentPassword("");
    setStrNewPassword("");
    setStrConfirmPassword("");
    setStrErrorCurrent("");
    setStrErrorNew("");
    setStrErrorConfirm("")
    setBolShowErrorModal(false);
  };

  // Comprueba los campos y respectivos errores
  const handleSave = () => {
    // Limpiar errores anteriores
    setStrErrorCurrent("");
    setStrErrorNew("");
    setStrErrorConfirm("");

    // Prioridad 1 — verificar que ningún campo esté vacío
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

    // Prioridad 2 — verificar que las contraseñas nuevas coincidan
    if (strNewPassword !== strConfirmPassword) {
      setStrErrorNew("Las contraseñas no concuerdan.");
      setStrErrorConfirm("Las contraseñas no concuerdan.");
      return;
    }

    // Prioridad 3 — verificar contraseña actual (aquí ya salen los modales)
    if (strCurrentPassword !== strFakeCurrentPassword) {
      setBolShowErrorModal(true);
      return;
    }

    // Todo correcto
    setBolShowModal(true);
  };

  return (
    <div className="p-8">
      <p className="text-xs tracking-widest opacity-60 mb-1">SEGURIDAD › CAMBIAR CONTRASEÑA</p>
      <h2 className="text-xl font-bold mb-6">Cambiar contraseña</h2>

      <div className="flex flex-col gap-4">
        {/* Contraseña actual */}
        <div>
          <label className="text-xs font-bold tracking-widest">CONTRASEÑA ACTUAL</label>
          <div className="relative">
            <Input
              type={bolShowCurrent ? "text" : "password"}
              value={strCurrentPassword}
              onChange={(e) => setStrCurrentPassword(e.target.value)}
            />
            {strErrorCurrent && (
              <p className="text-red-400 text-xs mt-1">{strErrorCurrent}</p>
            )}
            <button
              type="button"
              onClick={() => setBolShowCurrent(!bolShowCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {bolShowCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Nueva contraseña */}
        <div>
          <label className="text-xs font-bold tracking-widest">NUEVA CONTRASEÑA</label>
          <div className="relative">
            <Input
              type={bolShowNew ? "text" : "password"}
              value={strNewPassword}
              onChange={(e) => setStrNewPassword(e.target.value)}
            />
            {strErrorNew && (
              <p className="text-red-400 text-xs mt-1">{strErrorNew}</p>
            )}
            <button
              type="button"
              onClick={() => setBolShowNew(!bolShowNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {bolShowNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Confirmar contraseña */}
        <div>
          <label className="text-xs font-bold tracking-widest">CONFIRMAR CONTRASEÑA</label>
          <div className="relative">
            <Input
              type={bolShowConfirm ? "text" : "password"}
              value={strConfirmPassword}
              onChange={(e) => setStrConfirmPassword(e.target.value)}
            />
            {strErrorConfirm && (
              <p className="text-red-400 text-xs mt-1">{strErrorConfirm}</p>
            )}
            <button
              type="button"
              onClick={() => setBolShowConfirm(!bolShowConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {bolShowConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4 mt-2">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar contraseña</Button>
        </div>
      </div>

      {/* Modal de éxito */}
      {bolShowModal && (
        <ResultModal
          type="success"
          title="¡Contraseña actualizada!"
          message="Tu contraseña se cambió exitosamente."
          onClose={() => setBolShowModal(false)}
        />
      )}

      {/* Modal de error */}
      {bolShowErrorModal && (
        <ResultModal
          type="error"
          title="¡Ocurrió un error!"
          message="La contraseña actual es incorrecta. Por favor, inténtalo de nuevo."
          onClose={handleReset}
          onRetry={handleReset}
        />
      )}
    </div>
  );
}
