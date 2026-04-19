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
  const [hovVerificar, setHovVerificar] = useState(false);
  const [hovCancelar, setHovCancelar] = useState(false);

  // Paleta existente del proyecto
  const CREAM_BG   = "#F4EFE6"; 
  const DARK_BLUE  = "#1F3A4D"; 
  const TERRACOTTA = "#C26E5A"; 
  const INPUT_BG   = "#4a6878";  
  const MUTED_TEXT = "#5a7a8a"; 
  // 

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
        body: JSON.stringify({ userId, codigo }),
      });
      const data = await response.json();
      if (response.ok) {
        onSuccess();
      } else {
        setError(data.error || "Código inválido");
        setCodigo("");
      }
    } catch {
      setError("Error al verificar código");
    } finally {
      setCargando(false);
    }
  };

  const btnStyle = (hovered: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "12px 0",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 0.15s, border-color 0.15s, color 0.15s",
    background: hovered ? TERRACOTTA : "transparent",
    border: `2px solid ${hovered ? TERRACOTTA : DARK_BLUE}`,
    color: hovered ? "white" : DARK_BLUE,
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
    >
      <div
        style={{
          background: CREAM_BG,
          borderRadius: 20,
          width: "100%",
          maxWidth: 430,
          padding: "32px 32px 28px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              background: INPUT_BG,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
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

        {/* Separador */}
        <div
          style={{
            borderBottom: `1px solid ${DARK_BLUE}30`,
            marginBottom: 18,
          }}
        />

        {/* Instrucción */}
        <p style={{ margin: "0 0 18px", fontSize: 14, color: DARK_BLUE, lineHeight: 1.6 }}>
          Ingresa el código de 6 dígitos de tu Google Authenticator o app de autenticación
        </p>

        {/* Input */}
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={codigo}
          onChange={(e) => {
            setCodigo(e.target.value.replace(/\D/g, ""));
            setError("");
          }}
          placeholder="0 0 0 0 0 0"
          autoFocus
          disabled={cargando}
          className="otp-input"
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: INPUT_BG,
            border: "none",
            borderRadius: 12,
            padding: "15px 0",
            fontSize: 22,
            fontFamily: "monospace",
            letterSpacing: "0.5em",
            color: "white",
            textAlign: "center",
            marginBottom: error ? 8 : 20,
            outline: "none",
          }}
        />

        {/* Error */}
        {error && (
          <p style={{ color: TERRACOTTA, fontSize: 13, textAlign: "center", margin: "0 0 16px" }}>
            {error}
          </p>
        )}

        {/* Botones */}
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          <button
            onClick={handleVerifyOTP}
            disabled={cargando || codigo.length !== 6}
            onMouseEnter={() => setHovVerificar(true)}
            onMouseLeave={() => setHovVerificar(false)}
            style={{
              ...btnStyle(hovVerificar),
              opacity: cargando || codigo.length !== 6 ? 0.45 : 1,
              cursor: cargando || codigo.length !== 6 ? "not-allowed" : "pointer",
            }}
          >
            {cargando ? "Verificando..." : "Verificar"}
          </button>
          <button
            onClick={onCancel}
            disabled={cargando}
            onMouseEnter={() => setHovCancelar(true)}
            onMouseLeave={() => setHovCancelar(false)}
            style={btnStyle(hovCancelar)}
          >
            Cancelar
          </button>
        </div>

        {/* Hint */}
        <p style={{ textAlign: "center", fontSize: 12, color: TERRACOTTA, margin: 0 }}>
          El código cambia cada 30 segundos
        </p>
      </div>
    </div>
  );
}