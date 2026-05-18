"use client";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";

interface ForgotPasswordFormProps {
  onBack: () => void;
  onCodeSent: (email: string) => void;
}

export default function ForgotPasswordForm({ onBack, onCodeSent }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function validateEmail(value: string) {
    if (!value.trim()) return "Este campo es obligatorio";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Ingresa un correo válido";
    return "";
  }

  async function handleSubmit() {
    const validationError = validateEmail(email);
    if (validationError) { setError(validationError); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError("Si el correo está registrado, recibirás un código en tu bandeja de entrada."); return; }
      onCodeSent(email);
    } catch {
      setError("Si el correo está registrado, recibirás un código en tu bandeja de entrada.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={onBack} className="bg-transparent border-none cursor-pointer text-[#B47B65] flex items-center">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-[22px] font-bold text-slate-900 dark:text-slate-100" style={{ margin: 0 }}>Recuperar cuenta</h2>
      </div>
      <p className="text-[13px] text-slate-500 dark:text-slate-400 text-center" style={{ margin: 0 }}>
        Ingresa tu correo y te enviaremos un código de 6 dígitos para restablecer tu contraseña.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label className="text-[11px] font-semibold uppercase text-slate-700 dark:text-slate-300">Correo electrónico</label>
        <div className={`flex items-center gap-2.5 rounded-md px-3 py-2 border ${error ? "border-red-500 bg-red-100 dark:bg-red-950/30" : "border-slate-300 bg-white dark:border-slate-600 dark:bg-[#3a3a3a]"}`}>
          <Mail size={18} className="text-slate-400" />
          <input
            type="email"
            placeholder="usuario@ejemplo.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full text-sm text-slate-900 placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-400 bg-transparent outline-none border-0"
          />
        </div>
        {error && <p style={{ color: "#ef4444", fontSize: "12px", margin: 0 }}>{error}</p>}
      </div>
      <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", backgroundColor: loading ? "#8B4A3D" : "#C85A4F", color: "white", fontWeight: "bold", padding: "12px", borderRadius: "6px", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontSize: "14px" }}>
        {loading ? "Enviando..." : "Enviar código"}
      </button>
    </div>
  );
}