"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProtectedFeatureModal from "@/app/auth/ProtectedFeatureModal";
import AuthModal from "@/app/auth/AuthModal";
import { useAuth } from "@/app/auth/AuthContext";

interface Props {
  planId: number | string;
  isAnnual: boolean;
}

export function BotonContinuarPlan({ planId, isAnnual }: Props) {
  const { user, isLoading: authLoading } = useAuth();
  const [planActualId, setPlanActualId] = useState<number>(7);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const [showProtected, setShowProtected] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // URL de destino para el pago
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
          // Si la API devuelve el plan, lo guardamos; si no, por defecto 7
          setPlanActualId(data.id_plan ?? 7);
        } catch (e) {
          console.error("Error al obtener plan actual:", e);
        } finally {
          setLoadingPlan(false);
        }
      } else {
        setPlanActualId(7);
      }
    }
    obtenerSuscripcion();
  }, [user]);

  const idPlanTarjeta = Number(planId);
  const isCurrentPlan = idPlanTarjeta === planActualId && planActualId !== 7;

  // Lógica de textos según comparación
  const getButtonText = () => {
    if (planActualId === 7) return "Continuar";
    if (idPlanTarjeta === planActualId) return "Plan actual";
    if (idPlanTarjeta > planActualId) return "Mejorar plan";
    if (idPlanTarjeta < planActualId) return "Cambiar a plan inferior";
    return "Continuar";
  };

  // Mientras carga la auth o la info del plan, mostramos estado deshabilitado
  if (authLoading || (user && loadingPlan)) {
    return (
      <Button disabled className="w-full font-bold">
        Cargando...
      </Button>
    );
  }

  // Si el usuario está logueado
  if (user) {
    return (
      <Button
        asChild
        className="w-full font-bold"
        variant={isCurrentPlan ? "outline" : "default"}
      >
        {/* Aquí siempre usamos checkoutUrl para que funcione el click */}
        <Link href={checkoutUrl}>{getButtonText()}</Link>
      </Button>
    );
  }

  // Si no hay usuario, botón que abre el flujo de registro/login
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
