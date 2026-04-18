"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BotonContinuarPlan } from "@/components/cobros/BotonContinuarPlan";

interface PlanFormateado {
  id_plan: number | string;
  nombre_plan: string;
  precio_plan: number;
  cant_publicaciones: number;
}

export function PricingClient({ planes }: { planes: PlanFormateado[] }) {
  const [isAnnual, setIsAnnual] = useState(false);

  const formatPrice = (price: number) => {
    return price.toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <>
      <div className="flex flex-col items-center mb-16">
        <div className="relative flex items-center bg-muted rounded-xl p-1 shadow-inner">
          <span className="absolute -top-6 right-6 text-xs font-bold text-foreground">
            Ahorra un 10%
          </span>
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-8 py-2 text-lg font-black rounded-lg transition-all ${!isAnnual ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}
          >
            MENSUAL
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-8 py-2 text-lg font-black rounded-lg transition-all ${isAnnual ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}
          >
            ANUAL
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {planes.map((plan) => {
          const precioMensual = plan.precio_plan;
          const precioAnualBase = precioMensual * 12;
          const precioAnualDescuento = precioAnualBase * 0.9;

          return (
            <Card
              key={plan.id_plan}
              className="flex flex-col text-center border shadow-sm rounded-2xl pt-6 hover:border-primary transition-all"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-black uppercase">
                  {plan.nombre_plan}
                </CardTitle>
              </CardHeader>
              <CardContent className="grow flex flex-col items-center justify-start px-6 pb-8">
                <div className="flex flex-col items-center justify-center min-h-[120px]">
                  {isAnnual ? (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        $ {formatPrice(precioAnualBase)}/año
                      </span>
                      <span className="text-2xl font-black">
                        $ {formatPrice(precioAnualDescuento)}/año
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-black">
                      $ {formatPrice(precioMensual)}/mes
                    </span>
                  )}
                </div>
                <div className="mt-4 text-sm font-medium">
                  + {plan.cant_publicaciones} cupos
                </div>
              </CardContent>
              <div className="border-t p-6">
                <BotonContinuarPlan planId={plan.id_plan} isAnnual={isAnnual} />
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
