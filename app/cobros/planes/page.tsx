import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlanPublicacion } from "@prisma/client";
import { BotonContinuarPlan } from "./BotonContinuarPlan";
import { prisma } from "@/lib/prisma"; // Importa tu instancia de prisma aquí

interface Props {
  searchParams: Promise<{
    id?: string;
  }>;
}

export default async function PlanesPublicacion({ searchParams }: Props) {
  // 1. Obtenemos el ID del usuario de los searchParams
  const params = await searchParams;
  const idUsuario = params.id ?? "";

  // 2. Consulta DIRECTA a la base de datos (Sin fetch, sin baseUrl)
  const planes = await prisma.planPublicacion.findMany({
    where: {
      activo: true,
    },
    orderBy: {
      precio_plan: "asc",
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold mb-6 text-foreground uppercase">
            COMPRA MÁS CUPOS DE PUBLICACIÓN
          </h1>
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
                <BotonContinuarPlan
                  planId={plan.id_plan}
                  idUsuario={idUsuario}
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
