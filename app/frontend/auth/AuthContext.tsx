"use client";
import React, { createContext, useState, useContext, useEffect } from "react";
import { SessionProvider } from "next-auth/react";

interface User {
  id: string;
  name: string;
  email: string;
}
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Verificar sesión al cargar — revisa localStorage, NextAuth (Google) y cookie propia
  useEffect(() => {
    const checkSession = async () => {
      try {
        // 1. Primero verificar localStorage (usuarios email/password)
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsLoading(false);
          return;
        }
        // 2. Verificar sesión de NextAuth (usuarios de Google)
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
            localStorage.setItem("user", JSON.stringify(googleUser));
            setIsLoading(false);
            return;
          }
        }
        // 3. Verificar sesión propia por cookie JWT
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
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

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Error al iniciar sesión");
    }

    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Error al registrarse");
    }

    if (data.user) {
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
  };

  const logout = async () => {
    try {
      // Cerrar sesión propia (cookie JWT)
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (_) {}

    try {
      // Cerrar sesión de NextAuth (Google)
      const { signOut } = await import("next-auth/react");
      await signOut({ redirect: false });
    } catch (_) {}

    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <SessionProvider>
      <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
        {children}
      </AuthContext.Provider>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
}