"use client";
import { useState } from "react";
import { Link2 } from "lucide-react";
import { useAuthListener } from "@/lib/hooks/useAuthListener";

interface MagicLinkSentFormProps {
  email: string;
  onResend: () => void;
}

export default function MagicLinkSentForm({ email, onResend }: MagicLinkSentFormProps) {
  useAuthListener(); // 👂 Pestaña A: escucha MAGIC_LINK_SUCCESS → redirige a /home

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    if (resending || resent) return;
    setResending(true);

    // Nuevo sessionId para el link reenviado
    const newSessionId = crypto.randomUUID();
    localStorage.setItem("magic_link_session_id", newSessionId);
    console.log("[MagicLinkSentForm] Nuevo sessionId para reenvío:", newSessionId.substring(0, 8) + "...");

    try {
      await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sessionId: newSessionId }),
      });
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch {
      // silently fail, user can try again
    } finally {
      setResending(false);
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
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--auth-text)", margin: 0 }}>
            Magic Link
          </h2>
          <p style={{ fontSize: "13px", color: "var(--auth-muted)", margin: 0 }}>
            Revisa tu Correo Electrónico
          </p>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid var(--auth-border)" }} />

      {/* Message */}
      <p style={{ fontSize: "14px", color: "var(--auth-muted)", lineHeight: "1.6", margin: 0 }}>
        Se ha enviado un enlace de verificación a tu dirección de correo
        electrónico:{" "}
        <span style={{ color: "#C26E5A", fontWeight: "600" }}>{email}</span>
      </p>

      {/* Loading dots animation */}
      <div style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
        <div style={{
          width: "60px", height: "60px", borderRadius: "50%",
          border: "2px solid #1F3A4D",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  backgroundColor: "#1F3A4D",
                  animation: "bounce 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Resend button */}
      <button
        type="button"
        disabled={resending}
        onClick={handleResend}
        style={{
          width: "100%",
          backgroundColor: resent ? "#16a34a" : resending ? "#8B4A3D" : "#C26E5A",
          color: "white",
          fontWeight: "bold",
          fontSize: "14px",
          padding: "13px 16px",
          borderRadius: "8px",
          border: "none",
          cursor: resending ? "not-allowed" : "pointer",
          textAlign: "center",
          transition: "background-color 0.3s",
          lineHeight: "1.4",
        }}
      >
        {resent
          ? "✓ Enlace reenviado"
          : resending
          ? "Reenviando..."
          : (
            <>
              ¿Aún no lo has recibido?{" "}
              <strong>Reenviar enlace de verificación</strong>
            </>
          )}
      </button>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}