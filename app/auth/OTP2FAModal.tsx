"use client";

import { useState, useEffect, useRef } from "react";
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
  const [bloqueado, setBloqueado] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const [intentosRestantes, setIntentosRestantes] = useState(5);
  const intervaloRef = useRef<NodeJS.Timeout | null>(null);
 

  // Paleta existente del proyecto
  const CREAM_BG   = "#F4EFE6"; 
  const DARK_BLUE  = "#1F3A4D"; 
  const TERRACOTTA = "#C26E5A"; 
  const INPUT_BG   = "#4a6878";  
  const MUTED_TEXT = "#5a7a8a"; 
  // 

  // Countdown automático cada segundo cuando está bloqueado
  useEffect(() => {
    if (bloqueado && segundosRestantes > 0) {
      intervaloRef.current = setInterval(() => {
        setSegundosRestantes((prev) => {
          if (prev <= 1) {
            clearInterval(intervaloRef.current!);
            setBloqueado(false);
            setIntentosRestantes(5);
            setError("");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, [bloqueado, segundosRestantes]);

  const handleVerifyOTP = async () => {
    if (codigo.length !== 6) {
      setError("Ingresa un código de 6 dígitos");
      return;
    }
    
    if (!userId || userId.trim() === "") {
      setError("ID de usuario inválido");
      console.error("[2FA Modal] userId vacío:", userId);
      return;
    }

    setCargando(true);
    setError("");
    
    console.log(`[2FA Modal] Verificando 2FA para usuario: ${userId}, código: ${codigo.substring(0, 3)}...`);
    
    try {
      const response = await fetch("/api/auth/verify-2fa-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, codigo }),
      });
      
      console.log(`[2FA Modal] Response status: ${response.status}`);
      
      const data = await response.json();
      
      console.log(`[2FA Modal] Response data:`, data);
      
      // Manejar bloqueo 
      if (response.status === 429 || data.bloqueado) {
        setBloqueado(true);
        setSegundosRestantes(data.segundosRestantes ?? 60);
        setCodigo("");
        setError("");
        return;
      }
      if (response.ok) {
        console.log(`[2FA Modal] ✓ Verificación exitosa`);
        onSuccess();
      } else {
        console.error(`[2FA Modal] Error en respuesta:`, data);
        // Mostrar intentos restantes si el backend los devuelve
        if (data.intentosRestantes !== undefined) {
          setIntentosRestantes(data.intentosRestantes);
          setError(
            data.intentosRestantes > 0
              ? `Código inválido. Te quedan ${data.intentosRestantes} intento${data.intentosRestantes !== 1 ? "s" : ""}.`
              : "Código inválido."
          );
        } else {
          setError(data.error || "Código inválido");
        }
        setCodigo("");
      }
    } catch (error) {
      console.error("[2FA Modal] Error en fetch:", error);
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

        {/* Banner de bloqueo */}
        {bloqueado && (
          <div
            style={{
              background: `${TERRACOTTA}cc`,
              border: `1px solid ${TERRACOTTA}`,
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 13,
              color: "white",
              textAlign: "center",
              marginBottom: 14,
            }}
          >
            Demasiados intentos fallidos. Espera{" "}
            <span style={{ fontWeight: 700 }}>{segundosRestantes}s</span>{" "}
            antes de intentar de nuevo.
          </div>
        )}
 
        {/* Intentos restantes */}
        {!bloqueado && intentosRestantes < 5 && intentosRestantes > 0 && (
          <p style={{ color: TERRACOTTA, fontSize: 12, textAlign: "center", margin: "0 0 10px" }}>
            ⚠ Te quedan {intentosRestantes} intento{intentosRestantes !== 1 ? "s" : ""}.
          </p>
        )}

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
          disabled={cargando || bloqueado}
          className="otp-input"
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: bloqueado ? `${INPUT_BG}66` : INPUT_BG,
            border: "none",
            borderRadius: 12,
            padding: "15px 0",
            fontSize: 22,
            fontFamily: "monospace",
            letterSpacing: "0.5em",
            color: bloqueado ? "rgba(255,255,255,0.35)" : "white",
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
              opacity: cargando || codigo.length !== 6 || bloqueado ? 0.45 : 1,
              cursor: cargando || codigo.length !== 6 || bloqueado ? "not-allowed" : "pointer",
            }}
          >
            {cargando ? "Verificando..." : bloqueado ? `Bloqueado (${segundosRestantes}s)` : "Verificar"}
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