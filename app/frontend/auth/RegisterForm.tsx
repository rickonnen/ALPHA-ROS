"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import PasswordStrength from "./PasswordStrength";
import SuccessModal from "./SuccessModal";
import { useAuth } from "./AuthContext";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onClose?: () => void;
}

export default function RegisterForm({ onSwitchToLogin, onClose }: RegisterFormProps) {
  const router = useRouter();
  const { signup } = useAuth();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Validaciones en tiempo real
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
      } else if (/(.)\1\1/.test(value.trim().replace(/\s/g, ""))) {
        newErrors.nombre = "No se permiten 3 o más letras repetidas consecutivamente";
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+(\s[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]{3,})*$/.test(value.trim())) {
        newErrors.nombre = "Se permite espacio solo después de 3 o más letras";
      } else {
        delete newErrors.nombre;
      }
    }

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
      } else if (value.length < 8) {
        newErrors.password = "La contraseña no cumple los requisitos mínimos";
      } else if (value.length > 15) {
        newErrors.password = "La contraseña debe tener entre 8 y 15 caracteres";
      } else if (!/[A-Z]/.test(value)) {
        newErrors.password = "Debe incluir al menos una mayúscula";
      } else {
        delete newErrors.password;
      }

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
    else if (/(.)\1\1/.test(nombre.trim().replace(/\s/g, "")))
      newErrors.nombre = "No se permiten 3 o más letras repetidas consecutivamente";
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+(\s[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]{3,})*$/.test(nombre.trim()))
      newErrors.nombre = "Se permite espacio solo después de 3 o más letras";

    if (!email.trim())
      newErrors.email = "El correo es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Ingresa un correo electrónico válido";

    if (!password)
      newErrors.password = "La contraseña es obligatoria";
    else if (password.length < 8)
      newErrors.password = "La contraseña no cumple los requisitos mínimos";
    else if (password.length > 15)
      newErrors.password = "La contraseña debe tener entre 8 y 15 caracteres";
    else if (!/[A-Z]/.test(password))
      newErrors.password = "Debe incluir al menos una mayúscula";

    if (!confirmPassword)
      newErrors.confirmPassword = "Debes confirmar tu contraseña";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden";

    return newErrors;
  }

  function isFormValid() {
    return (
      nombre.trim() !== "" &&
      email.trim() !== "" &&
      password !== "" &&
      confirmPassword !== "" &&
      Object.keys(errors).length === 0
    );
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
    setLoading(true);

    try {
      await signup(nombre, email, password);
      setShowSuccess(true);
    } catch (err: any) {
      setGeneralError(err.message || "Ocurrió un error. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  function handleSuccessClose() {
    setShowSuccess(false);
    if (onClose) onClose();
    router.push("/");
  }

  // UI
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Encabezado */}
      <div>
        <h2 style={{ fontSize: "28px", fontWeight: "bold", color: "#1f2937", marginBottom: "4px" }}>
          Crear tu cuenta
        </h2>
      </div>

      {/* Botón Google — usa signIn de NextAuth directamente, sin popup manual */}
      <button
        type="button"
        disabled={loading}
        onClick={() => signIn("google", { callbackUrl: "/" })}
        style={{
          width: "100%",
          backgroundColor: loading ? "#9ca3af" : "#0F172A",
          color: "white",
          fontWeight: "bold",
          padding: "12px",
          borderRadius: "8px",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "16px",
          opacity: loading ? 0.6 : 1,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continuar con Google
      </button>

      {/* Formulario */}
      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Error general */}
        {generalError && (
          <p style={{ color: "#ef4444", fontSize: "12px", textAlign: "center" }}>{generalError}</p>
        )}

        {/* NOMBRE COMPLETO */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "11px", fontWeight: "600", color: "#374151", textTransform: "uppercase" }}>
            Nombre completo
          </label>
          <div style={{
            display: "flex",
            alignItems: "center",
            border: `1px solid ${errors.nombre ? "#ef4444" : "#d1d5db"}`,
            borderRadius: "6px",
            padding: "10px 12px",
            gap: "10px",
            backgroundColor: errors.nombre ? "#fee2e2" : "white",
          }}>
            <User size={18} style={{ color: "#9ca3af" }} />
            <input
              type="text"
              placeholder="Tu nombre completo"
              value={nombre}
              maxLength={40}
              onChange={(e) => {
                const value = e.target.value.slice(0, 40);
                setNombre(value);
                validateField("nombre", value);
              }}
              style={{
                width: "100%",
                fontSize: "14px",
                outline: "none",
                border: "none",
                backgroundColor: "transparent",
              }}
            />
          </div>
          {errors.nombre && (
            <p style={{ color: "#ef4444", fontSize: "12px" }}>{errors.nombre}</p>
          )}
        </div>

        {/* CORREO ELECTRÓNICO */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "11px", fontWeight: "600", color: "#374151", textTransform: "uppercase" }}>
            Correo electrónico
          </label>
          <div style={{
            display: "flex",
            alignItems: "center",
            border: `1px solid ${errors.email ? "#ef4444" : "#d1d5db"}`,
            borderRadius: "6px",
            padding: "10px 12px",
            gap: "10px",
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
              }}
              style={{
                width: "100%",
                fontSize: "14px",
                outline: "none",
                border: "none",
                backgroundColor: "transparent",
              }}
            />
          </div>
          {errors.email && (
            <p style={{ color: "#ef4444", fontSize: "12px" }}>{errors.email}</p>
          )}
        </div>

        {/* CONTRASEÑA */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "11px", fontWeight: "600", color: "#374151", textTransform: "uppercase" }}>
            Contraseña
          </label>
          <div style={{
            display: "flex",
            alignItems: "center",
            border: `1px solid ${errors.password ? "#ef4444" : "#d1d5db"}`,
            borderRadius: "6px",
            padding: "10px 12px",
            gap: "10px",
            backgroundColor: errors.password ? "#fee2e2" : "white",
          }}>
            <Lock size={18} style={{ color: "#9ca3af" }} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              value={password}
              maxLength={15}
              onChange={(e) => {
                const value = e.target.value.slice(0, 15);
                setPassword(value);
                validateField("password", value);
              }}
              style={{
                width: "100%",
                fontSize: "14px",
                outline: "none",
                border: "none",
                backgroundColor: "transparent",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ backgroundColor: "transparent", border: "none", cursor: "pointer", color: "#9ca3af", padding: "0" }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p style={{ color: "#ef4444", fontSize: "12px" }}>{errors.password}</p>
          )}
          <PasswordStrength password={password} />
        </div>

        {/* CONFIRMAR CONTRASEÑA */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "11px", fontWeight: "600", color: "#374151", textTransform: "uppercase" }}>
            Confirmar contraseña
          </label>
          <div style={{
            display: "flex",
            alignItems: "center",
            border: `1px solid ${errors.confirmPassword ? "#ef4444" : "#d1d5db"}`,
            borderRadius: "6px",
            padding: "10px 12px",
            gap: "10px",
            backgroundColor: errors.confirmPassword ? "#fee2e2" : "white",
          }}>
            <Lock size={18} style={{ color: "#9ca3af" }} />
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              maxLength={15}
              onChange={(e) => {
                const value = e.target.value.slice(0, 15);
                setConfirmPassword(value);
                validateField("confirmPassword", value);
              }}
              style={{
                width: "100%",
                fontSize: "14px",
                outline: "none",
                border: "none",
                backgroundColor: "transparent",
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              style={{ backgroundColor: "transparent", border: "none", cursor: "pointer", color: "#9ca3af", padding: "0" }}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p style={{ color: "#ef4444", fontSize: "12px" }}>{errors.confirmPassword}</p>
          )}
        </div>

        {/* Botón enviar */}
        <button
          type="submit"
          disabled={loading || !isFormValid()}
          style={{
            width: "100%",
            backgroundColor: loading || !isFormValid() ? "#e5a89f" : "#C85A4F",
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
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        {/* Link a login */}
        <p style={{ textAlign: "center", fontSize: "12px", color: "#4b5563" }}>
          ¿Ya tenés una cuenta?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: "#111827",
              fontWeight: "600",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Iniciar sesión
          </button>
        </p>
      </form>

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={showSuccess}
        message="Tu cuenta ha sido creada exitosamente. ¡Bienvenido!"
        onClose={handleSuccessClose}
        autoCloseDuration={2000}
      />
    </div>
  );
}