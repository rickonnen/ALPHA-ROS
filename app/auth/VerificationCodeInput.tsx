"use client";
import { useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";

interface VerificationCodeInputProps {
  onCodeChange: (code: string) => void;
  onResendClick: () => void;
  timeRemaining: number;
  isExpired: boolean;
  isLoading: boolean;
  error: string;
}

export default function VerificationCodeInput({
  onCodeChange,
  onResendClick,
  timeRemaining,
  isExpired,
  isLoading,
  error,
}: VerificationCodeInputProps) {
  const [code, setCode] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6); // Solo números, máx 6
    setCode(value);
    onCodeChange(value);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    setCode(pastedText);
    onCodeChange(pastedText);
  };

  // Formatear tiempo en MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Título */}
      <div>
        <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "var(--auth-text)", margin: "0 0 4px 0" }}>
          Verifica tu email
        </h3>
        <p style={{ fontSize: "12px", color: "var(--auth-muted)", margin: 0 }}>
          Ingresá el código de 6 dígitos que te enviamos
        </p>
      </div>

      {/* Input del código */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <input
          type="text"
          inputMode="numeric"
          placeholder="000000"
          value={code}
          onChange={handleInputChange}
          onPaste={handlePaste}
          disabled={isExpired || isLoading}
          maxLength={6}
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: "24px",
            letterSpacing: "8px",
            textAlign: "center",
            fontWeight: "bold",
            fontFamily: "monospace",
            border: `2px solid ${
              isExpired ? "var(--auth-field-error-border)" : error ? "var(--auth-warning)" : "var(--auth-field-border)"
            }`,
            borderRadius: "8px",
            outline: "none",
            backgroundColor: isExpired ? "var(--auth-field-error-bg)" : error ? "var(--auth-warning-soft)" : "var(--auth-field-bg)",
            color: "var(--auth-text)",
            transition: "all 0.2s",
            cursor: isExpired || isLoading ? "not-allowed" : "text",
            opacity: isExpired ? 0.6 : 1,
          }}
        />
      </div>

      {/* Contador regresivo */}
      {!isExpired && timeRemaining > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            color: timeRemaining < 30 ? "var(--auth-danger)" : "var(--auth-muted)",
          }}
        >
          <Clock size={14} />
          <span>
            Código expira en <strong>{formatTime(timeRemaining)}</strong>
          </span>
        </div>
      )}

      {/* Mensaje de expiración */}
      {isExpired && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 12px",
            backgroundColor: "var(--auth-danger-soft)",
            borderRadius: "6px",
            color: "var(--auth-danger)",
            fontSize: "12px",
          }}
        >
          <AlertCircle size={14} />
          <span>El código ha expirado. Solicita uno nuevo.</span>
        </div>
      )}

      {/* Mensaje de error */}
      {error && !isExpired && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 12px",
            backgroundColor: "var(--auth-warning-soft)",
            borderRadius: "6px",
            color: "var(--auth-warning)",
            fontSize: "12px",
          }}
        >
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Botón reenviar */}
      <button
        type="button"
        onClick={onResendClick}
        disabled={!isExpired && timeRemaining > 30}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor:
            !isExpired && timeRemaining > 30 ? "var(--auth-segment)" : "var(--auth-secondary-action)",
          color: !isExpired && timeRemaining > 30 ? "var(--auth-icon)" : "var(--auth-primary-foreground)",
          border: "none",
          borderRadius: "6px",
          fontSize: "12px",
          fontWeight: "600",
          cursor:
            !isExpired && timeRemaining > 30 ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          opacity: !isExpired && timeRemaining > 30 ? 0.5 : 1,
        }}
      >
        {isLoading ? "Reenviando..." : "Reenviar código"}
      </button>
    </div>
  );
}
