/* HU-04
   CA-3:  Banner "Tu cuenta está desactivada" al intentar login
   CA-24: Modal de reactivación al presionar "¿Deseas reactivar tu cuenta?"
*/
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import SuccessModal from "./SuccessModal";
import OTP2FAModal from "./OTP2FAModal";
import { useAuth } from "./AuthContext";

import { SignInFacebook } from "./FacebookSignInButton";
import { SignInDiscord } from "./DiscordSignInButton";
import { SignInLinkedIn } from "./LinkedInSignInButton"

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onClose?: () => void;
  onForgotPassword?: () => void;
  onMagicLink?: () => void;
}

interface LoginTelemetry {
  latitud: number | null;
  longitud: number | null;
}

const GOOGLE_TELEMETRY_PENDING_KEY = "google_telemetry_pending";
const GOOGLE_TELEMETRY_LAT_KEY = "google_telemetry_latitud";
const GOOGLE_TELEMETRY_LNG_KEY = "google_telemetry_longitud";
const GOOGLE_TELEMETRY_CREATED_AT_KEY = "google_telemetry_created_at";
const POST_AUTH_REDIRECT_KEY = "postAuthRedirect";

function consumePostAuthRedirect(): string | null {
  if (typeof window === "undefined") return null;
  const redirectTarget = sessionStorage.getItem(POST_AUTH_REDIRECT_KEY);
  if (redirectTarget) {
    sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY);
  }
  return redirectTarget;
}

function getPostAuthRedirect(): string {
  if (typeof window === "undefined") return "/";
  return sessionStorage.getItem(POST_AUTH_REDIRECT_KEY) || "/";
}

async function checkInternetConnection() {
  if (!navigator.onLine) return false;
  try {
    await fetch("https://www.google.com", { mode: "no-cors" });
    return true;
  } catch {
    return false;
  }
}

export default function LoginForm({ onSwitchToRegister, onClose, onForgotPassword, onMagicLink }: LoginFormProps) {
  const router = useRouter();
  const { login, fetchUserFromServer } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [hasInternet, setHasInternet] = useState(true);
  const [blockedByConnection, setBlockedByConnection] = useState(false);
  const [userRol, setUserRol] = useState<number | null>(null);

  // HU-04 CA-3: banner cuenta desactivada
  const [cuentaDesactivada, setCuentaDesactivada] = useState(false);
  // HU-04 CA-24: modal de reactivación
  const [modalReactivar, setModalReactivar] = useState(false);
  // Estados para reactivación directa
  const [reactivating, setReactivating] = useState(false);
  const [reactivateError, setReactivateError] = useState("");
  const [reactivateSuccess, setReactivateSuccess] = useState(false);

  // Estados para 2FA Modal
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [pending2FAUserId, setPending2FAUserId] = useState("");

  function validateField(field: string, value: string) {
    const newErrors = { ...errors };
    if (field === "email") {
      if (!value.trim()) {
        newErrors.email = "El correo es obligatorio";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = "Ingresa un correo electrónico válido";
      } else {
        delete newErrors.email;
      }
    }
    if (field === "password") {
      if (!value) {
        newErrors.password = "La contraseña es obligatoria";
      } else {
        delete newErrors.password;
      }
    }
    setErrors(newErrors);
  }

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!email.trim())
      newErrors.email = "El correo es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Ingresa un correo electrónico válido";
    if (!password)
      newErrors.password = "La contraseña es obligatoria";
    return newErrors;
  }

  function isFormValid() {
    return email.trim() !== "" && password !== "" && Object.keys(errors).length === 0;
  }

  function getLoginTelemetry(): Promise<LoginTelemetry> {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      return Promise.resolve({ latitud: null, longitud: null });
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitud: position.coords.latitude,
            longitud: position.coords.longitude,
          });
        },
        () => {
          resolve({ latitud: null, longitud: null });
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  function savePendingGoogleTelemetry(telemetry: LoginTelemetry) {
    sessionStorage.setItem(GOOGLE_TELEMETRY_PENDING_KEY, "1");
    sessionStorage.setItem(
      GOOGLE_TELEMETRY_LAT_KEY,
      telemetry.latitud === null ? "null" : String(telemetry.latitud)
    );
    sessionStorage.setItem(
      GOOGLE_TELEMETRY_LNG_KEY,
      telemetry.longitud === null ? "null" : String(telemetry.longitud)
    );
    sessionStorage.setItem(
      GOOGLE_TELEMETRY_CREATED_AT_KEY,
      String(Date.now())
    );
  }

  function clearPendingGoogleTelemetry() {
    sessionStorage.removeItem(GOOGLE_TELEMETRY_PENDING_KEY);
    sessionStorage.removeItem(GOOGLE_TELEMETRY_LAT_KEY);
    sessionStorage.removeItem(GOOGLE_TELEMETRY_LNG_KEY);
    sessionStorage.removeItem(GOOGLE_TELEMETRY_CREATED_AT_KEY);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setGeneralError("");
    setCuentaDesactivada(false);
    setLoading(true);
    try {
      const telemetry = await getLoginTelemetry();
      await login(email, password, telemetry);
      const resMe = await fetch("/api/auth/me");
      if (resMe.ok) {
        const dataMe = await resMe.json();
        setUserRol(dataMe.user.rol);
      }
      setShowSuccess(true);
    } catch (err: any) {
      // NUEVO: Detectar error de 2FA requerido
      if (err.requiresOTP && err.userId) {
        setPending2FAUserId(err.userId);
        setShow2FAModal(true);
        setLoading(false);
        return;
      }
      // Manejo de cuenta desactivada
      if (err.code === "ACCOUNT_DISABLED") {
        setCuentaDesactivada(true);
        setGeneralError("");
      } else {
        setGeneralError(err.message || "Ocurrió un error. Intentá de nuevo.");
        setErrors(prev => ({ ...prev, password: "incorrect" }));
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSuccessClose() {
    setShowSuccess(false);
    if (onClose) onClose();
    if (userRol === 1) {
      router.push("/admin");
      return;
    }
    router.push(consumePostAuthRedirect() || "/");
  }

  const googleClickedRef = useRef(false);

  useEffect(() => {
    async function verifyConnection() {
      const isConnected = await checkInternetConnection();
      setHasInternet(isConnected);
      if (!isConnected) setGeneralError("No tienes conexión a internet");
    }
    verifyConnection();
    const handleOffline = () => {
      setHasInternet(false);
      setGeneralError("No tienes conexión a internet");
    };
    const handleOnline = () => {
      setHasInternet(true);
      setGeneralError("");
      setBlockedByConnection(false);
    };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  async function handleGoogleSignIn() {
    if (googleClickedRef.current) return;
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      setGeneralError("No tienes conexión a internet");
      setBlockedByConnection(true);
      return;
    }
    googleClickedRef.current = true;
    setGoogleLoading(true);
    try {
      const telemetry = await getLoginTelemetry();
      savePendingGoogleTelemetry(telemetry);
      await signIn("google", {
        callbackUrl: `/google-auth-check?redirect=${encodeURIComponent(getPostAuthRedirect())}`,
      });
    } catch (error) {
      clearPendingGoogleTelemetry();
      googleClickedRef.current = false;
      setGoogleLoading(false);
    }
  }

  // Función para reactivar la cuenta directamente
  async function handleDirectReactivation() {
    if (!email || reactivating) return;
    
    setReactivating(true);
    setReactivateError("");
    
    try {
      const response = await fetch("/api/auth/reactivate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setReactivateSuccess(true);
        setTimeout(() => {
          setModalReactivar(false);
          setReactivateSuccess(false);
          setCuentaDesactivada(false);
          setGeneralError("");
          setPassword("");
        }, 2000);
      } else {
        setReactivateError(data.error || "Error al reactivar la cuenta");
      }
    } catch (error) {
      setReactivateError("Error de conexión. Verifica tu internet e intenta nuevamente.");
    } finally {
      setReactivating(false);
    }
  }

  // NUEVO: Manejo de 2FA exitoso
  async function handle2FASuccess() {
    setShow2FAModal(false);
    setPending2FAUserId("");
    // Refrescar el usuario desde el servidor
    const success = await fetchUserFromServer();
    if (success) {
      const resMe = await fetch("/api/auth/me");
      if (resMe.ok) {
        const dataMe = await resMe.json();
        setUserRol(dataMe.user.rol);
      }
      setShowSuccess(true);
    } else {
      setGeneralError("Error al cargar tu usuario después de 2FA");
    }
  }

  // NUEVO: Cancelar modal 2FA
  function handle2FACancel() {
    setShow2FAModal(false);
    setPending2FAUserId("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      <div>
        <h2 style={{ fontSize: "28px", fontWeight: "bold", color: "#1f2937", marginBottom: "4px" }}>
          Bienvenido de vuelta
        </h2>
      </div>

      {/* HU-04 CA-3: Banner cuenta desactivada */}
      {cuentaDesactivada && (
        <div style={{
          backgroundColor: "#FDF0ED",
          border: "1px solid #C26E5A55",
          borderRadius: "10px",
          padding: "14px 16px",
          display: "flex",
          gap: "12px",
          alignItems: "flex-start",
        }}>
          <div style={{
            backgroundColor: "#C26E5A22",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: "2px",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C26E5A" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <p style={{ fontSize: "13px", fontWeight: "700", color: "#C26E5A", margin: 0 }}>
              Tu cuenta está desactivada
            </p>
            <p style={{ fontSize: "12px", color: "#2E2E2E", margin: 0, lineHeight: "1.5" }}>
              No puedes iniciar sesión porque tu cuenta fue desactivada.
              Para recuperar el acceso, comunícate con nuestro equipo de soporte técnico.
            </p>
            {/* CA-24: enlace para abrir modal de reactivación */}
            <button
              type="button"
              onClick={() => setModalReactivar(true)}
              style={{
                fontSize: "12px",
                color: "#1F3A4D",
                backgroundColor: "transparent",
                border: "none",
                padding: "4px 0 0 0",
                fontWeight: "600",
                cursor: "pointer",
                textDecoration: "underline",
                textAlign: "left",
              }}
            >
              ¿Deseas reactivar tu cuenta? Presiona aquí.
            </button>
          </div>
        </div>
      )}

      {/* HU-04 CA-24: Modal de reactivación directa */}
      {modalReactivar && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(2px)",
          }}
          onClick={() => !reactivating && !reactivateSuccess && setModalReactivar(false)}
        >
          <div
            style={{
              backgroundColor: "#F4EFE6",
              borderRadius: "16px",
              padding: "28px 24px",
              width: "100%",
              maxWidth: "400px",
              margin: "0 16px",
              position: "relative",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón X - solo si no está en proceso */}
            {!reactivating && !reactivateSuccess && (
              <button
                onClick={() => setModalReactivar(false)}
                style={{
                  position: "absolute",
                  top: "14px",
                  right: "16px",
                  background: "transparent",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#2E2E2E",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            )}

            {/* Estado de éxito */}
            {reactivateSuccess ? (
              <>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                  <div style={{
                    backgroundColor: "#4CAF5022",
                    borderRadius: "50%",
                    width: "52px",
                    height: "52px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2.5">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: "800",
                  color: "#2E2E2E",
                  textAlign: "center",
                  margin: "0 0 8px 0",
                }}>
                  ¡Cuenta reactivada!
                </h3>
                <p style={{
                  fontSize: "13px",
                  color: "#2E2E2E99",
                  textAlign: "center",
                  margin: "0 0 16px 0",
                  lineHeight: "1.6",
                }}>
                  Tu cuenta ha sido reactivada exitosamente. Ya puedes iniciar sesión.
                </p>
              </>
            ) : (
              <>
                {/* Ícono */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                  <div style={{
                    backgroundColor: "#1F3A4D22",
                    borderRadius: "50%",
                    width: "52px",
                    height: "52px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1F3A4D" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                </div>

                {/* Título */}
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: "800",
                  color: "#2E2E2E",
                  textAlign: "center",
                  margin: "0 0 8px 0",
                }}>
                  Reactivar cuenta
                </h3>

                {/* Descripción */}
                <p style={{
                  fontSize: "13px",
                  color: "#2E2E2E99",
                  textAlign: "center",
                  margin: "0 0 16px 0",
                  lineHeight: "1.6",
                }}>
                  Tu cuenta está desactivada. ¿Deseas reactivarla ahora?
                </p>

                {/* Info del correo */}
                <div style={{
                  backgroundColor: "#E7E1D7",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  marginBottom: "20px",
                  fontSize: "12px",
                  color: "#2E2E2E",
                  lineHeight: "1.6",
                }}>
                  <strong>Correo:</strong> {email}
                  <br />
                  Al reactivar tu cuenta, recuperarás acceso a todas las funcionalidades.
                </div>

                {/* Mensaje de error */}
                {reactivateError && (
                  <p style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    textAlign: "center",
                    marginBottom: "16px",
                    padding: "8px",
                    backgroundColor: "#fee2e2",
                    borderRadius: "6px",
                  }}>
                    {reactivateError}
                  </p>
                )}

                {/* Botones */}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => setModalReactivar(false)}
                    disabled={reactivating}
                    style={{
                      flex: 1,
                      padding: "11px",
                      borderRadius: "8px",
                      border: "1px solid #1F3A4D44",
                      backgroundColor: "transparent",
                      color: "#1F3A4D",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: reactivating ? "not-allowed" : "pointer",
                      opacity: reactivating ? 0.5 : 1,
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDirectReactivation}
                    disabled={reactivating}
                    style={{
                      flex: 1,
                      padding: "11px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: reactivating ? "not-allowed" : "pointer",
                      opacity: reactivating ? 0.7 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    {reactivating ? (
                      <>
                        <div style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid white",
                          borderTop: "2px solid transparent",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }} />
                        Reactivando...
                      </>
                    ) : (
                      "Reactivar cuenta"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Botón Google */}
      <button
        type="button"
        disabled={loading || googleLoading || blockedByConnection}
        onClick={handleGoogleSignIn}
        style={{
          width: "100%",
          backgroundColor: blockedByConnection || googleLoading ? "#9ca3af" : "#1C3445",
          cursor: blockedByConnection || googleLoading ? "not-allowed" : "pointer",
          opacity: blockedByConnection ? 0.5 : googleLoading ? 0.6 : 1,
          color: "white",
          fontWeight: "bold",
          padding: "12px",
          borderRadius: "8px",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "16px",
          pointerEvents: googleLoading ? "none" : "auto",
        }}
      >
        {googleLoading ? (
          <div style={{
            width: "18px", height: "18px",
            border: "2px solid white", borderTop: "2px solid transparent",
            borderRadius: "50%", animation: "spin 0.8s linear infinite",
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

      {/* Magic Link button */}
      {onMagicLink && (
        <button
          type="button"
          disabled={loading}
          onClick={onMagicLink}
          style={{
            width: "100%",
            backgroundColor: "#1C3445",
            color: "white",
            fontWeight: "bold",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "16px",
            cursor: "pointer",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          Continuar con Magic Link
        </button>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "11px", fontWeight: "600", color: "#374151", textTransform: "uppercase" }}>
            Correo electrónico
          </label>
          <div style={{
            display: "flex", alignItems: "center",
            border: `1px solid ${errors.email ? "#ef4444" : "#d1d5db"}`,
            borderRadius: "6px", padding: "10px 12px", gap: "10px",
            backgroundColor: errors.email ? "#fee2e2" : "white",
          }}>
            <Mail size={18} style={{ color: "#9ca3af" }} />
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateField("email", e.target.value);
                if (cuentaDesactivada) setCuentaDesactivada(false);
              }}
              style={{ width: "100%", fontSize: "14px", outline: "none", border: "none", backgroundColor: "transparent" }}
            />
          </div>
          {errors.email && <p style={{ color: "#ef4444", fontSize: "12px" }}>{errors.email}</p>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "11px", fontWeight: "600", color: "#374151", textTransform: "uppercase" }}>
            Contraseña
          </label>
          <div style={{
            display: "flex", alignItems: "center",
            border: `1px solid ${errors.password ? "#ef4444" : "#d1d5db"}`,
            borderRadius: "6px", padding: "10px 12px", gap: "10px",
            backgroundColor: errors.password ? "#fee2e2" : "white",
          }}>
            <Lock size={18} style={{ color: "#9ca3af" }} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validateField("password", e.target.value);
                if (cuentaDesactivada) setCuentaDesactivada(false);
              }}
              style={{ flex: 1, fontSize: "14px", outline: "none", border: "none", backgroundColor: "transparent" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ backgroundColor: "transparent", border: "none", padding: "0", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center" }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
         {errors.password && errors.password !== "incorrect" && <p style={{ color: "#ef4444", fontSize: "12px" }}>{errors.password}</p>}
         {generalError && (
           <p style={{ color: "#ef4444", fontSize: "12px", textAlign: "left" }}>{generalError}</p>
         )}
        </div>

        <div style={{ textAlign: "right" }}>
          <button
            type="button"
             onClick={onForgotPassword}
            style={{ fontSize: "12px", color: "#6b7280", backgroundColor: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" }}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || !isFormValid()}
          style={{
            width: "100%",
            backgroundColor: loading || !isFormValid() ? "#e5a89f" : "#C26E5A",
            color: "white",
            fontWeight: "bold",
            padding: "12px",
            borderRadius: "6px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1,
            marginTop: "8px",
          }}
        >
          {loading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>

           <div style={{ textAlign: "center", marginTop: "16px" }}>
              <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "12px" }}>
                  Acceso rápido con
              </p>

                 <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
                  <SignInFacebook />
                  <SignInDiscord />
                  <SignInLinkedIn />
                    </div>
           </div>
      </form>

      <SuccessModal
        isOpen={showSuccess}
        message="¡Sesión iniciada exitosamente! Bienvenido."
        onClose={handleSuccessClose}
        autoCloseDuration={2000}
      />

      {/* NUEVO: Modal 2FA */}
      {show2FAModal && (
        <OTP2FAModal
          userId={pending2FAUserId}
          onSuccess={handle2FASuccess}
          onCancel={handle2FACancel}
        />
      )}
    </div>
  );
}
