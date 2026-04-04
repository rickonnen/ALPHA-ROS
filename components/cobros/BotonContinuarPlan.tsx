"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProtectedFeatureModal from "@/app/auth/ProtectedFeatureModal";
import AuthModal from "@/app/auth/AuthModal";
import { useAuth } from "@/app/auth/AuthContext";

interface Props {
  planId: number | string;
}

export function BotonContinuarPlan({ planId }: Props) {
  const { user, isLoading } = useAuth();

  const [showProtected, setShowProtected] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  if (isLoading) {
    return (
      <Button disabled className="w-full font-bold">
        Cargando...
      </Button>
    );
  }

  if (user) {
    return (
      <Button asChild className="w-full font-bold">
        <Link href={`/cobros/sector-pagos?planId=${planId}`}>Continuar</Link>
      </Button>
    );
  }

  return (
    <>
      <Button
        className="w-full font-bold"
        onClick={() => setShowProtected(true)}
      >
        Continuar
      </Button>

      <ProtectedFeatureModal
        isOpen={showProtected}
        featureName="comprar planes"
        onClose={() => setShowProtected(false)}
        onLoginClick={() => {
          setShowProtected(false);
          setAuthMode("login");
          setShowAuth(true);
        }}
        onRegisterClick={() => {
          setShowProtected(false);
          setAuthMode("register");
          setShowAuth(true);
        }}
      />
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        initialMode={authMode}
      />
    </>
  );
}
