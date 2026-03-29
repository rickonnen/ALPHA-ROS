"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import SuccessModal from "./SuccessModal";
import { useAuth } from "./AuthContext";

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onClose?: () => void;
}

export default function LoginForm({ onSwitchToRegister, onClose }: LoginFormProps) {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Validaciones en tiempo real
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

  // Validaciones finales
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

  // Botón deshabilitado si hay errores activos
  function hasErrors() {
    return Object.keys(errors).length > 0;
  }

  // Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Prevenir múltiples submits
    if (loading) {
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await login(email, password);
      setShowSuccess(true);
    } catch (err: any) {
      setErrors({ general: err.message || "Ocurrió un error. Intentá de nuevo." });
    } finally {
      setLoading(false);
    }
  }

  // Manejar cierre del modal de éxito
  function handleSuccessClose() {
    setShowSuccess(false);
    if (onClose) {
      onClose();
    }
    router.push("/");
  }


  //  UI
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
     
      {/*Encabezado de Bienvenida */}
      <div>
        <h2 style={{ fontSize: "28px", fontWeight: "bold", color: "#1f2937", marginBottom: "4px" }}>Bienvenido de vuelta</h2>
      </div>


      {/* Botón estilo Google */}
<button
  type="button"
  onClick={async () => {
    const width = 500
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    // Obtener CSRF token
    const res = await fetch("/api/auth/csrf")
    const { csrfToken } = await res.json()

    const form = document.createElement("form")
    form.method = "POST"
    form.action = "/api/auth/signin/google"
    form.target = "Google Sign In"

    const input = document.createElement("input")
    input.type = "hidden"
    input.name = "csrfToken"
    input.value = csrfToken

    form.appendChild(input)
    document.body.appendChild(form)

    const popup = window.open(
      "",
      "Google Sign In",
      `width=${width},height=${height},left=${left},top=${top}`
    )

    form.submit()
    document.body.removeChild(form)

    // Detectar cuando se cierra
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed)

        fetch("/api/auth/session")
          .then(r => r.json())
          .then(session => {
            if (!session?.user) {
              setErrors({ general: "Inicio de sesión cancelado." })
            }
          })
      }
    }, 500)
  }}
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
    opacity: loading ? 0.6 : 1
  }}
>
  Continuar con Google
</button>

      {/* Formulario */}
      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "16px" }}>


        {/* Error general */}
        {errors.general && (
          <p style={{ color: "#ef4444", fontSize: "12px", textAlign: "center" }}>{errors.general}</p>
        )}


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
            backgroundColor: errors.email ? "#fee2e2" : "white"
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
                backgroundColor: "transparent"
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
            backgroundColor: errors.password ? "#fee2e2" : "white"
          }}>
            <Lock size={18} style={{ color: "#9ca3af" }} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validateField("password", e.target.value);
              }}
              style={{
                flex: 1,
                fontSize: "14px",
                outline: "none",
                border: "none",
                backgroundColor: "transparent"
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ backgroundColor: "transparent", border: "none", padding: "0", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center" }}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p style={{ color: "#ef4444", fontSize: "12px" }}>{errors.password}</p>
          )}
        </div>


        {/* Olvidé el enlace de contraseña*/}
        <div style={{ textAlign: "right" }}>
          <button
            type="button"
            style={{
              fontSize: "12px",
              color: "#6b7280",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline"
            }}
          >
            ¿Olvide tu contraseña?
          </button>
        </div>


        {/* Boton enviar */}
        <button
          type="submit"
          disabled={loading || hasErrors()}
          style={{
            width: "100%",
            backgroundColor: loading || hasErrors() ? "#e5a89f" : "#C85A4F",
            color: "white",
            fontWeight: "bold",
            padding: "12px",
            borderRadius: "6px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1,
            marginTop: "8px"
          }}
        >
          {loading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
      </form>

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={showSuccess}
        message="¡Sesión iniciada exitosamente! Bienvenido."
        onClose={handleSuccessClose}
        autoCloseDuration={2000}
      />
    </div>
  );
}
