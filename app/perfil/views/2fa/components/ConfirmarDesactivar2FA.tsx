"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail } from "lucide-react";

interface Props {
  id_usuario: string;
  primary_provider?: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ConfirmarDesactivar2FA({ id_usuario, primary_provider, onSuccess, onCancel }: Props) {
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpEnviado, setOtpEnviado] = useState(false);
  const [enviandoOtp, setEnviandoOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const esGoogle = primary_provider === "google";

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const enviarOtp = async () => {
    setEnviandoOtp(true);
    setError("");
    try {
      const res = await fetch("/api/perfil/enviarOTPdesactivar2FA", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpEnviado(true);
        setCountdown(60);
      } else {
        setError(data.error || "Error al enviar el código.");
      }
    } catch {
      setError("Error de red. Intenta nuevamente.");
    } finally {
      setEnviandoOtp(false);
    }
  };

  const confirmar = async () => {
    if (esGoogle && !otpCode) { setError("Ingresa el código enviado a tu correo."); return; }
    if (!esGoogle && !password) { setError("Ingresa tu contraseña."); return; }

    setCargando(true);
    setError("");
    try {
      const body = esGoogle
        ? { id_usuario, otp_code: otpCode }
        : { id_usuario, password };

      const response = await fetch("/api/perfil/desactivar-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok) {
        onSuccess();
      } else {
        setError(data.error || "Verificación fallida.");
      }
    } catch {
      setError("Error de red. Intenta nuevamente.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="border-t border-white/15" />
      <h3 className="text-xs font-bold tracking-widest text-white/80">
        CONFIRMAR DESACTIVACIÓN
      </h3>

      {esGoogle ? (
        <>
          <p className="text-sm text-white/60">
            Tu cuenta usa Google. Ingresa el código que enviaremos a tu correo para confirmar.
          </p>
          {!otpEnviado ? (
            <button
              type="button"
              onClick={enviarOtp}
              disabled={enviandoOtp}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 border border-white/25 text-white/80 font-bold text-sm rounded-lg hover:bg-white/15 transition-colors disabled:opacity-50 w-full justify-center"
            >
              <Mail className="h-4 w-4" />
              {enviandoOtp ? "Enviando..." : "Enviar código a mi correo"}
            </button>
          ) : (
            <>
              <p className="text-xs text-[#E05A2B]">✓ Código enviado. Revisa tu correo.</p>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => { setOtpCode(e.target.value); setError(""); }}
                placeholder="Ingresa el código de 6 dígitos"
                maxLength={6}
                autoFocus
                className={`w-full h-12 rounded-lg border bg-white/10 px-3 text-white/90 placeholder:text-white/30 focus:outline-none ${
                  error ? "border-red-400/70" : "border-white/25"
                }`}
              />
              <button
                type="button"
                onClick={enviarOtp}
                disabled={countdown > 0 || enviandoOtp}
                className="text-xs text-white/40 hover:text-white/60 disabled:cursor-not-allowed transition-colors"
              >
                {countdown > 0 ? `Reenviar en ${countdown}s` : "Reenviar código"}
              </button>
            </>
          )}
        </>
      ) : (
        <>
      <p className="text-sm text-white/60">
        Ingresa tu contraseña actual para desactivar el 2FA.
      </p>
      <div className={`flex h-12 rounded-lg border bg-white/10 overflow-hidden ${
        error ? "border-red-400/70" : "border-white/25"
      }`}>
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(""); }}
          placeholder="••••••••••••"
          autoFocus
          className="flex-1 min-w-0 bg-transparent px-3 text-white/90 placeholder:text-white/30 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="flex items-center px-3 border-l border-white/20 text-white/40 hover:text-white/70 transition-colors"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      </>
      )}
      {error && <p className="text-red-300/80 text-xs">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={confirmar}
          disabled={cargando || (esGoogle && !otpEnviado)}
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
  );
}