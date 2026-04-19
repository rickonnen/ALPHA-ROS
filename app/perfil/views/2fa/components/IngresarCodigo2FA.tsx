"use client";
import { useState } from "react";
import ModalResultado from "./ModalResultado";

interface Props {
  id_usuario: string;
  secreto: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function IngresarCodigo2FA({ id_usuario, secreto, onSuccess, onCancel }: Props) {
  const [codigo, setCodigo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [modal, setModal] = useState<"success" | "error" | null>(null);
  const [modalMensaje, setModalMensaje] = useState("");

  const verificar = async () => {
    if (codigo.length !== 6) return;
    setCargando(true);
    try {
      const response = await fetch("/api/perfil/verify2FA", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario, secreto, codigo }),
      });
      const data = await response.json();
      if (data.esValido) {
        setModalMensaje("2FA activado correctamente. Tu cuenta está protegida.");
        setModal("success");
      } else {
        setModalMensaje("El código es inválido. Intenta nuevamente.");
        setModal("error");
        setCodigo("");
      }
    } catch {
      setModalMensaje("Error al verificar el código. Intenta nuevamente.");
      setModal("error");
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      {modal && (
        <ModalResultado
          tipo={modal}
          mensaje={modalMensaje}
          onClose={() => {
            if (modal === "success") onSuccess();
            setModal(null);
          }}
        />
      )}

      <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="border-t border-white/15" />
        <div>
          <h3 className="text-xs font-bold tracking-widest text-white/80 mb-2">
            INGRESA EL CODIGO
          </h3>
          <p className="text-sm text-white/60">
            Ingresa el código de 6 dígitos que generó la app de autenticación
          </p>
        </div>
        <input
          type="text"
          maxLength={6}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
          placeholder="Ingresa el código"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-center text-lg font-mono tracking-widest placeholder-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors"
          autoFocus
        />
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={verificar}
            disabled={cargando || codigo.length !== 6}
            className="flex-1 px-4 py-3 bg-white text-black font-bold text-sm rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando ? "Verificando..." : "Confirmar"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-white/20 text-white/80 font-bold text-sm rounded-lg hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </>
  );
}