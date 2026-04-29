"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OTP2FAModal from "@/app/auth/OTP2FAModal";

export default function GoogleAuthCheckPage() {
  const router = useRouter();
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [pending2FAUserId, setPending2FAUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Verificar si el usuario tiene sesión
        const sessionRes = await fetch("/api/auth/session");
        if (!sessionRes.ok) {
          console.log("[GoogleAuthCheck] No hay sesión, redirigiendo a login");
          router.push("/");
          return;
        }

        const session = await sessionRes.json();
        if (!session?.user?.id) {
          console.log("[GoogleAuthCheck] No hay usuario en sesión");
          router.push("/");
          return;
        }

        // Verificar si requiere 2FA
        console.log("[GoogleAuthCheck] Verificando si usuario requiere 2FA...");
        const check2FARes = await fetch("/api/auth/check-2fa-status");
        if (!check2FARes.ok) {
          console.error("[GoogleAuthCheck] Error checking 2FA status");
          router.push("/");
          return;
        }

        const { requires2FA, userId } = await check2FARes.json();
        console.log("[GoogleAuthCheck] requires2FA:", requires2FA, "userId:", userId);

        if (requires2FA && userId) {
          // Requiere 2FA - mostrar modal
          console.log("[GoogleAuthCheck] Mostrando modal 2FA");
          setPending2FAUserId(userId);
          setShow2FAModal(true);
          setIsLoading(false);
        } else {
          // No requiere 2FA - redirigir al home
          console.log("[GoogleAuthCheck] No requiere 2FA, redirigiendo a /");
          router.push("/");
        }
      } catch (error) {
        console.error("[GoogleAuthCheck] Error:", error);
        router.push("/");
      }
    };

    checkAuthStatus();
  }, [router]);

  const handle2FASuccess = async () => {
    console.log("[GoogleAuthCheck] 2FA verificado, redirigiendo...");
    setShow2FAModal(false);

    // Obtener rol del usuario
    try {
      const resMe = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (resMe.ok) {
        const dataMe = await resMe.json();
        const userRol = dataMe.user.rol;
        if (userRol === 1) {
          router.push("/admin/verificacion-pagos");
        } else {
          router.push("/");
        }
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("[GoogleAuthCheck] Error fetching user role:", error);
      router.push("/");
    }
  };

  const handle2FACancel = () => {
    console.log("[GoogleAuthCheck] 2FA cancelado");
    setShow2FAModal(false);
    router.push("/");
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      {isLoading ? (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #e5e7eb",
              borderTop: "3px solid #0F172A",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p>Verificando autenticación...</p>
        </div>
      ) : show2FAModal ? (
        <OTP2FAModal
          userId={pending2FAUserId}
          onSuccess={handle2FASuccess}
          onCancel={handle2FACancel}
        />
      ) : null}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
