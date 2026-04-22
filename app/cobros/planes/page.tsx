import { getPlanesPublicacion } from "@/features/cobros/planes/getPlanesPublicacion";
import { PricingClient } from "@/components/cobros/PricingClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function PlanesPublicacion() {
  const planes = await getPlanesPublicacion();

  // Mapeamos para evitar errores de Decimal en el cliente
  const planesFormateados = planes.map((plan) => ({
    id_plan: plan.id_plan,
    nombre_plan: plan.nombre_plan ?? "Plan",
    precio_plan: Number(plan.precio_plan),
    cant_publicaciones: plan.cant_publicaciones ?? 0,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <main className="max-w-6xl mx-auto px-6 pt-10 pb-12">
        {/* CABECERA: Recuperamos la estructura original con absolute para el título */}
        <div className="relative mb-12 flex flex-col md:flex-row md:items-center justify-center min-h-11 gap-6 md:gap-0">
          <div className="self-start md:self-auto md:absolute md:left-0">
            {/* Botón con el estilo de la imagen: fuente semibold y stroke de flecha */}
            <Button variant="default" asChild className="rounded-lg px-4 py-2">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4 stroke-[3]" />
                <span className="font-semibold text-sm">Volver al inicio</span>
              </Link>
            </Button>
          </div>

          <div className="text-center w-full max-w-2xl md:px-20 mx-auto">
            {/* Título centrado con font-extrabold como lo tenías antes */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground uppercase tracking-tight">
              ELIGE TU PLAN
            </h1>
          </div>
        </div>

        {/* DESCRIPCIÓN */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Selecciona uno de nuestros planes para obtener más cupos de
            publicación. Cada plan incluye una cantidad de publicaciones que te
            permitirán anunciar más inmuebles dentro de la plataforma.
          </p>
        </div>

        {/* Pasamos los planes al PricingClient para mantener la lógica de suscripción y tabs */}
        <PricingClient planes={planesFormateados} />
      </main>
    </div>
  );
}
