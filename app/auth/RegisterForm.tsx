"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import PasswordStrength from "./PasswordStrength";
import SuccessModal from "./SuccessModal";
import VerificationCodeInput from "./VerificationCodeInput";
import { useAuth } from "./AuthContext";
import { isValidEmail, getSuspiciousDomainSuggestion } from "@/lib/utils";
import GoogleSignInButton from "./GoogleSignInButton";

const POST_AUTH_REDIRECT_KEY = "postAuthRedirect";

function consumePostAuthRedirect(): string {
  if (typeof window === "undefined") return "/";
  const redirectTarget = sessionStorage.getItem(POST_AUTH_REDIRECT_KEY) || "/";
  sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY);
  return redirectTarget;
}

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onClose?: () => void;
}

export default function RegisterForm({ onSwitchToLogin, onClose }: RegisterFormProps) {
  const router = useRouter();
  const { signup } = useAuth();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Estados para verificación de código
  const [verificationStep, setVerificationStep] = useState(false);
  const [userInputCode, setUserInputCode] = useState("");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [verificationError, setVerificationError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Estados para validación de email duplicado
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Contador regresivo de 2 minutos
  useEffect(() => {
    if (!verificationStep || !expiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimeRemaining(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [verificationStep, expiresAt]);

  // Validar email duplicado en tiempo real
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!email || !isValidEmail(email)) {
        setEmailExists(false);
        return;
      }
      const normalizedEmail = email.toLowerCase();
      setCheckingEmail(true);
      try {
        const response = await fetch("/api/auth/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail , nombre }),
        });
        const data = await response.json();
        setEmailExists(data.exists || false);
        if (data.exists) {
          setErrors(prev => ({
            ...prev,
            email: "El correo electrónico ingresado ya se encuentra registrado. Por favor, inicia sesión o intenta con uno distinto."
          }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.email;
            return newErrors;
          });
        }
      } catch (error) {
        console.error("Error validando email:", error);
        setEmailExists(false);
      } finally {
        setCheckingEmail(false);
      }
    }, 800);
    return () => clearTimeout(timeout);
  }, [email]);

  function validateField(field: string, value: string) {
    const newErrors = { ...errors };

    if (field === "nombre") {
      if (!value.trim()) newErrors.nombre = "El nombre es obligatorio";
      else if (value.length > 40) newErrors.nombre = "El nombre no puede exceder 40 caracteres";
      else if (/[0-9]/.test(value)) newErrors.nombre = "Ingresa un nombre válido";
      else if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/.test(value)) newErrors.nombre = "Ingresa un nombre válido";
      else if (/\s{2,}/.test(value)) newErrors.nombre = "No se permiten 2 o más espacios consecutivos";
      else if (value.trim().replace(/\s/g, "").length < 3) newErrors.nombre = "El nombre debe tener al menos 3 letras";
      else if (/(.)\1{2,}/.test(value.trim().replace(/\s/g, ""))) newErrors.nombre = "No se permiten 3 o más letras repetidas consecutivamente";
      else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+(\s[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)*$/.test(value.trim())) newErrors.nombre = "Ingresa un nombre válido";
      else delete newErrors.nombre;
    }

    if (field === "apellido") {
      if (!value.trim()) newErrors.apellido = "El apellido es obligatorio";
      else if (value.length > 40) newErrors.apellido = "El apellido no puede exceder 40 caracteres";
      else if (/[0-9]/.test(value)) newErrors.apellido = "Ingresa un apellido válido";
      else if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/.test(value)) newErrors.apellido = "Ingresa un apellido válido";
      else if (/\s{2,}/.test(value)) newErrors.apellido = "No se permiten 2 o más espacios consecutivos";
      else if (value.trim().replace(/\s/g, "").length < 3) newErrors.apellido = "El apellido debe tener al menos 3 letras";
      else if (/(.)\1{2,}/.test(value.trim().replace(/\s/g, ""))) newErrors.apellido = "No se permiten 3 o más letras repetidas consecutivamente";
      else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+(\s[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]{3,})*$/.test(value.trim())) newErrors.apellido = "Se permite espacio solo después de 3 o más letras";
      else delete newErrors.apellido;
    }

    if (field === "email") {
      if (!value.trim()) newErrors.email = "El correo es obligatorio";
      else if (!isValidEmail(value.trim())) {
        const suggestion = getSuspiciousDomainSuggestion(value.trim());
        if (suggestion) newErrors.email = `Ingresa un correo electrónico válido. ¿Quisiste escribir ${suggestion}?`;
        else newErrors.email = "Ingresa un correo válido: gmail.com, outlook.com, hotmail.com, icloud.com, live.com, office365.com, yahoo.com, .edu";
      } else delete newErrors.email;
    }

    if (field === "password") {
      if (!value) newErrors.password = "La contraseña es obligatoria";
      else if (/\s/.test(value)) newErrors.password = "La contraseña no puede contener espacios";
      else if (value.length < 8) newErrors.password = "La contraseña no cumple los requisitos mínimos";
      else if (value.length > 15) newErrors.password = "La contraseña debe tener entre 8 y 15 caracteres";
      else if (!/[A-Z]/.test(value)) newErrors.password = "Debe incluir al menos una mayúscula";
      else if (!/[0-9]/.test(value)) newErrors.password = "Debe incluir al menos un número";
      else if (!/[^A-Za-z0-9]/.test(value)) newErrors.password = "Debe incluir al menos un carácter especial";
      else delete newErrors.password;

      if (confirmPassword) {
        if (value !== confirmPassword) newErrors.confirmPassword = "Las contraseñas no coinciden";
        else delete newErrors.confirmPassword;
      }
    }

    if (field === "confirmPassword") {
      if (!value) newErrors.confirmPassword = "Debes confirmar tu contraseña";
      else if (password !== value) newErrors.confirmPassword = "Las contraseñas no coinciden";
      else delete newErrors.confirmPassword;
    }

    setErrors(newErrors);
  }

  function validate() {
    const newErrors: Record<string, string> = {};

    if (!nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    else if (nombre.length > 40) newErrors.nombre = "El nombre no puede exceder 40 caracteres";
    else if (/[0-9]/.test(nombre)) newErrors.nombre = "Ingresa un nombre válido";
    else if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/.test(nombre)) newErrors.nombre = "Ingresa un nombre válido";
    else if (/\s{2,}/.test(nombre)) newErrors.nombre = "No se permiten 2 o más espacios consecutivos";
    else if (nombre.trim().replace(/\s/g, "").length < 3) newErrors.nombre = "El nombre debe tener al menos 3 letras";
    else if (/(.)\1{2,}/.test(nombre.trim().replace(/\s/g, ""))) newErrors.nombre = "No se permiten 3 o más letras repetidas consecutivamente";
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+(\s[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)*$/.test(nombre.trim())) newErrors.nombre = "Ingresa un nombre válido";

    if (!apellido.trim()) newErrors.apellido = "El apellido es obligatorio";
    else if (apellido.length > 40) newErrors.apellido = "El apellido no puede exceder 40 caracteres";
    else if (/[0-9]/.test(apellido)) newErrors.apellido = "Ingresa un apellido válido";
    else if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/.test(apellido)) newErrors.apellido = "Ingresa un apellido válido";
    else if (/\s{2,}/.test(apellido)) newErrors.apellido = "No se permiten 2 o más espacios consecutivos";
    else if (apellido.trim().replace(/\s/g, "").length < 3) newErrors.apellido = "El apellido debe tener al menos 3 letras";
    else if (/(.)\1{2,}/.test(apellido.trim().replace(/\s/g, ""))) newErrors.apellido = "No se permiten 3 o más letras repetidas consecutivamente";
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+(\s[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]{3,})*$/.test(apellido.trim())) newErrors.apellido = "Se permite espacio solo después de 3 o más letras";

    if (!email.trim()) newErrors.email = "El correo es obligatorio";
    else if (!isValidEmail(email.trim())) {
      const suggestion = getSuspiciousDomainSuggestion(email.trim());
      if (suggestion) newErrors.email = `Ingresa un correo electrónico válido. ¿Quisiste escribir ${suggestion}?`;
      else newErrors.email = "Ingresa un correo válido: gmail.com, outlook.com, hotmail.com, icloud.com, live.com, office365.com, yahoo.com, .edu";
    }

    if (!password) newErrors.password = "La contraseña es obligatoria";
    else if (/\s/.test(password)) newErrors.password = "La contraseña no puede contener espacios";
    else if (password.length < 8) newErrors.password = "La contraseña no cumple los requisitos mínimos";
    else if (password.length > 15) newErrors.password = "La contraseña debe tener entre 8 y 15 caracteres";
    else if (!/[A-Z]/.test(password)) newErrors.password = "Debe incluir al menos una mayúscula";
    else if (!/[0-9]/.test(password)) newErrors.password = "Debe incluir al menos un número";
    else if (!/[^A-Za-z0-9]/.test(password)) newErrors.password = "Debe incluir al menos un carácter especial";

    if (!confirmPassword) newErrors.confirmPassword = "Debes confirmar tu contraseña";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Las contraseñas no coinciden";

    return newErrors;
  }

  function isFormValid() {
    const validationErrors = validate();
    return (
      nombre.trim() !== "" &&
      apellido.trim() !== "" &&
      email.trim() !== "" &&
      password !== "" &&
      confirmPassword !== "" &&
      !emailExists &&
      !checkingEmail &&
      Object.keys(validationErrors).length === 0
    );
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      setGeneralError("No tienes conexión a internet");
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setGeneralError("");
    setLoading(true);

    try {
      await handleSendVerification();
    } catch (err: any) {
      setGeneralError(err.message || "Ocurrió un error. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendVerification() {
    try {
      if (emailExists) {
        throw new Error("El correo electrónico ingresado ya se encuentra registrado.");
      }
      const normalizedEmail = email.toLowerCase();
      const response = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ email: normalizedEmail, nombre }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo enviar el código");
      const expirationTime = Date.now() + 2 * 60 * 1000;
      setExpiresAt(expirationTime);
      setVerificationStep(true);
      setVerificationError("");
      setUserInputCode("");
    } catch (error: any) {
      throw error;
    }
  }

  async function handleVerifyCode() {
    if (!userInputCode || userInputCode.length !== 6) {
      setVerificationError("El código debe tener 6 dígitos");
      return;
    }

    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      setVerificationError("No tienes conexión a internet");
      return;
    }

    setIsVerifying(true);
    setVerificationError("");

    try {
      const normalizedEmail = email.toLowerCase();
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nombre, apellido, email: normalizedEmail, password, verificationCode: userInputCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al registrarse");
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      const verifyResponse = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });

      if (!verifyResponse.ok) throw new Error("Error al validar sesión");

      setShowSuccess(true);
      setVerificationStep(false);
      setTimeout(() => { window.location.href = consumePostAuthRedirect(); }, 1000);
    } catch (err: any) {
      setVerificationError(err.message || "Error al verificar. Intenta de nuevo.");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResendCode() {
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      setVerificationError("No tienes conexión a internet");
      return;
    }
    setLoading(true);
    try {
      await handleSendVerification();
    } catch (err: any) {
      setVerificationError(err.message || "No se pudo reenviar el código");
    } finally {
      setLoading(false);
    }
  }

  function handleSuccessClose() {
    setShowSuccess(false);
    if (onClose) onClose();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      <div>
        <h2 style={{ fontSize: "28px", fontWeight: "bold", color: "#1f2937", marginBottom: "4px" }}>
          Crear tu cuenta
        </h2>
      </div>

      {/*  Botón Google separado en su propio componente */}
      <GoogleSignInButton />

      {!verificationStep ? (
        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {generalError && (
            <p style={{ color: "#ef4444", fontSize: "12px", textAlign: "center" }}>{generalError}</p>
          )}

          {/* NOMBRE */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "11px", fontWeight: "600", color: "#374151", textTransform: "uppercase" }}>Nombre</label>
            <div style={{ display: "flex", alignItems: "center", border: `1px solid ${errors.nombre ? "#ef4444" : "#d1d5db"}`, borderRadius: "6px", padding: "10px 12px", gap: "10px", backgroundColor: errors.nombre ? "#fee2e2" : "white" }}>
              <User size={18} style={{ color: "#9ca3af" }} />
              <input type="text" placeholder="Tu nombre" value={nombre} maxLength={40}
                onChange={(e) => { const value = e.target.value.slice(0, 40); setNombre(value); validateField("nombre", value); }}
                style={{ width: "100%", fontSize: "14px", outline: "none", border: "none", backgroundColor: "transparent" }} />
            </div>
            {errors.nombre && <p style={{ color: "#ef4444", fontSize: "12px" }}>{errors.nombre}</p>}
          </div>

          {/* APELLIDO */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "11px", fontWeight: "600", color: "#374151", textTransform: "uppercase" }}>Apellido</label>
            <div style={{ display: "flex", alignItems: "center", border: `1px solid ${errors.apellido ? "#ef4444" : "#d1d5db"}`, borderRadius: "6px", padding: "10px 12px", gap: "10px", backgroundColor: errors.apellido ? "#fee2e2" : "white" }}>
              <User size={18} style={{ color: "#9ca3af" }} />
              <input type="text" placeholder="Tu apellido" value={apellido} maxLength={40}
                onChange={(e) => { const value = e.target.value.slice(0, 40); setApellido(value); validateField("apellido", value); }}
                style={{ width: "100%", fontSize: "14px", outline: "none", border: "none", backgroundColor: "transparent" }} />
            </div>
            {errors.apellido && <p style={{ color: "#ef4444", fontSize: "12px" }}>{errors.apellido}</p>}
          </div>

          {/* CORREO */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "11px", fontWeight: "600", color: "#374151", textTransform: "uppercase" }}>Correo electrónico</label>
            <div style={{ display: "flex", alignItems: "center", border: `1px solid ${errors.email || emailExists ? "#ef4444" : "#d1d5db"}`, borderRadius: "6px", padding: "10px 12px", gap: "10px", backgroundColor: errors.email || emailExists ? "#fee2e2" : "white" }}>
              <Mail size={18} style={{ color: "#9ca3af" }} />
              <input type="email" placeholder="usuario@gmail.com" value={email}
                onChange={(e) => { setEmail(e.target.value); validateField("email", e.target.value); }}
                style={{ width: "100%", fontSize: "14px", outline: "none", border: "none", backgroundColor: "transparent" }} />
              {checkingEmail && (
                <div style={{ width: "16px", height: "16px", border: "2px solid #C85A4F", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              )}
            </div>
            {errors.email && <p style={{ color: "#ef4444", fontSize: "12px" }}>{errors.email}</p>}
          </div>

          {/* CONTRASEÑA */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "11px", fontWeight: "600", color: "#374151", textTransform: "uppercase" }}>Contraseña</label>
            <div style={{ display: "flex", alignItems: "center", border: `1px solid ${errors.password ? "#ef4444" : "#d1d5db"}`, borderRadius: "6px", padding: "10px 12px", gap: "10px", backgroundColor: errors.password ? "#fee2e2" : "white" }}>
              <Lock size={18} style={{ color: "#9ca3af" }} />
              <input type={showPassword ? "text" : "password"} placeholder="Mínimo 8 y maximo 15 caracteres" value={password} maxLength={15}
                onChange={(e) => { const value = e.target.value.slice(0, 15); setPassword(value); validateField("password", value); }}
                style={{ width: "100%", fontSize: "14px", outline: "none", border: "none", backgroundColor: "transparent" }} />
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#C85A4F", whiteSpace: "nowrap", padding: "4px 8px", backgroundColor: "#fef2f2", borderRadius: "4px" }}>{password.length}/15</span>
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ backgroundColor: "transparent", border: "none", cursor: "pointer", color: "#9ca3af", padding: "0" }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p style={{ color: "#ef4444", fontSize: "12px" }}>{errors.password}</p>}
            <PasswordStrength password={password} />
          </div>

          {/* CONFIRMAR CONTRASEÑA */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "11px", fontWeight: "600", color: "#374151", textTransform: "uppercase" }}>Confirmar contraseña</label>
            <div style={{ display: "flex", alignItems: "center", border: `1px solid ${errors.confirmPassword ? "#ef4444" : "#d1d5db"}`, borderRadius: "6px", padding: "10px 12px", gap: "10px", backgroundColor: errors.confirmPassword ? "#fee2e2" : "white" }}>
              <Lock size={18} style={{ color: "#9ca3af" }} />
              <input type={showConfirm ? "text" : "password"} placeholder="Confirmar contraseña" value={confirmPassword} maxLength={15}
                onChange={(e) => { const value = e.target.value.slice(0, 15); setConfirmPassword(value); validateField("confirmPassword", value); }}
                style={{ width: "100%", fontSize: "14px", outline: "none", border: "none", backgroundColor: "transparent" }} />
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#C85A4F", whiteSpace: "nowrap", padding: "4px 8px", backgroundColor: "#fef2f2", borderRadius: "4px" }}>{confirmPassword.length}/15</span>
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                style={{ backgroundColor: "transparent", border: "none", cursor: "pointer", color: "#9ca3af", padding: "0" }}>
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p style={{ color: "#ef4444", fontSize: "12px" }}>{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid()}
            style={{
              width: "100%",
              backgroundColor: loading || !isFormValid() ? "#e5a89f" : "#C85A4F",
              color: "white", fontWeight: "bold", padding: "12px", borderRadius: "6px",
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1, marginTop: "8px",
            }}
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          <p style={{ textAlign: "center", fontSize: "12px", color: "#4b5563" }}>
            ¿Ya tenés una cuenta?{" "}
            <button type="button" onClick={onSwitchToLogin}
              style={{ backgroundColor: "transparent", border: "none", color: "#111827", fontWeight: "600", cursor: "pointer", textDecoration: "underline" }}>
              Iniciar sesión
            </button>
          </p>
        </form>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <VerificationCodeInput
            onCodeChange={setUserInputCode}
            onResendClick={handleResendCode}
            timeRemaining={timeRemaining}
            isExpired={timeRemaining === 0 && expiresAt !== null}
            isLoading={loading}
            error={verificationError}
          />

          <button
            type="button"
            onClick={handleVerifyCode}
            disabled={isVerifying || userInputCode.length !== 6 || timeRemaining === 0}
            style={{
              width: "100%",
              backgroundColor: isVerifying || userInputCode.length !== 6 || timeRemaining === 0 ? "#e5a89f" : "#C85A4F",
              color: "white", fontWeight: "bold", padding: "12px", borderRadius: "6px",
              border: "none", cursor: isVerifying || userInputCode.length !== 6 || timeRemaining === 0 ? "not-allowed" : "pointer",
              opacity: isVerifying || userInputCode.length !== 6 || timeRemaining === 0 ? 0.5 : 1, marginTop: "8px",
            }}
          >
            {isVerifying ? "Verificando..." : "Verificar y crear cuenta"}
          </button>

          <button
            type="button"
            onClick={() => { setVerificationStep(false); setVerificationError(""); setUserInputCode(""); }}
            style={{ width: "100%", backgroundColor: "transparent", color: "#C85A4F", border: "1px solid #C85A4F", padding: "12px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}
          >
            Volver al formulario
          </button>

          <p style={{ textAlign: "center", fontSize: "11px", color: "#6b7280" }}>
            Se envió un código a <strong>{email}</strong>
          </p>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <SuccessModal
        isOpen={showSuccess}
        message="Tu cuenta ha sido creada exitosamente. ¡Bienvenido!"
        onClose={handleSuccessClose}
        autoCloseDuration={2000}
      />
    </div>
  );
}
