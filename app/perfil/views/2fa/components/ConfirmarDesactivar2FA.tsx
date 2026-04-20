"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  id_usuario: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ConfirmarDesactivar2FA({ id_usuario, onSuccess, onCancel }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const confirmar = async () => {
    if (!password) {
      setError("Ingresa tu contraseña.");
      return;
    }
    setCargando(true);
    setError("");
    try {
      const response = await fetch("/api/perfil/desactivar-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario, password }),
      });
      const data = await response.json();
      if (response.ok) {
        onSuccess();
      } else {
        setError(data.error || "Contraseña incorrecta.");
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
      {error && <p className="text-red-300/80 text-xs">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={confirmar}
          disabled={cargando}
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