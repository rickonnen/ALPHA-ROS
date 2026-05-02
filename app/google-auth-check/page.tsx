"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OTP2FAModal from "@/app/auth/OTP2FAModal";

const POST_AUTH_REDIRECT_KEY = "postAuthRedirect";

function getSafeRedirectTarget(
  searchRedirect: string | null,
  sessionRedirect: string | null,
) {
  const candidate = searchRedirect || sessionRedirect || "/";
  return candidate.startsWith("/") ? candidate : "/";
}

export default function GoogleAuthCheckPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [pending2FAUserId, setPending2FAUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const redirectTarget = useMemo(() => {
    const sessionRedirect =
      typeof window === "undefined"
        ? null
        : sessionStorage.getItem(POST_AUTH_REDIRECT_KEY);

    return getSafeRedirectTarget(
      searchParams.get("redirect"),
      sessionRedirect,
    );
  }, [searchParams]);

  const navigateAfterAuth = useCallback(async () => {
    try {
      const resMe = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (resMe.ok) {
        const dataMe = await resMe.json();
        const userRol = dataMe.user.rol;
        if (userRol === 1) {
          router.push("/admin/verificacion-pagos");
          return;
        }
      }
    } catch (error) {
      console.error("[GoogleAuthCheck] Error fetching user role:", error);
    } finally {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY);
      }
    }

    router.push(redirectTarget);
  }, [redirectTarget, router]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (!sessionRes.ok) {
          router.push("/");
          return;
        }

        const session = await sessionRes.json();
        if (!session?.user?.id) {
          router.push("/");
          return;
        }

        const check2FARes = await fetch("/api/auth/check-2fa-status");
        if (!check2FARes.ok) {
          router.push("/");
          return;
        }

        const { requires2FA, userId } = await check2FARes.json();

        if (requires2FA && userId) {
          setPending2FAUserId(userId);
          setShow2FAModal(true);
          setIsLoading(false);
          return;
        }

        void navigateAfterAuth();
      } catch (error) {
        console.error("[GoogleAuthCheck] Error:", error);
        router.push("/");
      }
    };

    void checkAuthStatus();
  }, [navigateAfterAuth, router]);

  const handle2FASuccess = async () => {
    setShow2FAModal(false);
    await navigateAfterAuth();
  };

  const handle2FACancel = () => {
    setShow2FAModal(false);
    router.push(redirectTarget);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
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
          <p>Verificando autenticacion...</p>
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
