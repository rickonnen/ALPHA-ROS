"use client";
import { useState, useEffect, useRef } from "react";

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  on2FARequired?: (userId: string) => void;
}

const POST_AUTH_REDIRECT_KEY = "postAuthRedirect";

function getPostAuthRedirect(): string {
  if (typeof window === "undefined") return "/";
  return sessionStorage.getItem(POST_AUTH_REDIRECT_KEY) || "/";
}

function consumePostAuthRedirect(): string {
  if (typeof window === "undefined") return "/";
  const redirectTarget = sessionStorage.getItem(POST_AUTH_REDIRECT_KEY) || "/";
  sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY);
  return redirectTarget;
}

export default function GoogleSignInButton({
  onSuccess,
  onCancel,
  on2FARequired,
}: GoogleSignInButtonProps) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [blockedByConnection, setBlockedByConnection] = useState(false);
  const [error, setError] = useState("");
  const popupRef = useRef<Window | null>(null);
  const checkPopupRef = useRef<NodeJS.Timeout | null>(null);

  async function checkInternetConnection() {
    if (!navigator.onLine) return false;
    try {
      await fetch("https://www.google.com", { mode: "no-cors" });
      return true;
    } catch {
      return false;
    }
  }

  async function handleGoogleSignIn() {
    if (googleLoading) return;

    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      setError("Hubo un problema de conexión, inténtalo de nuevo");
      setBlockedByConnection(true);
      return;
    }

    setGoogleLoading(true);
    setError("");

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      `/api/auth/signin/google?callbackUrl=${encodeURIComponent(getPostAuthRedirect())}`,
      "Google Login",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=no`
    );

    popupRef.current = popup;

    checkPopupRef.current = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(checkPopupRef.current!);
        setGoogleLoading(false);

        fetch("/api/auth/session")
          .then((res) => res.json())
          .then(async (session) => {
            if (session?.user) {
              try {
                const check2FARes = await fetch("/api/auth/check-2fa-status");
                if (check2FARes.ok) {
                  const { requires2FA, userId } = await check2FARes.json();

                  if (requires2FA && userId && on2FARequired) {
                    on2FARequired(userId);
                    return;
                  }
                }
              } catch (error) {
                console.error("[GoogleSignInButton] Error verificando 2FA:", error);
              }

              if (onSuccess) onSuccess();
              window.location.href = consumePostAuthRedirect();
            } else {
              setError("Inicio de sesión cancelado");
              if (onCancel) onCancel();
            }
          })
          .catch(() => {
            setError("Hubo un problema de conexión, inténtalo de nuevo");
          });
      }
    }, 500);
  }

  useEffect(() => {
    return () => {
      if (checkPopupRef.current) clearInterval(checkPopupRef.current);
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <button
        type="button"
        disabled={googleLoading || blockedByConnection}
        onClick={handleGoogleSignIn}
        style={{
          width: "100%",
          backgroundColor: googleLoading || blockedByConnection ? "#9ca3af" : "#1C3445",
          color: "white",
          fontWeight: "bold",
          padding: "12px",
          borderRadius: "8px",
          border: "none",
          cursor: googleLoading || blockedByConnection ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          opacity: googleLoading || blockedByConnection ? 0.6 : 1,
        }}
      >
        {googleLoading ? (
          <div style={{
            width: "18px",
            height: "18px",
            border: "2px solid white",
            borderTop: "2px solid transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        {googleLoading ? "Conectando..." : "Continuar con Google"}
      </button>

      {error && (
        <p style={{ color: "#ef4444", fontSize: "12px", textAlign: "center" }}>
          {error}
        </p>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
