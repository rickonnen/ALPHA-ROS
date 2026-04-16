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
        <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#1f2937", margin: "0 0 4px 0" }}>
          Verifica tu email
        </h3>
        <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
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
              isExpired ? "#ef4444" : error ? "#f97316" : "#d1d5db"
            }`,
            borderRadius: "8px",
            outline: "none",
            backgroundColor: isExpired ? "#fee2e2" : error ? "#fef3c7" : "white",
            color: "#1f2937",
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
            color: timeRemaining < 30 ? "#ef4444" : "#6b7280",
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
            backgroundColor: "#fee2e2",
            borderRadius: "6px",
            color: "#dc2626",
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
            backgroundColor: "#fef3c7",
            borderRadius: "6px",
            color: "#b45309",
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
            !isExpired && timeRemaining > 30 ? "#e5e7eb" : "#C85A4F",
          color: !isExpired && timeRemaining > 30 ? "#9ca3af" : "white",
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
