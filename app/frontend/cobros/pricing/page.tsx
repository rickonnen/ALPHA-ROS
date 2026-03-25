import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlanesPublicacion() {
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

        {/* GRID DE TARJETAS DE PLANES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Plan Estándar */}
          <Card className="flex flex-col text-center border-2 shadow-sm rounded-xl py-6">
            <CardHeader>
              <CardTitle className="text-2xl font-black">PLAN ESTÁNDAR</CardTitle>
            </CardHeader>
            <CardContent className="grow">
              <p className="text-2xl font-bold mb-8 text-foreground">$ 0.99</p>
              <p className="text-muted-foreground">+ 2 cupos de publicación</p>
            </CardContent>
            <CardFooter className="pt-8">
              <Button className="w-full font-bold">
                Continuar
              </Button>
            </CardFooter>
          </Card>

          {/* Plan Avanzado */}
          <Card className="flex flex-col text-center border-2 shadow-sm rounded-xl py-6">
            <CardHeader>
              <CardTitle className="text-2xl font-black">PLAN AVANZADO</CardTitle>
            </CardHeader>
            <CardContent className="grow">
              <p className="text-2xl font-bold mb-8 text-foreground">$ 4.99</p>
              <p className="text-muted-foreground">+ 12 cupos de publicación</p>
            </CardContent>
            <CardFooter className="pt-8">
              <Button className="w-full font-bold">
                Continuar
              </Button>
            </CardFooter>
          </Card>

          {/* Plan Profesional */}
          <Card className="flex flex-col text-center border-2 shadow-sm rounded-xl py-6">
            <CardHeader>
              <CardTitle className="text-2xl font-black">PLAN PROFESIONAL</CardTitle>
            </CardHeader>
            <CardContent className="grow">
              <p className="text-2xl font-bold mb-8 text-foreground">$ 19.99</p>
              <p className="text-muted-foreground">+ 50 cupos de publicación</p>
            </CardContent>
            <CardFooter className="pt-8">
              <Button className="w-full font-bold">
                Continuar
              </Button>
            </CardFooter>
          </Card>

        </div>
      </main>
    </div>
  );
}