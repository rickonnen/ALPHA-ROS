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
        <button onClick={onBack} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#B47B65", display: "flex", alignItems: "center" }}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "#1f2937", margin: 0 }}>Recuperar cuenta</h2>
      </div>
      <p style={{ fontSize: "13px", color: "#6b7280", textAlign: "center", margin: 0 }}>
        Ingresa tu correo y te enviaremos un código de 6 dígitos para restablecer tu contraseña.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={{ fontSize: "11px", fontWeight: "600", color: "#374151", textTransform: "uppercase" }}>Correo electrónico</label>
        <div style={{ display: "flex", alignItems: "center", border: `1px solid ${error ? "#ef4444" : "#d1d5db"}`, borderRadius: "6px", padding: "10px 12px", gap: "10px", backgroundColor: error ? "#fee2e2" : "white" }}>
          <Mail size={18} style={{ color: "#9ca3af" }} />
          <input
            type="email"
            placeholder="usuario@ejemplo.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            style={{ width: "100%", fontSize: "14px", outline: "none", border: "none", backgroundColor: "transparent" }}
          />
        </div>
        {error && <p style={{ color: "#ef4444", fontSize: "12px", margin: 0 }}>{error}</p>}
      </div>
      <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", backgroundColor: loading ? "#e5a89f" : "#C85A4F", color: "white", fontWeight: "bold", padding: "12px", borderRadius: "6px", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontSize: "14px" }}>
        {loading ? "Enviando..." : "Enviar código"}
      </button>
    </div>
  );
}