"use client";  // Componente de cliente (React)
import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { signOut } from "next-auth/react"; 

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (nombre: string, apellido: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const INACTIVITY_TIMEOUT = 15*60*1000; 

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState("");
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);


  // Resetear tiempo de inactividad
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    const timer = setTimeout(() => {
      handleSessionTimeout();
    }, INACTIVITY_TIMEOUT);

    inactivityTimerRef.current = timer;
  };

  // Manejar expiration de sesión por inactividad
  const handleSessionTimeout = async () => {
    setSessionExpiredMessage("Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.");
    await logoutInternal();
    // Mantener el mensaje visible por 5 segundos antes de recargar la página
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  };

  const fetchUserFromServer = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include", 
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user); 
        resetInactivityTimer();
        return true;
      }
    } catch (error) {
      console.error("Error fetching user from server:", error);
    }
    return false;
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const session = await sessionRes.json();
          if (session?.user) {
            // Google user encontrado
            const googleUser: User = {
              id: session.user.id ?? session.user.email ?? "",
              name: session.user.name ?? "",
              email: session.user.email ?? "",
            };
            setUser(googleUser);
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

  // Efecto separado para manejar tiempo de inactividad cuando hay usuario
  useEffect(() => {
    if (user) {
      resetInactivityTimer();
    }
  }, [user]);

  // Efecto separado para agregar listeners de actividad
  useEffect(() => {
    if (!user) return;

    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    window.addEventListener("mousedown", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("touchstart", handleUserActivity);
    window.addEventListener("click", handleUserActivity);

    return () => {
      window.removeEventListener("mousedown", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);
    };
  }, [user]);  

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
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

  const signup = async (nombre: string, apellido: string, email: string, password: string) => {
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
 //  NUEVO — cierra también la sesión de Google/NextAuth
    try {
      await signOut({ redirect: false });
    } catch (_) {}

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
      <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
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
