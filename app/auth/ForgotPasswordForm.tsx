"use client";
import { useState } from "react";
import { Mail } from "lucide-react";

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
      await res.json();
      if (!res.ok) { setError("Si el correo está registrado, recibirás un código en tu bandeja de entrada."); return; }
      onCodeSent(email);
    } catch {
      setError("Si el correo está registrado, recibirás un código en tu bandeja de entrada.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      width: "100%",
      backgroundColor: "#eae3d9",
      boxSizing: "border-box",
    }}>

      {/* Title block */}
      <h2 style={{ margin: "0 0 2px 0", fontSize: "24px", fontWeight: "700", color: "#1a1a1a" }}>
        Recuperar contraseña
      </h2>
      <p style={{ margin: "0 0 18px 0", fontSize: "13px", color: "#8c8e94", fontWeight: "600" }}>
        Obten tu codigo de 6 Digitos
      </p>

      <hr style={{ border: "none", borderTop: "1px solid #d2c9be", margin: "0 0 24px 0" }} />

      <p style={{ margin: "0 0 24px 0", fontSize: "13px", color: "#6b6b6b", textAlign: "center", lineHeight: "1.6" }}>
        Ingresa tu correo y te enviaremos un código de 6 dígitos para restablecer tu contraseña.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "24px" }}>
        <label style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "#4a4a4a" }}>
          Correo electrónico
        </label>
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          backgroundColor: "#ffffff",
          border: error ? "1.5px solid #ef4444" : "1.5px solid #ccc5bc",
          borderRadius: "6px", padding: "11px 14px",
        }}>
          <Mail size={18} className="text-slate-400" />
          <input
            type="email"
            placeholder="usuario@ejemplo.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full text-sm text-slate-900 placeholder:text-slate-400 bg-transparent outline-none border-0"
          />
        </div>
        {error && <p style={{ color: "#ef4444", fontSize: "12px", margin: 0 }}>{error}</p>}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%",
          backgroundColor: loading ? "#a0564c" : "#8B4A3D",
          color: "white", fontWeight: "bold",
          padding: "13px", borderRadius: "6px", border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1, fontSize: "14px",
          transition: "opacity 0.2s, background-color 0.2s",
        }}
      >
        {loading ? "Enviando..." : "Enviar codigo"}
      </button>
    </div>
  );
}