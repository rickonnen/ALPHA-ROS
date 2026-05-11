"use client";
import { useState, useEffect, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { ArrowLeft } from "lucide-react";

interface ResetCodeFormProps {
  email: string;
  onBack: () => void;
  onCodeVerified: () => void;
}

const mask = (e: string) => `${e[0]}***@${e.split("@")[1]}`;

export default function ResetCodeForm({ email, onBack, onCodeVerified }: ResetCodeFormProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [timeLeft, setTimeLeft] = useState(480);
  const [expired, setExpired] = useState(false);
  const [emptyCells, setEmptyCells] = useState<number[]>([]);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timeLeft <= 0) { setExpired(true); return; }
    const t = setInterval(() => setTimeLeft(p => { if (p <= 1) { setExpired(true); return 0; } return p - 1; }), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  function handleChange(index: number, value: string) {
    if (value && !/^\d$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[index] && index > 0)
      inputsRef.current[index - 1]?.focus();
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pasted)) { setError("Pega un código válido de 6 dígitos"); return; }
    setCode(pasted.split(""));
    inputsRef.current[5]?.focus();
  }

  async function handleVerify() {
    const empty = code.map((c, i) => c === "" ? i : -1).filter(i => i !== -1);
    if (empty.length > 0) { setEmptyCells(empty); setError("Completa todos los dígitos del código"); return; }
       setEmptyCells([]);
    if (expired) { setError("El código ha expirado. Solicita uno nuevo."); return; }
       setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.join("") }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Código incorrecto o expirado");
        setCode(["", "", "", "", "", ""]);
        inputsRef.current[0]?.focus();
        return;
      }
      onCodeVerified();
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendTimer > 0) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) { setError("Error al reenviar el código"); return; }
      setCode(["", "", "", "", "", ""]);
      setTimeLeft(600);
      setExpired(false);
      setResendTimer(60);
      inputsRef.current[0]?.focus();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={onBack} disabled={loading} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#B47B65", display: "flex", alignItems: "center" }}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "#1f2937", margin: 0 }}>Verificar código</h2>
      </div>

      {/* Correo enmascarado en dos líneas */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 4px 0" }}>
          Ingresa el código de 6 dígitos que enviamos a
        </p>
        <p style={{ fontSize: "14px", fontWeight: "bold", color: "#1f2937", margin: 0 }}>
          {mask(email)}
        </p>
      </div>

      <label style={{ fontSize: "11px", fontWeight: "600", color: "#374151", textTransform: "uppercase", margin: 0 }}>
        Código de verificación
      </label>

      <div style={{ display: "flex", gap: "6px", justifyContent: "center", width: "100%" }}>
        {code.map((digit, index) => (
          <input
            key={index}
            ref={el => { inputsRef.current[index] = el; }}
            type="text" inputMode="numeric" maxLength={1} value={digit}
            onChange={e => handleChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={loading || expired}
            onFocus={e => e.target.select()}
            style={{
              width: "14%", height: "48px", fontSize: "18px", fontWeight: "bold",
              textAlign: "center",
              border: `2px solid ${emptyCells.includes(index) ? "#ef4444" : digit ? "#C85A4F" : "#d1d5db"}`,
             borderRadius: "8px", outline: "none",
             backgroundColor: emptyCells.includes(index) ? "#fee2e2" : expired ? "#f3f4f6" : "white",
             color: "#1f2937", transition: "all 0.2s",
            }}
          />
        ))}
      </div>

      {!expired && timeLeft > 0 && (
        <p style={{ fontSize: "12px", color: timeLeft <= 30 ? "#ef4444" : "#6b7280", margin: 0, textAlign: "center" }}>
          Código expira en <strong>{fmt(timeLeft)}</strong>
        </p>
      )}
      {expired && <p style={{ fontSize: "12px", color: "#ef4444", margin: 0, textAlign: "center" }}>El código ha expirado. Solicita uno nuevo.</p>}
      {error && <p style={{ color: "#ef4444", fontSize: "13px", textAlign: "center", margin: 0, padding: "8px", backgroundColor: "#fee2e2", borderRadius: "6px" }}>{error}</p>}

      <button onClick={handleVerify} disabled={loading || expired} style={{ width: "100%", backgroundColor: loading || expired ? "#e5a89f" : "#C85A4F", color: "white", fontWeight: "bold", padding: "12px", borderRadius: "6px", border: "none", cursor: loading || expired ? "not-allowed" : "pointer", opacity: loading || expired ? 0.7 : 1, fontSize: "14px" }}>
        {loading ? "Verificando..." : "Verificar código"}
      </button>

      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 8px 0" }}>¿No recibiste el código?</p>
        <button onClick={handleResend} disabled={loading || resendTimer > 0} style={{ width: "100%", backgroundColor: "transparent", color: resendTimer > 0 ? "#9ca3af" : "#C85A4F", fontWeight: "bold", padding: "12px", borderRadius: "6px", border: `2px solid ${resendTimer > 0 ? "#d1d5db" : "#C85A4F"}`, cursor: loading || resendTimer > 0 ? "not-allowed" : "pointer", fontSize: "14px" }}>
          {resendTimer > 0 ? `Reenviar en ${resendTimer}s` : "Reenviar código"}
        </button>
      </div>
    </div>
  );
}