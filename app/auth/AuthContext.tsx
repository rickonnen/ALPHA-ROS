"use client";
import React, { createContext, useState, useContext, useEffect, useRef } from "react";
// Se asume que signOut viene de next-auth según el comentario en la función logoutInternal
import { signOut } from "next-auth/react"; 

interface User {
  id: string;
  name: string;
  email: string;
  rol?: number | null;
  role?: string | null;
  isAdmin?: boolean;
  perfil?: string | null;
  nombreRol?: string | null;
}

interface LoginTelemetry {
  latitud?: number | null;
  longitud?: number | null;
}

export const isAdminUser = (objUser: User | null | undefined): boolean => {
  if (!objUser) return false;

  if (typeof objUser.rol !== "undefined" && objUser.rol !== null) {
    return Number(objUser.rol) === 1;
  }

  if (typeof objUser.role === "string") {
    const roleLower = objUser.role.toLowerCase();
    return roleLower === "admin" || roleLower === "administrador";
  }

  if (typeof objUser.isAdmin === "boolean") {
    return objUser.isAdmin;
  }

  return false;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, telemetry?: LoginTelemetry) => Promise<void>;
  signup: (nombre: string, apellido: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUserFromServer: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; 
const GOOGLE_TELEMETRY_PENDING_KEY = "google_telemetry_pending";
const GOOGLE_TELEMETRY_LAT_KEY = "google_telemetry_latitud";
const GOOGLE_TELEMETRY_LNG_KEY = "google_telemetry_longitud";
const GOOGLE_TELEMETRY_CREATED_AT_KEY = "google_telemetry_created_at";
const GOOGLE_TELEMETRY_MAX_AGE_MS = 10 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // SOLUCIÓN: Declaración de estado y ref que faltaban
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState("");
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ensureSessionIdCookie = () => {
    if (typeof document === "undefined") return;

    const cookieName = "session_id";

    const existing = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${cookieName}=`))
      ?.split("=")[1];

    if (existing) return;

    const sessionId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}_${Math.random().toString(16).slice(2)}`;

    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    document.cookie = `${cookieName}=${encodeURIComponent(sessionId)}; Path=/; Max-Age=${
      60 * 60 * 24 * 365
    }; SameSite=Lax${isHttps ? "; Secure" : ""}`;
  };

  useEffect(() => {
    ensureSessionIdCookie();
  }, []);

  const fetchUserFromServer = async () => {
    // SOLUCIÓN: Se eliminó la re-declaración local de AuthContextType que causaba ruido
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      }
    } catch (error) {
      console.error("Error fetching user from server:", error);
    }
    return false;
  };

  const clearPendingGoogleTelemetry = () => {
    sessionStorage.removeItem(GOOGLE_TELEMETRY_PENDING_KEY);
    sessionStorage.removeItem(GOOGLE_TELEMETRY_LAT_KEY);
    sessionStorage.removeItem(GOOGLE_TELEMETRY_LNG_KEY);
    sessionStorage.removeItem(GOOGLE_TELEMETRY_CREATED_AT_KEY);
  };

  const flushPendingGoogleTelemetry = async () => {
    if (typeof window === "undefined") {
      return;
    }

    if (sessionStorage.getItem(GOOGLE_TELEMETRY_PENDING_KEY) !== "1") {
      return;
    }

    const createdAt = Number(sessionStorage.getItem(GOOGLE_TELEMETRY_CREATED_AT_KEY));
    if (!Number.isFinite(createdAt) || Date.now() - createdAt > GOOGLE_TELEMETRY_MAX_AGE_MS) {
      clearPendingGoogleTelemetry();
      return;
    }

    const rawLatitud = sessionStorage.getItem(GOOGLE_TELEMETRY_LAT_KEY);
    const rawLongitud = sessionStorage.getItem(GOOGLE_TELEMETRY_LNG_KEY);

    const latitud =
      rawLatitud && rawLatitud !== "null" ? Number.parseFloat(rawLatitud) : null;
    const longitud =
      rawLongitud && rawLongitud !== "null" ? Number.parseFloat(rawLongitud) : null;

    const response = await fetch("/api/auth/session-telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        latitud: Number.isFinite(latitud) ? latitud : null,
        longitud: Number.isFinite(longitud) ? longitud : null,
      }),
    });

    if (!response.ok) {
      throw new Error("No se pudo registrar la telemetria de Google");
    }

    clearPendingGoogleTelemetry();
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionRes = await fetch("/api/auth/session");

        if (sessionRes.ok) {
          const session = await sessionRes.json();

          if (session?.user) {
            const fetched = await fetchUserFromServer();
            if (fetched) {
              await flushPendingGoogleTelemetry();
              setIsLoading(false);
              return;
            }

            const googleUser: User = {
              id: session.user.id ?? session.user.email ?? "",
              name: session.user.name ?? "",
              email: session.user.email ?? "",
            };

            setUser(googleUser);
            await flushPendingGoogleTelemetry();
            setIsLoading(false);
            return;
          }
        }

        await fetchUserFromServer();
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // SOLUCIÓN: Agregar parámetro telemetry y el bloque `try {` faltante
  const login = async (email: string, password: string, telemetry?: LoginTelemetry) => {
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          latitud: telemetry?.latitud ?? null,
          longitud: telemetry?.longitud ?? null,
        }),
      });

      const data = await res.json();

      //  Detectar si se requiere 2FA
      if (data.requiresOTP && data.userId) {
        const err: any = new Error("Requiere verificación 2FA");
        err.requiresOTP = true;
        err.userId = data.userId;
        throw err;
      }

      if (!res.ok) {
        const err: any = new Error(data.error || "Error al iniciar sesión");
        err.code = data.code;
        throw err;
      }

      await fetchUserFromServer();
    } catch (err: any) {
      // Detectar error de conexión a internet
      if (err instanceof TypeError && err.message.includes("Failed to fetch")) {
        const networkErr: any = new Error("No tienes conexión a internet");
        networkErr.code = "NETWORK_ERROR";
        throw networkErr;
      }
      throw err;
    }
  };

  // SOLUCIÓN: Agregar el bloque `try {` faltante
  const signup = async (
    nombre: string,
    apellido: string,
    email: string,
    password: string
  ) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nombre, apellido, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al registrarse");
      }

      await fetchUserFromServer();
    } catch (err: any) {
      // Detectar error de conexión a internet PRIMERO
      if (err instanceof TypeError) {
        throw new Error("No tienes conexión a internet");
      }
      
      const errorMessage = err?.message || "";
      if (errorMessage.includes("Failed to fetch") || 
          errorMessage.includes("fetch failed") ||
          errorMessage.includes("Network request failed")) {
        throw new Error("No tienes conexión a internet");
      }
      
      throw err;
    }
  };

  const logoutInternal = async () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (_) {}
    
    // NUEVO — cierra también la sesión de Google/NextAuth
    try {
      await signOut({ redirect: false });
    } catch (_) {}

    clearPendingGoogleTelemetry();

    sessionStorage.removeItem("caracteristicasInmueble");
    sessionStorage.removeItem("informacionComercial");
    sessionStorage.removeItem("informacionComercialDraft");
    sessionStorage.removeItem("videoUrl");
    sessionStorage.removeItem("imageUploader_userInteracted");

    setUser(null);
  };

  const logout = logoutInternal;

  return (
    <>
      {sessionExpiredMessage && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {/* Fondo oscuro */}
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(4px)",
          }} />

          {/* Modal centrado */}
          <div style={{
            position: "relative",
            backgroundColor: "#EAE3D9",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            padding: "32px",
            maxWidth: "400px",
            width: "90%",
            textAlign: "center",
          }}>
            {/* Icono de advertencia */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "16px",
            }}>
              <div style={{
                backgroundColor: "#B47B65",
                borderRadius: "50%",
                padding: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <span style={{ fontSize: "24px", color: "white" }}>⏱️</span>
              </div>
            </div>

            {/* Título */}
            <h2 style={{
              color: "#0F172A",
              fontWeight: "bold",
              fontSize: "20px",
              marginBottom: "8px",
            }}>
              Sesión Expirada
            </h2>

            {/* Mensaje */}
            <p style={{
              color: "#6B7280",
              fontSize: "14px",
              marginBottom: "24px",
              lineHeight: "1.5",
            }}>
              {sessionExpiredMessage}
            </p>

            {/* Botón */}
            <button
              onClick={() => {
                setSessionExpiredMessage("");
                window.location.reload();
              }}
              style={{
                backgroundColor: "#B47B65",
                color: "white",
                padding: "10px 24px",
                borderRadius: "6px",
                border: "none",
                fontWeight: "bold",
                fontSize: "14px",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
              onMouseOver={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = "#a86b55";
              }}
              onMouseOut={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = "#B47B65";
              }}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
      <AuthContext.Provider value={{ user, isLoading, login, signup, logout, fetchUserFromServer }}>
        {children}
      </AuthContext.Provider>
    </>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
}

