import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlanPublicacion } from "@prisma/client";
import { BotonContinuarPlan } from "@/components/cobros/BotonContinuarPlan";
import { getPlanesPublicacion } from "@/features/cobros/planes/getPlanesPublicacion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function PlanesPublicacion() {
  const planes = await getPlanesPublicacion();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <main className="max-w-6xl mx-auto px-6 pt-10 pb-12">
        <div className="relative mb-12 flex flex-col md:flex-row md:items-center justify-center min-h-11 gap-6 md:gap-0">
          {" "}
          <div className="self-start md:self-auto md:absolute md:left-0">
            <Button variant="default" asChild className="rounded-lg px-4 py-2">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="font-semibold text-sm">Volver al inicio</span>
              </Link>
            </Button>
          </div>
          <div className="text-center w-full max-w-2xl md:px-20 mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground uppercase tracking-tight">
              COMPRA MÁS CUPOS DE PUBLICACIÓN
            </h1>
          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Selecciona uno de nuestros planes para obtener más cupos de
            publicación. Cada plan incluye una cantidad de publicaciones que te
            permitirán anunciar más inmuebles dentro de la plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {planes.map((plan: PlanPublicacion) => (
            <Card
              key={plan.id_plan}
              className="flex flex-col text-center border-2 shadow-sm rounded-xl py-6 hover:border-primary transition-all"
            >
              <CardHeader>
                <CardTitle className="text-2xl font-black">
                  {plan.nombre_plan}
                </CardTitle>
              </CardHeader>
              <CardContent className="grow">
                <p className="text-3xl font-bold mb-8 text-foreground">
                  $ {Number(plan.precio_plan).toLocaleString("es-ES")}
                </p>
                <p className="text-muted-foreground">
                  + {plan.cant_publicaciones} cupos de publicación
                </p>
              </CardContent>
              <CardFooter className="pt-8 bg-transparent">
                <BotonContinuarPlan planId={plan.id_plan} />
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
