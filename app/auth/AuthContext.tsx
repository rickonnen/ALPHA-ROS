"use client";
import React, { createContext, useState, useContext, useEffect } from "react";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionRes = await fetch("/api/auth/session");

        if (sessionRes.ok) {
          const session = await sessionRes.json();

          if (session?.user) {
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

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Error al iniciar sesión");
    }

    await fetchUserFromServer();
  };

  const signup = async (
    nombre: string,
    apellido: string,
    email: string,
    password: string
  ) => {
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
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (_) {}

    sessionStorage.removeItem("caracteristicasInmueble");
    sessionStorage.removeItem("informacionComercial");
    sessionStorage.removeItem("informacionComercialDraft");
    sessionStorage.removeItem("videoUrl");
    sessionStorage.removeItem("imageUploader_userInteracted");

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
}