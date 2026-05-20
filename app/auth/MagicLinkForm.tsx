"use client";
import { useState } from "react";
import { ArrowLeft, Mail, Link2 } from "lucide-react";
import { isValidEmail, getSuspiciousDomainSuggestion } from "@/lib/utils";

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
    if (!isValidEmail(value.trim())) {
      const suggestion = getSuspiciousDomainSuggestion(value.trim());
      if (suggestion) return `Ingresa un correo electrónico válido. ¿Quisiste escribir ${suggestion}?`;
      return "Ingresa un correo válido: gmail.com, outlook.com, hotmail.com, icloud.com, live.com, office365.com, yahoo.com, .edu";
    }
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
          <h2 className="text-[22px] font-extrabold text-slate-900 dark:text-slate-100" style={{ margin: 0 }}>
            Magic Link
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400" style={{ margin: 0 }}>
            Obtén tu enlace mágico
          </p>
        </div>
      </div>

      <hr className="border-t border-[#1F3A4D] dark:border-slate-600" />

      <p className="text-sm text-slate-600 dark:text-slate-300 text-center" style={{ lineHeight: "1.6" }}>
        Ingrese su correo electrónico y recibirá un Enlace Mágico seguro
        para que pueda iniciar sesión
      </p>

      {/* Email field */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Correo electrónico
        </label>
        <div className={`flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 border ${error ? "border-red-500 bg-red-100 dark:bg-red-950/30" : "border-slate-300 bg-white dark:border-slate-600 dark:bg-[#3a3a3a]"}`}>
          <Mail size={18} className="text-slate-400 shrink-0" />
          <input
            type="email"
            placeholder="usuario@correo.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (e.target.value.trim()) {
                const validationError = validateEmail(e.target.value);
                setError(validationError);
              } else {
                setError("");
              }
            }}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            className="w-full text-sm text-slate-900 placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-400 bg-transparent outline-none border-0"
          />
        </div>
        {error && <p style={{ color: "#ef4444", fontSize: "12px", margin: 0 }}>{error}</p>}
      </div>

      {/* Submit button */}
      <button
        type="button"
        disabled={loading || !email.trim() || !isValidEmail(email.trim())}
        onClick={handleSubmit}
        style={{
          width: "100%",
          backgroundColor: (loading || !email.trim() || !isValidEmail(email.trim())) ? "#8B4A3D" : "#C26E5A",
          color: "white",
          fontWeight: "bold",
          fontSize: "15px",
          padding: "13px",
          borderRadius: "8px",
          border: "none",
          cursor: (loading || !email.trim() || !isValidEmail(email.trim())) ? "not-allowed" : "pointer",
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