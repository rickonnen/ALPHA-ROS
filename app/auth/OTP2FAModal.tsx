/*  Modal para verificar 2FA durante login */
"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

interface OTP2FAModalProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function OTP2FAModal({
  userId,
  onSuccess,
  onCancel,
}: OTP2FAModalProps) {
  const [codigo, setCodigo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const handleVerifyOTP = async () => {
    if (codigo.length !== 6) {
      setError("Ingresa un código de 6 dígitos");
      return;
    }

    setCargando(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-2fa-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId,
          codigo,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✓ Verificación exitosa
        onSuccess();
      } else {
        // ✗ Verificación fallida
        setError(data.error || "Código inválido");
        setCodigo("");
      }
    } catch (err) {
      console.error("Error verificando 2FA:", err);
      setError("Error al verificar código");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-sm p-8 border border-white/10 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
            <Lock className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Verificación 2FA</h2>
            <p className="text-sm text-gray-400">Abre tu app de autenticación</p>
          </div>
        </div>

        {/* Instrucción */}
        <p className="text-sm text-gray-300 mb-4">
          Ingresa el código de 6 dígitos de tu Google Authenticator o app de autenticación
        </p>

        {/* Input para código */}
        <input
          type="text"
          maxLength={6}
          value={codigo}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            setCodigo(val);
            setError(""); // Limpiar error al escribir
          }}
          placeholder="000000"
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white text-center text-2xl font-mono tracking-widest placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-slate-700/70 transition-colors mb-4"
          autoFocus
          disabled={cargando}
        />

        {/* Error message */}
        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={handleVerifyOTP}
            disabled={cargando || codigo.length !== 6}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {cargando ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verificando...
              </>
            ) : (
              "Verificar"
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={cargando}
            className="flex-1 px-4 py-2 border border-slate-600 text-gray-300 font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>

        {/* Ayuda */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          El código cambia cada 30 segundos
        </p>
      </div>
    </div>
  );
}
