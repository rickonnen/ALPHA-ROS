"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProtectedFeatureModal from "@/app/auth/ProtectedFeatureModal";
import AuthModal from "@/app/auth/AuthModal";
import { useAuth } from "@/app/auth/AuthContext";

interface Props {
  planId: number | string;
  isAnnual: boolean; // Estado del switch (true=anual, false=mensual)
}

export function BotonContinuarPlan({ planId, isAnnual }: Props) {
  const { user, isLoading: authLoading } = useAuth();
  const [planActualId, setPlanActualId] = useState<number>(7);
  const [modalidadActual, setModalidadActual] = useState<string>("mensual");
  const [loadingPlan, setLoadingPlan] = useState(false);

  const [showProtected, setShowProtected] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const checkoutUrl = `/cobros/sector-pagos?planId=${planId}&modalidad=${isAnnual ? "anual" : "mensual"}`;

  useEffect(() => {
    async function obtenerSuscripcion() {
      if (user?.id) {
        setLoadingPlan(true);
        try {
          const res = await fetch("/api/cobros/suscripcion-actual", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_usuario: user.id }),
          });
          const data = await res.json();
          setPlanActualId(data.id_plan ?? 7);
          setModalidadActual(data.modalidad ?? "mensual");
        } catch (e) {
          console.error("Error al obtener plan actual:", e);
        } finally {
          setLoadingPlan(false);
        }
      } else {
        setPlanActualId(7);
        setModalidadActual("mensual");
      }
    }
    obtenerSuscripcion();
  }, [user]);

  const idPlanTarjeta = Number(planId);
  const viendoAnual = isAnnual;

  // Lógica de estados
  const esMismoPlan = idPlanTarjeta === planActualId;
  const esMismaModalidad =
    (viendoAnual && modalidadActual === "anual") ||
    (!viendoAnual && modalidadActual === "mensual");

  // Determinar texto
  const getButtonText = () => {
    if (!user || planActualId === 7) return "Continuar";

    if (esMismoPlan) {
      if (esMismaModalidad) return "Plan actual";
      if (viendoAnual && modalidadActual === "mensual")
        return "Pasar a Anual (-10%)";
      if (!viendoAnual && modalidadActual === "anual")
        return "Cambiar a Mensual";
    }

    if (idPlanTarjeta > planActualId) return "Mejorar plan";
    return "Cambiar plan";
  };

  const isCurrentSelection = user && esMismoPlan && esMismaModalidad;

  if (authLoading || (user && loadingPlan)) {
    return (
      <Button disabled className="w-full font-bold">
        Cargando...
      </Button>
    );
  }

  if (user) {
    return (
      <Button
        asChild
        className="w-full font-bold"
        variant={isCurrentSelection ? "outline" : "default"}
      >
        <Link href={checkoutUrl}>{getButtonText()}</Link>
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
