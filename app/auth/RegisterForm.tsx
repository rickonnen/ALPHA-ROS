"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import PasswordStrength from "./PasswordStrength";
import SuccessModal from "./SuccessModal";
import VerificationCodeInput from "./VerificationCodeInput";
import { useAuth } from "./AuthContext";
import { isValidEmail, getSuspiciousDomainSuggestion } from "@/lib/utils";

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
  const [googleLoading, setGoogleLoading] = useState(false);

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

  // Estados para verificación de conexión a internet
  const [hasInternet, setHasInternet] = useState(true);
  const [blockedByConnection, setBlockedByConnection] = useState(false);

  // Contador regresivo de 2 minutos
  useEffect(() => {
    if (!verificationStep || !expiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
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
          body: JSON.stringify({ email: normalizedEmail }),
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
    }, 800); // Esperar 800ms después de que el usuario deja de escribir

    return () => clearTimeout(timeout);
  }, [email]);

  // Verificar conexión a internet al montar y escuchar cambios
  useEffect(() => {
    async function verifyConnection() {
      const isConnected = await checkInternetConnection();
      setHasInternet(isConnected);

      if (!isConnected) {
        setGeneralError("No tienes conexión a internet");
      }
    }

    verifyConnection();

    const handleOffline = () => {
      console.log("Conexión perdida");
      setHasInternet(false);
      setGeneralError("No tienes conexión a internet");
    };

    const handleOnline = () => {
      console.log("Conexión restaurada");
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

  async function checkInternetConnection() {
    if (!navigator.onLine) {
      console.log("Sin conexión (navigator)");
      return false;
    }
    try {
      await fetch("https://www.google.com", {
        mode: "no-cors",
      });
      console.log("Conexión a internet OK");
      return true;
    } catch (error) {
      console.log("Error de conexión real:", error);
      return false;
    }
  }

  function validateField(field: string, value: string) {
    const newErrors = { ...errors };

    if (field === "nombre") {
      if (!value.trim()) {
        newErrors.nombre = "El nombre es obligatorio";
      } else if (value.length > 40) {
        newErrors.nombre = "El nombre no puede exceder 40 caracteres";
      } else if (/[0-9]/.test(value)) {
        newErrors.nombre = "Ingresa un nombre válido";
      } else if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/.test(value)) {
        newErrors.nombre = "Ingresa un nombre válido";
      } else if (/\s{2,}/.test(value)) {
        newErrors.nombre = "No se permiten 2 o más espacios consecutivos";
      } else if (value.trim().replace(/\s/g, "").length < 3) {
        newErrors.nombre = "El nombre debe tener al menos 3 letras";
      } else if (/(.)\1{2,}/.test(value.trim().replace(/\s/g, ""))) {
        newErrors.nombre = "No se permiten 3 o más letras repetidas consecutivamente";
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+(\s[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)*$/.test(value.trim())) {
        newErrors.nombre = "Ingresa un nombre válido";
      } else {
        delete newErrors.nombre;
      }
    }

    if (field === "apellido") {
      if (!value.trim()) {
        newErrors.apellido = "El apellido es obligatorio";
      } else if (value.length > 40) {
        newErrors.apellido = "El apellido no puede exceder 40 caracteres";
      } else if (/[0-9]/.test(value)) {
        newErrors.apellido = "Ingresa un apellido válido";
      } else if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/.test(value)) {
        newErrors.apellido = "Ingresa un apellido válido";
      } else if (/\s{2,}/.test(value)) {
        newErrors.apellido = "No se permiten 2 o más espacios consecutivos";
      } else if (value.trim().replace(/\s/g, "").length < 3) {
        newErrors.apellido = "El apellido debe tener al menos 3 letras";
      } else if (/(.)\1{2,}/.test(value.trim().replace(/\s/g, ""))) {
        newErrors.apellido = "No se permiten 3 o más letras repetidas consecutivamente";
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+(\s[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]{3,})*$/.test(value.trim())) {
        newErrors.apellido = "Se permite espacio solo después de 3 o más letras";
      } else {
        delete newErrors.apellido;
      }
    }

    if (field === 'email') {
  if (!value.trim())
    newErrors.email = 'El correo es obligatorio';
  else if (!isValidEmail(value.trim())) {
    const suggestion = getSuspiciousDomainSuggestion(value.trim());
    if (suggestion) {
      newErrors.email = `Ingresa un correo electrónico válido. ¿Quisiste escribir ${suggestion}?`;
    } else {
      newErrors.email = 'Ingresa un correo válido: gmail.com, outlook.com, hotmail.com, icloud.com, live.com, office365.com, yahoo.com, .edu';
    }
  } else
    delete newErrors.email;
}

    if (field === 'password') {
  if (!value)
    newErrors.password = 'La contraseña es obligatoria';
  else if (/\s/.test(value))
    newErrors.password = 'La contraseña no puede contener espacios';
  else if (value.length < 8)
    newErrors.password = 'La contraseña no cumple los requisitos mínimos';
  else if (value.length > 15)
    newErrors.password = 'La contraseña debe tener entre 8 y 15 caracteres';
  else if (!/[A-Z]/.test(value))
    newErrors.password = 'Debe incluir al menos una mayúscula';
  else if (!/[0-9]/.test(value))
    newErrors.password = 'Debe incluir al menos un número';
  else if (!/[^A-Za-z0-9]/.test(value))
    newErrors.password = 'Debe incluir al menos un carácter especial';
  else
    delete newErrors.password;
      if (confirmPassword) {
        if (value !== confirmPassword) {
          newErrors.confirmPassword = "Las contraseñas no coinciden";
        } else {
          delete newErrors.confirmPassword;
        }
      }
    }

    if (field === "confirmPassword") {
      if (!value) {
        newErrors.confirmPassword = "Debes confirmar tu contraseña";
      } else if (password !== value) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setErrors(newErrors);
  }

  function validate() {
    const newErrors: Record<string, string> = {};

    if (!nombre.trim())
      newErrors.nombre = "El nombre es obligatorio";
    else if (nombre.length > 40)
      newErrors.nombre = "El nombre no puede exceder 40 caracteres";
    else if (/[0-9]/.test(nombre))
      newErrors.nombre = "Ingresa un nombre válido";
    else if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/.test(nombre))
      newErrors.nombre = "Ingresa un nombre válido";
    else if (/\s{2,}/.test(nombre))
      newErrors.nombre = "No se permiten 2 o más espacios consecutivos";
    else if (nombre.trim().replace(/\s/g, "").length < 3)
      newErrors.nombre = "El nombre debe tener al menos 3 letras";
    else if (/(.)\1{2,}/.test(nombre.trim().replace(/\s/g, "")))
      newErrors.nombre = "No se permiten 3 o más letras repetidas consecutivamente";
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+(\s[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)*$/.test(nombre.trim()))
      newErrors.nombre = "Ingresa un nombre válido";

    if (!apellido.trim())
      newErrors.apellido = "El apellido es obligatorio";
    else if (apellido.length > 40)
      newErrors.apellido = "El apellido no puede exceder 40 caracteres";
    else if (/[0-9]/.test(apellido))
      newErrors.apellido = "Ingresa un apellido válido";
    else if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/.test(apellido))
      newErrors.apellido = "Ingresa un apellido válido";
    else if (/\s{2,}/.test(apellido))
      newErrors.apellido = "No se permiten 2 o más espacios consecutivos";
    else if (apellido.trim().replace(/\s/g, "").length < 3)
      newErrors.apellido = "El apellido debe tener al menos 3 letras";
    else if (/(.)\1{2,}/.test(apellido.trim().replace(/\s/g, "")))
      newErrors.apellido = "No se permiten 3 o más letras repetidas consecutivamente";
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+(\s[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]{3,})*$/.test(apellido.trim()))
      newErrors.apellido = "Se permite espacio solo después de 3 o más letras";

    if (!email.trim()) newErrors.email = 'El correo es obligatorio';
else if (!isValidEmail(email.trim())) {
  const suggestion = getSuspiciousDomainSuggestion(email.trim());
  if (suggestion) {
    newErrors.email = `Ingresa un correo electrónico válido. ¿Quisiste escribir ${suggestion}?`;
  } else {
    newErrors.email = 'Ingresa un correo válido: gmail.com, outlook.com, hotmail.com, icloud.com, live.com, office365.com, yahoo.com, .edu';
  }
}

   if (!password) newErrors.password = 'La contraseña es obligatoria';
else if (/\s/.test(password)) newErrors.password = 'La contraseña no puede contener espacios';
else if (password.length < 8) newErrors.password = 'La contraseña no cumple los requisitos mínimos';
else if (password.length > 15) newErrors.password = 'La contraseña debe tener entre 8 y 15 caracteres';
else if (!/[A-Z]/.test(password)) newErrors.password = 'Debe incluir al menos una mayúscula';
else if (!/[0-9]/.test(password)) newErrors.password = 'Debe incluir al menos un número';
else if (!/[^A-Za-z0-9]/.test(password)) newErrors.password = 'Debe incluir al menos un carácter especial';

    if (!confirmPassword)
      newErrors.confirmPassword = "Debes confirmar tu contraseña";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden";

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    // Verificar conexión a internet
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      setGeneralError("No tienes conexión a internet");
      setBlockedByConnection(true);
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
      // Paso 1: Enviar código de verificación
      await handleSendVerification();
    } catch (err: any) {
      setGeneralError(err.message || "Ocurrió un error. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendVerification() {
    try {
      // Si ya validamos que el email existe, no continuar
      if (emailExists) {
        throw new Error("El correo electrónico ingresado ya se encuentra registrado. Por favor, inicia sesión o intenta con uno distinto.");
      }

      const normalizedEmail = email.toLowerCase();

      // Enviar código de verificación
      const response = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo enviar el código");
      }

      // En lugar de guardar el código correcto (inseguro),
      // solo guardamos un timestamp de referencia (2 minutos)
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

    // Verificar conexión a internet
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
        body: JSON.stringify({
          nombre,
          apellido,
          email: normalizedEmail,
          password,
          verificationCode: userInputCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al registrarse");
      }

      const data = await response.json();
      console.log("[REGISTER] Registro exitoso, userId:", data.userId);

      // Verificar que el JWT está en la cookie
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verificar que el JWT se validó correctamente
      const verifyResponse = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });

      if (!verifyResponse.ok) {
        throw new Error("Error al validar sesión");
      }

      const userData = await verifyResponse.json();
      console.log("[REGISTER] ✅ Sesión verificada para:", userData.user.email);

      // Éxito - el JWT está validado
      setShowSuccess(true);
      setVerificationStep(false);
      
      // Recargar la página para que AuthContext valide el JWT
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (err: any) {
      setVerificationError(
        err.message || "Error al verificar. Intenta de nuevo."
      );
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResendCode() {
    // Verificar conexión a internet
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

  // ⭐ BUG 4 y 9 — manejar clic en Google
  async function handleGoogleSignIn() {
    if (googleLoading) return; // ← evita múltiples clics

    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      setGeneralError("No tienes conexión a internet");
      setBlockedByConnection(true);
      return;
    }

    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } finally {
      setGoogleLoading(false);
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

      {/* Botón Google */}
      <button
        type="button"
        disabled={loading || googleLoading || blockedByConnection}
        onClick={handleGoogleSignIn}
        style={{
          width: "100%",
          backgroundColor: googleLoading || blockedByConnection ? "#9ca3af" : "#0F172A",
          color: "white",
          fontWeight: "bold",
          padding: "12px",
          borderRadius: "8px",
          border: "none",
          cursor: googleLoading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "16px",
          opacity: googleLoading ? 0.6 : 1,
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

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {!verificationStep ? (
        // PASO 1: FORMULARIO DE REGISTRO
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
                <div style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid #C85A4F",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }} />
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
            disabled={loading || !isFormValid() || blockedByConnection}
            style={{
              width: "100%",
              backgroundColor: loading || !isFormValid() || blockedByConnection ? "#e5a89f" : "#C85A4F",
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
        // PASO 2: VERIFICACIÓN DE CÓDIGO
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
              backgroundColor:
                isVerifying || userInputCode.length !== 6 || timeRemaining === 0
                  ? "#e5a89f"
                  : "#C85A4F",
              color: "white",
              fontWeight: "bold",
              padding: "12px",
              borderRadius: "6px",
              border: "none",
              cursor:
                isVerifying || userInputCode.length !== 6 || timeRemaining === 0
                  ? "not-allowed"
                  : "pointer",
              opacity:
                isVerifying || userInputCode.length !== 6 || timeRemaining === 0
                  ? 0.5
                  : 1,
              marginTop: "8px",
            }}
          >
            {isVerifying ? "Verificando..." : "Verificar y crear cuenta"}
          </button>

          <button
            type="button"
            onClick={() => {
              setVerificationStep(false);
              setVerificationError("");
              setUserInputCode("");
            }}
            style={{
              width: "100%",
              backgroundColor: "transparent",
              color: "#C85A4F",
              border: "1px solid #C85A4F",
              padding: "12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "12px",
            }}
          >
            Volver al formulario
          </button>

          <p style={{ textAlign: "center", fontSize: "11px", color: "#6b7280" }}>
            Se envió un código a <strong>{email}</strong>
          </p>
        </div>
      )}

      <SuccessModal
        isOpen={showSuccess}
        message="Tu cuenta ha sido creada exitosamente. ¡Bienvenido!"
        onClose={handleSuccessClose}
        autoCloseDuration={2000}
      />
    </div>
  );
}

