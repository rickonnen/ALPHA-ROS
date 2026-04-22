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
  cantPublicacionesTarjeta: number; // Cupos de este plan
}

export function BotonContinuarPlan({
  planId,
  isAnnual,
  cantPublicacionesTarjeta,
}: Props) {
  const { user, isLoading: authLoading } = useAuth();

  // Estados del plan actual del usuario
  const [planActualId, setPlanActualId] = useState<number>(7);
  const [modalidadActual, setModalidadActual] = useState<string>("mensual");
  const [capacidadActual, setCapacidadActual] = useState<number>(0);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Estados de modales
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
          // Es fundamental que tu API devuelva el objeto planPublicacion con cant_publicaciones
          setCapacidadActual(data.PlanPublicacion?.cant_publicaciones ?? 0);
        } catch (e) {
          console.error("Error al obtener suscripción:", e);
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

  // Lógica de Downgrade: ¿El plan de la tarjeta tiene menos cupos que el que ya tiene el usuario?
  const esDowngrade = user && cantPublicacionesTarjeta < capacidadActual;
  const isCurrentSelection = user && esMismoPlan && esMismaModalidad;

  const getButtonText = () => {
    if (!user || planActualId === 7) return "Continuar";

    if (esMismoPlan) {
      if (esMismaModalidad) return "Plan actual";
      return isAnnual ? "Pasar a Anual (-10%)" : "Cambiar a Mensual";
    }

    // Texto dinámico basado en la comparación de cupos
    if (cantPublicacionesTarjeta > capacidadActual) {
      return "Cambiar a plan superior";
    }
    return "Cambiar a plan inferior";
  };

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
        // Refresco total para limpiar estados y ver el "Plan actual"
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

  // Flujo para usuario Logueado
  if (user) {
    return (
      <>
        {esDowngrade && !esMismoPlan ? (
          // Si es inferior, el botón abre el modal de advertencia
          <Button
            className="w-full font-bold"
            onClick={() => setShowDowngradeModal(true)}
          >
            {getButtonText()}
          </Button>
        ) : (
          // Si es igual o superior, el botón es un Link (o maneja el cambio de modalidad)
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
          nombrePlan={String(planId)} // Puedes pasar el nombre si lo tienes
        />
      </>
    );
  }

  // Flujo para usuario Invitado
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
