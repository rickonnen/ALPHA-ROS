import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// Asegúrate de que esta ruta coincida exactamente con la ubicación de tu archivo
import { getPlanes } from '@/app/backend/controllers/cobros/planController'; 
export default async function PlanesPublicacion() {
  // Llamamos a tu base de datos directamente desde el servidor
  const planes = await getPlanes();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      
      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Botón Volver */}
        <div className="mb-8">
          <Button variant="default" className="px-8 rounded-md font-bold">
            Volver
          </Button>
        </div>

        {/* Título y Descripción */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold mb-6 text-foreground">
            COMPRA MÁS CUPOS DE PUBLICACIÓN
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Selecciona uno de nuestros planes para obtener más cupos de publicación. Cada plan incluye
            una cantidad de publicaciones que te permitirán anunciar más inmuebles dentro de la
            plataforma.
          </p>
        </div>

        {/* GRID DE TARJETAS DE PLANES (Dinámico) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {planes.map((plan) => (
            <Card key={plan.id_plan} className="flex flex-col text-center border-2 shadow-sm rounded-xl py-6">
              <CardHeader>
                <CardTitle className="text-2xl font-black">{plan.nombre_plan}</CardTitle>
              </CardHeader>
              <CardContent className="grow">
                <p className="text-2xl font-bold mb-8 text-foreground">$ {plan.precio_plan?.toString()}</p>
                <p className="text-muted-foreground">+ {plan.cant_publicaciones} cupos de publicación</p>
              </CardContent>
              <CardFooter className="pt-8 bg-transparent">
                <Button className="w-full font-bold">
                  Continuar
                </Button>
              </CardFooter>
            </Card>
          ))}

        </div>
      </main>
    </div>
  );
}