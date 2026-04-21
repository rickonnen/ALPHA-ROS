"use client";
import { useState, useEffect, useRef } from "react";
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

  // Bloqueo
  const [bloqueado, setBloqueado] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const [intentosRestantes, setIntentosRestantes] = useState(5);
  const intervaloRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown cuando está bloqueado
  useEffect(() => {
    if (bloqueado && segundosRestantes > 0) {
      intervaloRef.current = setInterval(() => {
        setSegundosRestantes((prev) => {
          if (prev <= 1) {
            clearInterval(intervaloRef.current!);
            setBloqueado(false);
            setIntentosRestantes(5);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, [bloqueado, segundosRestantes]);

  const verificar = async () => {
    if (codigo.length !== 6 || bloqueado) return;
    setCargando(true);
    try {
      const response = await fetch("/api/perfil/verify2FA", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario, secreto, codigo }),
      });
      const data = await response.json();

      if (response.status === 429 || data.bloqueado) {
        // Usuario bloqueado
        setBloqueado(true);
        setSegundosRestantes(data.segundosRestantes ?? 60);
        setCodigo("");
        return;
      }

      if (data.esValido) {
        setModalMensaje("2FA activado correctamente. Tu cuenta está protegida.");
        setModal("success");
      } else {
        setIntentosRestantes(data.intentosRestantes ?? 0);
        setModalMensaje(
          data.intentosRestantes > 0
            ? `Código inválido. Te quedan ${data.intentosRestantes} intentos.`
            : "Código inválido."
        );
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

        {/* Banner de bloqueo */}
        {bloqueado && (
          <div className="bg-[#C26E5A]/80 border border-[#C26E5A] rounded-xl px-4 py-3 text-sm text-white text-center">
            Demasiados intentos fallidos. Espera{" "}
            <span className="font-bold text-white">{segundosRestantes}s</span>{" "}
            antes de intentar de nuevo.
          </div>
        )}

        {/* Intentos restantes */}
        {!bloqueado && intentosRestantes < 5 && intentosRestantes > 0 && (
          <p className="text-xs text-[#C26E5A] text-center">
            ⚠ Te quedan {intentosRestantes} intento{intentosRestantes !== 1 ? "s" : ""}.
          </p>
        )}

        <input
          type="text"
          maxLength={6}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
          placeholder="Ingresa el código"
          disabled={bloqueado}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-center text-lg font-mono tracking-widest placeholder-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          autoFocus
        />

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={verificar}
            disabled={cargando || codigo.length !== 6 || bloqueado}
            className="flex-1 px-4 py-3 bg-white text-black font-bold text-sm rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando ? "Verificando..." : bloqueado ? `Bloqueado (${segundosRestantes}s)` : "Confirmar"}
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