import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlanPublicacion } from "@prisma/client";
import Link from "next/link";
import { BotonContinuarPlan } from "./BotonContinuarPlan";

async function obtenerPlanes() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/backend/cobros/planes`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Fallo al obtener los planes de publicación");
  }

  return res.json();
}

interface Props {
  searchParams: Promise<{
    id?: string;
  }>;
}

export default async function PlanesPublicacion({ searchParams }: Props) {
  //De aqui sacamos el usuario
  const params = await searchParams;
  const idUsuario = params.id ?? "";

  const planes = await obtenerPlanes();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <main className="max-w-6xl mx-auto px-6 py-12">
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
                  $ {plan.precio_plan?.toString()}
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
