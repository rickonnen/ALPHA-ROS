"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

/**
 * Página a donde el usuario es redirigido tras hacer clic en el Magic Link
 * Sincroniza el token con la BD y crea sesión NextAuth
 */
export default function Callback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setLoading(true);

        // 1️ Extraer token y email de los query parameters
        const token = searchParams.get("token");
        const email = searchParams.get("email");

        console.log("[Callback] Parámetros recibidos:", { token: token?.substring(0, 10) + "...", email });

        // 2️ Validar que ambos parámetros estén presentes
        if (!token || !email) {
          console.error("[Callback] Falta token o email en URL");
          setError("Link inválido o incompleto. Solicita uno nuevo.");
          setTimeout(() => router.push("/auth"), 2000);
          return;
        }

        // 3️ Llamar a /api/auth/magic-link/verify para validar token y crear usuario
        console.log("[Callback] Verificando token...");
        const verifyResponse = await fetch("/api/auth/magic-link/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            token: token,
          }),
        });

        const verifyData = await verifyResponse.json();

        // 4️ Manejar errores de verificación
        if (!verifyResponse.ok) {
          console.error("[Callback] Error en verify:", verifyData.error);
          setError(verifyData.error || "Error al verificar el link. Intenta nuevamente.");
          setTimeout(() => router.push("/auth"), 3000);
          return;
        }

        // 5️ Token válido y usuario verificado/creado
        console.log("[Callback] Token verificado para:", email);
        console.log("[Callback] Usuario:", verifyData.usuario.id);

        // 6️ Crear sesión NextAuth con el Magic Link provider
        console.log("[Callback] Creando sesión NextAuth...");
        const result = await signIn("magic-link", {
          email: email,
          redirect: false,
        });

        if (!result?.ok) {
          console.error("[Callback] Error creando sesión NextAuth:", result?.error);
          setError("Error al iniciar sesión. Intenta nuevamente.");
          setTimeout(() => router.push("/auth"), 2000);
          return;
        }

        // 7️ Sesión creada exitosamente → Redirigir a /
        console.log("[Callback] Sesión NextAuth creada exitosamente");
        window.location.href = "/";

      } catch (error) {
        console.error("[Callback] Error:", error);
        setError("Error interno. Intenta nuevamente.");
        setTimeout(() => router.push("/auth"), 2000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  // Mostrar UI mientras se procesa
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {error ? (
          <>
            <h2 style={styles.errorTitle}>⚠️ Error</h2>
            <p style={styles.errorText}>{error}</p>
            <p style={styles.subtext}>Redirigiendo a login...</p>
          </>
        ) : (
          <>
            <h2 style={styles.title}>✓ Procesando tu acceso</h2>
            <div style={styles.spinner}></div>
            <p style={styles.text}>Verificando tu Magic Link...</p>
          </>
        )}
      </div>
    </div>
  );
}

// Estilos
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    maxWidth: "400px",
  },
  title: {
    color: "#28a745",
    fontSize: "24px",
    marginBottom: "20px",
    fontWeight: "600",
  },
  errorTitle: {
    color: "#dc3545",
    fontSize: "24px",
    marginBottom: "20px",
    fontWeight: "600",
  },
  text: {
    color: "#666",
    fontSize: "16px",
    marginTop: "10px",
  },
  errorText: {
    color: "#dc3545",
    fontSize: "16px",
    marginBottom: "10px",
  },
  subtext: {
    color: "#999",
    fontSize: "14px",
    marginTop: "10px",
  },
  spinner: {
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #1C3445",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
    margin: "20px auto",
  },
};

// Animación del spinner
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}