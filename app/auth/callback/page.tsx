"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { CircleEllipsis, CheckCircle2, XCircle, X } from "lucide-react";

/**
 * Página a donde el usuario es redirigido tras hacer clic en el Magic Link.
 */
export default function Callback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus]   = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("Error al obtener usuario. Intenta nuevamente.");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get("token");
        const email = searchParams.get("email");

        console.log("[Callback] Parámetros recibidos:", { token: token?.substring(0, 10) + "...", email });

        if (!token || !email) {
          console.error("[Callback] Falta token o email en URL");
          setErrorMsg("Link inválido o incompleto. Solicita uno nuevo.");
          setStatus("error");
          return;
        }

        const verifyResponse = await fetch("/api/auth/magic-link/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email, 
            token 
          }),
        });

        const verifyData = await verifyResponse.json();

        if (!verifyResponse.ok) {
          console.error("[Callback] Error en verify:", verifyData.error);
          setErrorMsg(verifyData.error || "Tu enlace ha caducado. Solicita un nuevo enlace mágico.");
          setStatus("error");
          return;
        }

        console.log("[Callback] Token verificado para:", email, "| Usuario:", verifyData.usuario.id);

        const result = await signIn("magic-link", { email, redirect: false });

        if (!result?.ok) {
          console.error("[Callback] Error creando sesión NextAuth:", result?.error);
          setErrorMsg("Error al iniciar sesión. Intenta nuevamente.");
          setStatus("error");
          return;
        }

        console.log("[Callback] Sesión NextAuth creada exitosamente");
        setStatus("success");
        // Auto-redirige tras 2 s si el usuario no pulsa Aceptar
        setTimeout(() => { window.location.href = "/"; }, 2000);

      } catch (error) {
        console.error("[Callback] Error:", error);
        setErrorMsg("Error interno. Intenta nuevamente.");
        setStatus("error");
      }
    };

    handleCallback();
  }, [router, searchParams]);

  /* ─── Colores y textos por estado ─── */
  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError   = status === "error";

  const cardBg    = "bg-white";
  const title     = isLoading ? "Procesando tu acceso"
                  : isSuccess ? "¡Éxito!"
                  :             "¡Ocurrió un error!";
  const message   = isLoading ? "Verificando tu Magic Link..."
                  : isSuccess ? "Se verificó tu sesión con Magic Link exitosamente."
                  :             errorMsg;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/*
        Tarjeta: ancho y padding fijos para los 3 estados sean idénticos.
        min-h garantiza la misma altura aunque un estado tenga menos contenido.
      */}
      <div
        className={`
          relative ${cardBg} rounded-2xl shadow-xl
          w-full max-w-sm h-[300px]
          px-8 py-8
          flex flex-col items-center justify-center gap-4
        `}
      >
        {/* Botón X — solo en success y error */}
        {!isLoading && (
          <button
            onClick={() => router.push("/")}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        )}

        {/* Ícono circular de Lucide */}
        {isLoading && <CircleEllipsis size={56} className="text-[#C26E5A]" strokeWidth={1.5} />}
        {isSuccess && <CheckCircle2   size={56} className="text-[#16A34A]" strokeWidth={1.5} />}
        {isError   && <XCircle        size={56} className="text-[#DC2626]" strokeWidth={1.5} />}

        {/* Título */}
        <h3 className="text-xl font-bold text-[#1F3A4D] text-center">{title}</h3>

        {/* Mensaje */}
        <p className="text-sm text-[#1F3A4D]/70 text-center leading-relaxed">{message}</p>

        {/*
          Botón de acción — siempre ocupa el mismo espacio.
          En loading se renderiza invisible para mantener el alto igual.
        */}
        {!isLoading && (
        <button
          onClick={() => {
            if (isSuccess) window.location.href = "/";
            else router.push("/");
          }}
          className={`
            w-full py-3 font-bold rounded-xl transition-colors text-white mt-2
            ${isSuccess ? "bg-[#1F3A4D] hover:bg-[#162d3d]" : ""}
            ${isError   ? "bg-[#C26E5A] hover:bg-[#b05e4a]" : ""}
          `}
        >
          {isSuccess ? "Aceptar" : "Reintentar"}
        </button>
        )}
      </div>
    </div>
  );
}