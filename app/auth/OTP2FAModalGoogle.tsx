"use client";

import { useState, useRef } from "react";
import { Lock } from "lucide-react";

interface OTP2FAModalGoogleProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function OTP2FAModalGoogle({ onSuccess, onCancel }: OTP2FAModalGoogleProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [hovVerificar, setHovVerificar] = useState(false);
  const [hovCancelar, setHovCancelar] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const CREAM_BG = "#F4EFE6";
  const DARK_BLUE = "#1F3A4D";
  const TERRACOTTA = "#C26E5A";
  const INPUT_BG = "#4a6878";
  const MUTED_TEXT = "#5a7a8a";

  const codigo = digits.join("");

  const handleChange = (index: number, value: string) => {
    const val = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = val;
    setDigits(newDigits);
    setError("");
    if (val && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      } else if (index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newDigits = ["", "", "", "", "", ""];
    pasted.split("").forEach((char, i) => { newDigits[i] = char; });
    setDigits(newDigits);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    if (codigo.length !== 6 || cargando) return;
    setCargando(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ codigo }),
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess();
      } else {
        setError(data.error || "Código inválido");
        setDigits(["", "", "", "", "", ""]);
        setTimeout(() => inputs.current[0]?.focus(), 50);
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: 16,
    }}>
      <div style={{
        background: CREAM_BG,
        borderRadius: 20,
        width: "100%",
        maxWidth: 430,
        padding: "32px 32px 28px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <div style={{
            width: 46, height: 46, borderRadius: "50%",
            background: INPUT_BG,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Lock size={20} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: DARK_BLUE }}>
              Autenticacion 2FA
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: MUTED_TEXT }}>
              Abre tu app de autenticación
            </p>
          </div>
        </div>

        <div style={{ borderBottom: `1px solid ${DARK_BLUE}30`, marginBottom: 18 }} />

        <p style={{ margin: "0 0 18px", fontSize: 14, color: DARK_BLUE, lineHeight: 1.6 }}>
          Ingresa el código de 6 dígitos de tu Google Authenticator o app de autenticación
        </p>

        {/* 6 inputs */}
{digits.map((digit, i) => (
  <input
    key={i}
    ref={(el) => { inputs.current[i] = el; }}
    type="text"
    inputMode="numeric"
    maxLength={1}
    value={digit}
    onChange={(e) => handleChange(i, e.target.value)}
    onKeyDown={(e) => handleKeyDown(i, e)}
    onPaste={handlePaste}
    disabled={cargando}
    autoFocus={i === 0}
    title={`Dígito ${i + 1}`}
    aria-label={`Dígito ${i + 1} del código 2FA`}
    placeholder="0"
    style={{
      width: 52,
      height: 60,
      background: INPUT_BG,
      border: digit ? `2px solid ${DARK_BLUE}` : "2px solid transparent",
      borderRadius: 10,
      fontSize: 24,
      fontWeight: 700,
      color: "white",
      textAlign: "center",
      outline: "none",
      caretColor: "transparent",
      cursor: "text",
    }}
  />
))}
        {error && (
          <p style={{ color: TERRACOTTA, fontSize: 13, textAlign: "center", margin: "0 0 16px" }}>
            {error}
          </p>
        )}

        {/* Botones */}
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          <button
            onClick={handleVerify}
            disabled={cargando || codigo.length !== 6}
            onMouseEnter={() => setHovVerificar(true)}
            onMouseLeave={() => setHovVerificar(false)}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: cargando || codigo.length !== 6 ? "not-allowed" : "pointer",
              background: hovVerificar && codigo.length === 6 ? TERRACOTTA : "transparent",
              border: `2px solid ${hovVerificar && codigo.length === 6 ? TERRACOTTA : DARK_BLUE}`,
              color: hovVerificar && codigo.length === 6 ? "white" : DARK_BLUE,
              opacity: cargando || codigo.length !== 6 ? 0.45 : 1,
              transition: "all 0.15s",
            }}
          >
            {cargando ? "Verificando..." : "Verificar"}
          </button>
          <button
            onClick={onCancel}
            disabled={cargando}
            onMouseEnter={() => setHovCancelar(true)}
            onMouseLeave={() => setHovCancelar(false)}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              background: hovCancelar ? "#16303f" : DARK_BLUE,
              border: `2px solid ${DARK_BLUE}`,
              color: "white",
              transition: "all 0.15s",
            }}
          >
            Cancelar
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: TERRACOTTA, margin: 0 }}>
          El código cambia cada 30 segundos
        </p>
      </div>
    </div>
  );
}