import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  titulo: string;
  descripcion: string;
  detalles: string[];
  monto: number;
  backUrl: string;
}

export const ResumenPago = ({ titulo, descripcion, detalles, monto, backUrl }: Props) => {
  return (
    <div className="flex w-full flex-col bg-muted/30 p-10 md:w-1/2 lg:p-16">
      <div className="flex flex-col">
        
        <div className="md:hidden mb-6">
          <Link href={backUrl} className="w-fit block">
            <Button variant="default" className="font-bold uppercase text-xs">
              Volver
            </Button>
          </Link>
        </div>

        {/* Título Dinámico */}
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl uppercase">
          {titulo}
        </h1>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">
            Resumen de suscripción
          </h2>
          
          {/* Descripción Dinámica */}
          <p className="text-muted-foreground leading-relaxed">
            {descripcion}
          </p>

          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-3">
              Detalles del plan
            </h3>
            <ul className="space-y-2">
              {detalles.map((item, i) => (
                <li key={i} className="flex items-center text-foreground font-medium">
                  <span className="mr-2">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-8 space-y-6">
          <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">
            PASOS
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  1
                </div>
                <div className="w-px flex-grow bg-border mt-2"></div>
              </div>
              <div className="pb-4">
                <h3 className="font-bold text-foreground">Escanea el código QR</h3>
                <p className="text-sm text-muted-foreground">
                  Abre la aplicación de tu banco y escanea el código QR que aparece a la derecha. Asegúrate de ingresar el monto exacto: 
                  <span className="font-semibold text-foreground"> ${monto.toLocaleString("es-ES")}</span>.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  2
                </div>
                <div className="w-px flex-grow bg-border mt-2"></div>
              </div>
              <div className="pb-4">
                <h3 className="font-bold text-foreground">Guarda el comprobante</h3>
                <p className="text-sm text-muted-foreground">
                  Una vez realizada la transferencia, guarda la imagen o captura de pantalla del comprobante en tu dispositivo.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  3
                </div>
              </div>
              <div className="">
                <h3 className="font-bold text-foreground">Sube y verifica</h3>
                <p className="text-sm text-muted-foreground">
                  Haz clic en <span className="italic">"Adjuntar comprobante"</span>, selecciona tu imagen y luego presiona <span className="italic">"Verificar Pago"</span>.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="flex-grow" />

      <div className="hidden md:block mt-10">
        <Link href={backUrl} className="w-fit block">
          <Button variant="default" className="font-bold uppercase flex items-center transition-all duration-300 cursor-pointer hover:bg-primary/80">
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver
          </Button>
        </Link>
      </div>
    </div>
  );
};