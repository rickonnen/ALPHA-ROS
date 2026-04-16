import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  rol: number;
}

export function useVerifyJWT() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyJWT() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          console.log("[JWT VERIFIED] Usuario autenticado:", data.user.email);
        } else {
          setUser(null);
          console.log("[JWT] No hay sesión válida");
        }
      } catch (error) {
        console.error("[JWT ERROR]:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    verifyJWT();
  }, []);

  return { user, loading };
}
