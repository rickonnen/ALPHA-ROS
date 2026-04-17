"use client";
import Link from "next/link";
import { PlanPublicacion } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/app/auth/AuthContext";
import { useEffect } from "react";
import { usePagoCliente } from "@/components/hooks/usePagoCliente";
import { useRouter } from "next/navigation";
import ModalPago from "@/components/cobros/ModalPago";

interface Props {
  plan: Omit<PlanPublicacion, "precio_plan"> & { precio_plan: number };
  planId: string;
}


export default function PagoCliente({ plan, planId }: Props) {
  
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const {
    qrUrl,
    generandoQr,
    estadoModal,
    setEstadoModal,
    manejarAceptarPago,
    alDarClickEnVerificarPrincipal,
    irAlPerfil,
  } = usePagoCliente(plan, planId);

  // por si no es un usuario logueado mostrar ese return
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/cobros/planes?auth_required=true");
    }
  }, [user, isLoading, router]);

 

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      {/* Columna Izquierda */}
      <div className="flex w-full flex-col justify-between bg-muted/30 p-10 md:w-1/2 lg:p-16">
        <div>
          <h1 className="mb-8 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl uppercase">
            {plan.nombre_plan}
          </h1>
          <h2 className="mb-4 text-xl font-bold text-foreground">
            Descripción
          </h2>
          <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
            Adquiere {plan.cant_publicaciones} cupos por un precio especial.
          </div>
        </div>

        <div className="mt-12">
          <Link href={`/cobros/planes?id=${user?.id}`}>
            <Button variant="default">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver
            </Button>
          </Link>
        </div>
      </div>


      {/* Columna Derecha */}
      <div className="flex w-full flex-col items-center justify-center p-10 md:w-1/2 lg:p-16">
        <div className="flex flex-col items-center w-full max-w-sm">
          <h2 className="text-2xl font-medium text-muted-foreground mb-2">
            Total a pagar
          </h2>
          <div className="text-3xl mb-10 text-foreground font-semibold">
            $ {Number(plan.precio_plan).toLocaleString("es-ES")}
          </div>

          <div className="mb-10 flex h-80 w-80 items-center justify-center rounded-md border border-border shadow-sm bg-white p-6">
            {generandoQr ? (
              <Skeleton className="h-[300px] w-[300px]" />
            ) : qrUrl ? (
              <img
                src={qrUrl}
                alt="Código QR de Pago"
                width={300}
                height={300}
                className="h-[300px] w-[300px] block object-contain" 
              />
            ) : (
              <span className="text-sm uppercase text-muted-foreground font-medium text-center">
                Error al cargar QR
              </span>
            )}
          </div>

          <div className="flex w-full flex-col gap-4">
            <Button
              variant="default"
              size="lg"
              className="w-full font-semibold text-lg py-6 shadow-md"
              onClick={alDarClickEnVerificarPrincipal}
            >
              Verificar Pago
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full font-bold text-lg py-6 shadow-md transition-colors"
              //onClick={manejarDescarga}
            >
              DESCARGAR QR
            </Button>
          </div>
        </div>
      </div>
      <ModalPago
        estadoModal={estadoModal}
        setEstadoModal={setEstadoModal}
        manejarAceptarPago={manejarAceptarPago}
        irAlPerfil={irAlPerfil}
      />                                  
    </div>
  );
}
