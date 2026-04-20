"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProtectedFeatureModal from "@/app/auth/ProtectedFeatureModal";
import AuthModal from "@/app/auth/AuthModal";
import { ModalDowngrade } from "@/components/cobros/ModalDowngrade";
import { useAuth } from "@/app/auth/AuthContext";

interface Props {
  planId: number | string;
  isAnnual: boolean;
}

export function BotonContinuarPlan({ planId, isAnnual }: Props) {
  const { user, isLoading: authLoading } = useAuth();

  const [planActualId, setPlanActualId] = useState<number>(7);
  const [modalidadActual, setModalidadActual] = useState<string>("mensual");
  const [loadingPlan, setLoadingPlan] = useState(false);

  const [showProtected, setShowProtected] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);

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
      }
    }
    obtenerSuscripcion();
  }, [user]);

  const idPlanTarjeta = Number(planId);
  const esMismoPlan = idPlanTarjeta === planActualId;
  const esMismaModalidad =
    (isAnnual && modalidadActual === "anual") ||
    (!isAnnual && modalidadActual === "mensual");

  const esDowngrade = user && idPlanTarjeta < planActualId;
  const isCurrentSelection = user && esMismoPlan && esMismaModalidad;

  const getButtonText = () => {
    if (!user || planActualId === 7) return "Continuar";
    if (esMismoPlan) {
      if (esMismaModalidad) return "Plan actual";
      return isAnnual ? "Pasar a Anual (-10%)" : "Cambiar a Mensual";
    }
    return idPlanTarjeta > planActualId ? "Mejorar plan" : "Cambiar plan";
  };

  // --- FUNCIÓN ACTUALIZADA CON RELOAD ---
  const ejecutarDowngrade = async () => {
    try {
      const res = await fetch("/api/cobros/downgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: user?.id,
          nuevo_plan_id: idPlanTarjeta,
          modalidad: isAnnual ? "anual" : "mensual",
        }),
      });

      if (res.ok) {
        // Forzamos la recarga completa de la página para ver los cambios
        window.location.reload();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Error al procesar el cambio");
      }
    } catch (e) {
      console.error("Error en downgrade:", e);
    }
  };

  if (authLoading || (user && loadingPlan)) {
    return (
      <Button disabled className="w-full font-bold">
        Cargando...
      </Button>
    );
  }

  if (user) {
    return (
      <>
        {esDowngrade && !esMismoPlan ? (
          <Button
            className="w-full font-bold"
            onClick={() => setShowDowngradeModal(true)}
          >
            {getButtonText()}
          </Button>
        ) : (
          <Button
            asChild
            className="w-full font-bold"
            variant={isCurrentSelection ? "outline" : "default"}
          >
            <Link href={checkoutUrl}>{getButtonText()}</Link>
          </Button>
        )}

        <ModalDowngrade
          isOpen={showDowngradeModal}
          onClose={() => setShowDowngradeModal(false)}
          onConfirm={ejecutarDowngrade}
          nombrePlan={String(planId)}
        />
      </>
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
