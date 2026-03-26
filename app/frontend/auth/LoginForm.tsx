"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Validaciones 
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

  //  Submit 
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // AQUÍ HACEMOS LA CONEXIÓN REAL
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
      }

      alert("¡Bienvenido!");
      // Se redirigir al home después de login exitoso

    } catch (err: any) {
      setErrors({ general: err.message || "Ocurrió un error. Intentá de nuevo." });
    } finally {
      setLoading(false);
    }
  }

  //  UI
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/*Encabezado de Bienvenida */}
      <div>
        <h2 style={{ fontSize: "28px", fontWeight: "bold", color: "#1f2937", marginBottom: "4px" }}>Bienvenido de vuelta</h2>
      </div>

      {/* Botón estilo Google, sin funcionalidad */}
      <button
        type="button"
        style={{
          width: "100%",
          backgroundColor: "#0F172A",
          color: "white",
          fontWeight: "bold",
          padding: "12px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "16px"
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
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
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                fontSize: "14px",
                outline: "none",
                border: "none",
                backgroundColor: "transparent"
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ backgroundColor: "transparent", border: "none", cursor: "pointer", color: "#9ca3af" }}
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
          disabled={loading}
          style={{
            width: "100%",
            backgroundColor: "#C85A4F",
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
    </div>
  );
}
