"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { CircleEllipsis, CheckCircle2, XCircle, X } from "lucide-react";

const BROADCAST_CHANNEL = "magic_link_auth";

/**
 * Pestaña C del flujo Magic Link.
 * Se abre cuando el usuario hace clic en el enlace del email.
 *
 * 1. Lee sessionId de ?sessionId= y token de #token=
 * 2. Verifica el token contra el backend
 * 3. Crea sesión NextAuth (cookie compartida con todas las pestañas)
 * 4. Emite MAGIC_LINK_SUCCESS por BroadcastChannel → Pestaña A redirige a /home
 * 5. Intenta cerrar esta pestaña automáticamente
 */
export default function Callback() {
  const router = useRouter();
  const [status, setStatus]     = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("Error al obtener usuario. Intenta nuevamente.");
  const [canClose, setCanClose] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      try {
        // Leer token desde el hash y sessionId desde los query params
        const token     = new URLSearchParams(window.location.hash.slice(1)).get("token");
        const sessionId = new URLSearchParams(window.location.search).get("sessionId");

        console.log("[Callback] Parámetros recibidos:", {
          token: token ? token.substring(0, 10) + "..." : null,
          sessionId: sessionId ? sessionId.substring(0, 8) + "..." : null,
        });

        if (!token) {
          console.error("[Callback] Falta token en URL");
          setErrorMsg("Link inválido o incompleto. Solicita uno nuevo.");
          setStatus("error");
          return;
        }

        // Verificar token en el backend
        const verifyResponse = await fetch("/api/auth/magic-link/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const verifyData = await verifyResponse.json();

        if (!verifyResponse.ok) {
          console.error("[Callback] Token inválido/consumido/expirado:", verifyData.error);
          // STOP: no signIn, no postMessage, no refetch de sesión
          setErrorMsg(verifyData.error || "Tu enlace ha caducado. Solicita un nuevo enlace mágico.");
          setStatus("error");
          return;
        }

        const email = verifyData.usuario.email;
        console.log("[Callback] Token verificado para:", email, "| Usuario:", verifyData.usuario.id);

        // Crear sesión NextAuth (la cookie quedará disponible en todas las pestañas)
        const result = await signIn("magic-link", { email, redirect: false });

        if (!result?.ok) {
          console.error("[Callback] Error creando sesión NextAuth:", result?.error);
          setErrorMsg("Error al iniciar sesión. Intenta nuevamente.");
          setStatus("error");
          return;
        }

        console.log("[Callback] Sesión NextAuth creada exitosamente");

        // Notificar a la pestaña original vía BroadcastChannel
        if (sessionId) {
          const channel = new BroadcastChannel(BROADCAST_CHANNEL);
          channel.postMessage({ type: "MAGIC_LINK_SUCCESS", sessionId });
          channel.close();
          console.log("[Callback] BroadcastChannel emitido con sessionId:", sessionId.substring(0, 8) + "...");
        } else {
          console.warn("[Callback] Sin sessionId — flujo cross-tab no disponible");
        }

        setStatus("success");

        // Intentar cerrar la pestaña después de mostrar el mensaje de éxito
        setTimeout(() => {
          window.close();
          // Si window.close() no funciona (el navegador lo bloqueó),
          // mostramos el botón "Puedes cerrar esta pestaña"
          setTimeout(() => setCanClose(true), 400);
        }, 1200);

      } catch (error) {
        console.error("[Callback] Error:", error);
        setErrorMsg("Error interno. Intenta nuevamente.");
        setStatus("error");
      }
    };

    handleCallback();
  }, []);

  /* ─── Colores y textos por estado ─── */
  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError   = status === "error";

  const title   = isLoading ? "Procesando tu acceso"
                : isSuccess ? "¡Éxito!"
                :             "¡Ocurrió un error!";
  const message = isLoading ? "Verificando tu Magic Link..."
                : isSuccess ? (canClose
                    ? "Sesión iniciada. Puedes cerrar esta pestaña."
                    : "Sesión verificada. Cerrando pestaña...")
                :             errorMsg;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`
          relative bg-white rounded-2xl shadow-xl
          w-full max-w-sm h-75
          px-8 py-8
          flex flex-col items-center justify-center gap-4
        `}
      >
        {/* Botón X — solo en error (en success se cierra sola) */}
        {isError && (
          <button
            onClick={() => { window.close(); setTimeout(() => router.push("/"), 400); }}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        )}

        {isLoading && <CircleEllipsis size={56} className="text-[#C26E5A]" strokeWidth={1.5} />}
        {isSuccess && <CheckCircle2   size={56} className="text-[#16A34A]" strokeWidth={1.5} />}
        {isError   && <XCircle        size={56} className="text-[#DC2626]" strokeWidth={1.5} />}

        <h3 className="text-xl font-bold text-[#1F3A4D] text-center">{title}</h3>
        <p className="text-sm text-[#1F3A4D]/70 text-center leading-relaxed">{message}</p>

        {/* Botón solo en error o si el navegador bloqueó window.close() */}
        {(isError || (isSuccess && canClose)) && (
          <button
            onClick={() => {
              if (isSuccess) {
                window.close();
              } else {
                // Intentar cerrar la pestaña — si el navegador lo bloquea, redirigir a inicio
                window.close();
                setTimeout(() => router.push("/"), 400);
              }
            }}
            className={`
              w-full py-3 font-bold rounded-xl transition-colors text-white mt-2
              ${isSuccess ? "bg-[#1F3A4D] hover:bg-[#162d3d]" : ""}
              ${isError   ? "bg-[#C26E5A] hover:bg-[#b05e4a]" : ""}
            `}
          >
            {isSuccess ? "Cerrar pestaña" : "Cerrar pestaña"}
          </button>
        )}
      </div>
    </div>
  );
}
