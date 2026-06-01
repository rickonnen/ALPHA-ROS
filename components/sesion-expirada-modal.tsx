"use client";

/**
 * SesionExpiradaModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Modal global que se muestra cuando el servidor invalida la sesión del usuario
 * desde otro dispositivo (respuesta 401 con header X-Session-Expired: true).
 *
 * Uso: colocar una sola vez en el root layout o en el componente de AuthContext.
 *
 * El componente escucha dos mecanismos:
 *   1. El evento global "sesion:expirada" disparado por cualquier fetch helper.
 *   2. Un interceptor de fetch global que detecta 401 + X-Session-Expired.
 *
 * Ejemplo de disparo manual desde cualquier parte de la app:
 *   window.dispatchEvent(new Event("sesion:expirada"));
 */

import { useEffect, useState } from "react";
import { Laptop, Smartphone } from "lucide-react";
import { useAuth } from "@/app/auth/AuthContext";
import { useRouter } from "next/navigation";

export default function SesionExpiradaModal() {
  const [visible, setVisible] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  // ── escuchar evento global ────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setVisible(true);
    window.addEventListener("sesion:expirada", handler);
    return () => window.removeEventListener("sesion:expirada", handler);
  }, []);

  // ── interceptor fetch global ──────────────────────────────────────────────
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      // Solo actuar en 401 con header de sesión expirada
      if (
        response.status === 401 &&
        response.headers.get("X-Session-Expired") === "true"
      ) {
        // Clonar para no consumir el body
        window.dispatchEvent(new Event("sesion:expirada"));
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // ── acción del botón ──────────────────────────────────────────────────────
  const handleVolver = async () => {
    setVisible(false);
    await logout();
    router.push("/");
  };

  if (!visible) return null;

  return (
    /* Overlay */
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 w-full max-w-[320px] mx-4 text-center shadow-2xl animate-in zoom-in-95 duration-300">

        {/* Ícono */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              {/* Laptop + Phone superpuestos — misma estética del mockup */}
              <Laptop className="w-9 h-9 text-red-400" />
            </div>
            {/* Pequeño badge de smartphone */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center border-2 border-white">
              <Smartphone className="w-4 h-4 text-red-400" />
            </div>
          </div>
        </div>

        {/* Título */}
        <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
          Tu sesión expiró
        </h2>

        {/* Descripción */}
        <p className="text-sm text-gray-500 leading-relaxed mb-1">
          Tu sesión fue cerrada de forma remota por uno de tus dispositivos conectados.
        </p>
        <p className="text-xs text-gray-400 mb-7">
          Por seguridad, vuelve a ingresar tus credenciales.
        </p>

        {/* Botón */}
        <button
          onClick={handleVolver}
          className="w-full py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors shadow-lg shadow-red-200 cursor-pointer"
        >
          Volver a iniciar sesión
        </button>
      </div>
    </div>
  );
}
