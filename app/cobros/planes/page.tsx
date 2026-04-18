import { getPlanesPublicacion } from "@/features/cobros/planes/getPlanesPublicacion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PricingClient } from "@/components/cobros/PricingClient";

export default async function PlanesPublicacion() {
  const planes = await getPlanesPublicacion();

  const planesFormateados = planes.map((plan) => ({
    id_plan: plan.id_plan,
    nombre_plan: plan.nombre_plan ?? "Plan",
    precio_plan: Number(plan.precio_plan),
    cant_publicaciones: plan.cant_publicaciones ?? 0,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <main className="max-w-6xl mx-auto px-6 pt-10 pb-12">
        <div className="mb-8 flex items-center">
          <Button variant="default" asChild className="rounded-lg">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="font-bold text-sm">Volver al inicio</span>
            </Link>
          </Button>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4">
            ELIGE TU PLAN
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Selecciona uno de nuestros planes para obtener más cupos de
            publicación.
          </p>
        </div>

        <PricingClient planes={planesFormateados} />
      </main>
    </div>
  );
}
