import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlanPublicacion } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function PlanesPublicacion() {
  // Consulta directa a la BD sin fetch para evitar problemas en Server Components
  const planes = await prisma.planPublicacion.findMany({
    orderBy: { precio_plan: "asc" },
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Título y Descripción */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold mb-6 text-foreground">
            COMPRA MÁS CUPOS DE PUBLICACIÓN
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Selecciona uno de nuestros planes para obtener más cupos de
            publicación. Cada plan incluye una cantidad de publicaciones que te
            permitirán anunciar más inmuebles dentro de la plataforma.
          </p>
        </div>

        {/* GRID DE TARJETAS DE PLANES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {planes.map((plan: PlanPublicacion) => (
            <Card
              key={plan.id_plan}
              className="flex flex-col text-center border-2 shadow-sm rounded-xl py-6"
            >
              <CardHeader>
                <CardTitle className="text-2xl font-black">
                  {plan.nombre_plan}
                </CardTitle>
              </CardHeader>
              <CardContent className="grow">
                <p className="text-2xl font-bold mb-8 text-foreground">
                  $ {Number(plan.precio_plan).toLocaleString("es-ES")}
                </p>
                <p className="text-muted-foreground">
                  + {plan.cant_publicaciones} cupos de publicación
                </p>
              </CardContent>
              <CardFooter className="pt-8 bg-transparent">
                <Button asChild className="w-full font-bold">
                  <Link href={`/frontend/cobros/sector-pagos?planId=${plan.id_plan}`}>
                    Continuar
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}