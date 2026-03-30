"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProtectedFeatureModal from "@/app/frontend/auth/ProtectedFeatureModal";
import AuthModal from "@/app/frontend/auth/AuthModal";

interface Props {
  planId: number | string;
  idUsuario: string;
}

export function BotonContinuarPlan({ planId, idUsuario }: Props) {
  const [showProtected, setShowProtected] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // VERIFICACIÓN A PRUEBA DE BALAS:
  // Comprobamos que exista, que no esté vacío y que no sea la palabra literal "undefined"
  const tieneSesion =
    idUsuario && idUsuario !== "" && idUsuario !== "undefined";

  // Si el usuario ESTÁ logueado, renderizamos el enlace normal
  if (tieneSesion) {
    return (
      <Button asChild className="w-full font-bold">
        <Link
          href={`/frontend/cobros/sector-pagos?planId=${planId}&id=${idUsuario}`}
        >
          Continuar
        </Link>
      </Button>
    );
  }

  // Si el usuario NO está logueado, renderizamos un botón que abre el modal
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
