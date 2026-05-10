"use client";
import { useState } from "react";
import { ArrowLeft, Mail, Link2 } from "lucide-react";

interface MagicLinkFormProps {
  onBack: () => void;
  onSent: (email: string) => void;
}

export default function MagicLinkForm({ onBack, onSent }: MagicLinkFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function validateEmail(value: string) {
    if (!value.trim()) return "El correo es obligatorio";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Ingresa un correo válido";
    return "";
  }

  async function handleSubmit() {
    const validationError = validateEmail(email);
    if (validationError) { setError(validationError); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al enviar el enlace");
        setLoading(false);
        return;
      }
      onSent(email);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "50%",
          backgroundColor: "#1F3A4D",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Link2 size={22} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#1f2937", margin: 0 }}>
            Magic Link
          </h2>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
            Obtén tu enlace mágico
          </p>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #e5e7eb" }} />

      <p style={{ fontSize: "14px", color: "#4b5563", textAlign: "center", lineHeight: "1.6" }}>
        Ingrese su correo electrónico y recibirá un Enlace Mágico seguro
        para que pueda iniciar sesión
      </p>

      {/* Email field */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "11px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Correo electrónico
        </label>
        <div style={{
          display: "flex", alignItems: "center",
          border: `1px solid ${error ? "#ef4444" : "#d1d5db"}`,
          borderRadius: "8px", padding: "10px 14px", gap: "10px",
          backgroundColor: error ? "#fee2e2" : "white",
        }}>
          <Mail size={18} style={{ color: "#9ca3af", flexShrink: 0 }} />
          <input
            type="email"
            placeholder="usuario@correo.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(validateEmail(e.target.value));
            }}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            style={{
              width: "100%", fontSize: "14px",
              outline: "none", border: "none", backgroundColor: "transparent",
            }}
          />
        </div>
        {error && <p style={{ color: "#ef4444", fontSize: "12px", margin: 0 }}>{error}</p>}
      </div>

      {/* Submit button */}
      <button
        type="button"
        disabled={loading}
        onClick={handleSubmit}
        style={{
          width: "100%",
          backgroundColor: loading ? "#e5a89f" : "#C26E5A",
          color: "white",
          fontWeight: "bold",
          fontSize: "15px",
          padding: "13px",
          borderRadius: "8px",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          transition: "background-color 0.2s",
        }}
      >
        {loading ? (
          <>
            <div style={{
              width: "16px", height: "16px",
              border: "2px solid white", borderTop: "2px solid transparent",
              borderRadius: "50%", animation: "spin 0.8s linear infinite",
            }} />
            Enviando...
          </>
        ) : "Enviar link"}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}