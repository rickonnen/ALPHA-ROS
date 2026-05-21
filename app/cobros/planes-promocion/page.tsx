//import { db } from "@/lib/db"; // Asegúrate de que esta ruta a tu prisma client sea la correcta
import { prisma as db } from "../../../lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// 1. Cambiamos la definición para que acepte una Promesa (Next.js 15+)
export default async function PlanesPromocionPage(props: {
  searchParams: Promise<{ pubId: string }>
}) {
  // 2. "Esperamos" a que los parámetros se resuelvan
  const searchParams = await props.searchParams;
  
  // 3. Ahora sí podemos usar .pubId sin que falle
  const idPublicacion = searchParams.pubId
  // 3. CONSULTA A LA BD: Traemos solo los planes donde tipo es "false" (Promociones)
  const planesBD = await db.planPublicacion.findMany({
    where: { 
      tipo: false,
      activo: true 
    },
    orderBy: { cant_publicaciones: 'asc' } // Los ordenamos por días (3, 7, 14, 30)
  });


  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <main className="max-w-6xl mx-auto px-6 pt-10 pb-12">
        
        {/* CABECERA: Adaptada a la estructura de app/cobros/planes/page.tsx */}
        <div className="relative mb-12 flex flex-col md:flex-row md:items-center justify-center min-h-11 gap-6 md:gap-0">
          <div className="self-start md:self-auto md:absolute md:left-0">
            <Button variant="default" asChild className="rounded-lg px-4 py-2">
              <Link href="/perfil" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4 stroke-[3]" />
                <span className="font-semibold text-sm">VOLVER</span>
              </Link>
            </Button>
          </div>

          <div className="text-center w-full max-w-2xl md:px-20 mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground uppercase tracking-tight">
              Planes de Promoción
            </h1>
          </div>
        </div>

        {/* DESCRIPCIÓN */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Haz que tu inmueble llegue a más personas. Elige uno de nuestros planes de visibilidad para posicionar tu anuncio entre los resultados de búsqueda.
          </p>
        </div>

        {/* Grilla Dinámica - Criterio 11 (Responsivo) adaptado al PricingClient global */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
          {planesBD.map((plan) => (
            <Card 
              key={plan.id_plan} 
              className="flex flex-col text-center border shadow-sm rounded-2xl pt-6 overflow-hidden hover:border-primary transition-all bg-card h-full"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-black uppercase text-foreground">
                  {plan.nombre_plan}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col items-center justify-start px-6 pb-6 flex-grow">
                <div className="flex flex-col items-center mb-6 mt-4">
                  <span className="text-5xl font-black text-foreground mb-2">
                    ${Number(plan.precio_plan)}
                  </span>
                  <span className="text-primary font-bold uppercase text-xs tracking-widest mt-2">
                    {plan.cant_publicaciones} DÍAS DE DURACIÓN
                  </span>
                </div>
                
                {/* BENEFICIOS - Solo "Prioridad en filtros" */}
                <ul className="mt-4 text-base text-left space-y-3 border-t border-border w-full pt-6 text-muted-foreground flex-grow">
                  <li className="flex items-center justify-center font-medium">
                    <span className="mr-2 font-bold text-primary text-xl">•</span> 
                    Prioridad en filtros
                  </li>
                </ul>
              </CardContent>

              <div className="border-t border-border p-6 bg-card mt-auto">
                <Button asChild className="w-full text-lg font-bold py-6">
                  <Link href={`/cobros/sector-pagos?planId=${plan.id_plan}&idPublicacion=${idPublicacion}`}>
                    CONTINUAR
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}