"use client";  // Componente de cliente (React)
import React, { createContext, useState, useContext, useEffect } from "react";

// 📦 TIPOS
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

// 📝 CREAR CONTEXTO
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 🔐 ESTADOS
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔍 FUNCIÓN AUXILIAR: Obtener usuario del servidor
  const fetchUserFromServer = async () => {
    try {
      // Llamar a /api/auth/me
      const res = await fetch("/api/auth/me", {
        credentials: "include",  // ⭐ IMPORTANTE: Enviar cookies con el request
        // ↳ Sin esto, la cookie httpOnly NO se envía
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);  // Guardar usuario en memory (NO en localStorage)
        return true;
      }
    } catch (error) {
      console.error("Error fetching user from server:", error);
    }
    return false;
  };

  // 🚀 AL MONTAR COMPONENTE: Verificar si hay sesión
  useEffect(() => {
    const checkSession = async () => {
      try {
        // 1️⃣ Verificar si es usuario de Google (NextAuth)
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
            return;  // Salir, usuario ya identificado
          }
        }

        // 2️⃣ Verificar si es usuario email/password (JWT en cookie)
        await fetchUserFromServer();
        // ↳ Si hay JWT válido en cookie → Obtiene usuario
        // ↳ Si NO hay JWT o expiró → user sigue null
        
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);  // Dejar de cargar aunque falle
      }
    };

    checkSession();
  }, []);  // Solo ejecutar una vez al montar

  // 🔐 FUNCIÓN: LOGIN
  const login = async (email: string, password: string) => {
    // 1. Enviar email/password a servidor
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",  // Enviar/recibir cookies
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Error al iniciar sesión");
    }

    // 2. Servidor respondió OK y guardó JWT en cookie
    // 3. Obtener usuario desde /api/auth/me
    await fetchUserFromServer();
    // ↳ Ahora user tiene datos del usuario autenticado
  };

  // 📝 FUNCIÓN: SIGNUP
  const signup = async (name: string, email: string, password: string) => {
    // 1. Enviar datos a servidor
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Error al registrarse");
    }

    // 2. JWT guardado en cookie
    // 3. Obtener usuario
    await fetchUserFromServer();
  };

  // 🚪 FUNCIÓN: LOGOUT
  const logout = async () => {
    try {
      // Llamar a /api/auth/logout para borrar cookie
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (_) {}

    // Limpiar estado (NO hay localStorage que limpiar)
    setUser(null);
    // ❌ NO HAY: localStorage.removeItem("user")
  };

  // 📦 RETORNAR CONTEXTO
  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 🎣 HOOK PERSONALIZADO PARA USAR EL CONTEXTO
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
}
