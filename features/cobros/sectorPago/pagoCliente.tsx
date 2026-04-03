"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlanPublicacion } from "@prisma/client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// 1. Añadimos "verificando" a la máquina de estados
type EstadoModal =
  | "cerrado"
  | "confirmacion"
  | "verificando"
  | "procesando"
  | "ya_pendiente";

// 2. Interfaz actualizada para recibir precio_plan como número
interface Props {
  plan: Omit<PlanPublicacion, "precio_plan"> & { precio_plan: number };
  idUsuario: string;
  planId: string;
}

export default function PagoCliente({ plan, idUsuario, planId }: Props) {
  const router = useRouter();

  const [qrUrl, setQrUrl] = useState<string>("");
  const [generandoQr, setGenerandoQr] = useState(true);
  const [estadoModal, setEstadoModal] = useState<EstadoModal>("cerrado");

  // Fetch solo para el QR
  useEffect(() => {
    const cargarQr = async () => {
      try {
        const resQr = await fetch(`/api/cobros/descargar?planId=${planId}`);
        const dataQr = await resQr.json();
        if (dataQr && dataQr.url) {
          setQrUrl(dataQr.url);
        }
      } catch (error) {
        console.error("Error al cargar QR:", error);
      } finally {
        setGenerandoQr(false);
      }
    };
    cargarQr();
  }, [planId]);

  // Manejo fluido de estados de pago
  const [yaPresionóAceptar, setYaPresionóAceptar] = useState(false);

  const manejarAceptarPago = async () => {
    setEstadoModal("verificando"); 
    try {
      const res = await fetch("/api/cobros/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: idUsuario, id_plan: planId }),
      });
      // para evitar hace duplicado de filas preguntar a la bd, "hay x pago?" 
      if (res.ok) {
        setYaPresionóAceptar(true); 
        setEstadoModal("procesando"); 
      } else {
        setEstadoModal("ya_pendiente");
      }
    } catch (error) {
      setEstadoModal("ya_pendiente");
    }
  };
  //funcion para ver que modal mostrar al dar click al boton verificar pago
  const alDarClickEnVerificarPrincipal = () => {
    if (yaPresionóAceptar) {
      // Si ya aceptó antes en esta visita, enviara al modal de procesando
      setEstadoModal("procesando"); 
    } else {
      // Si es la primera vez mostrara el modal para confirmar o rechazar del modal de confirmacion
      setEstadoModal("confirmacion");
    }
  };

  const manejarDescarga = async () => {
    if (!qrUrl) return;
    const respuestaImagen = await fetch(qrUrl);
    const blob = await respuestaImagen.blob();
    const urlBlob = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = urlBlob;
    link.download = `QR_Plan_${plan.nombre_plan}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const irAlPerfil = () => router.push(`/perfil?id=${idUsuario}`);

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
          <Link href={`/cobros/planes?id=${idUsuario}`}>
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

          <div className="mb-10 flex h-64 w-64 items-center justify-center overflow-hidden rounded-md border border-border shadow-sm">
            {generandoQr ? (
              <Skeleton className="h-full w-full" />
            ) : qrUrl ? (
              <img
                src={qrUrl}
                alt="Código QR de Pago"
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-sm uppercase text-muted-foreground font-medium">
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

      {/* Modales */}
      <AlertDialog
        open={estadoModal !== "cerrado"}
        onOpenChange={(isOpen) => {
          if (!isOpen) setEstadoModal("cerrado");
        }}
      >
        <AlertDialogContent>
          {/* 3. FIX DE ACCESIBILIDAD PARA RADIX UI */}
          {estadoModal === "cerrado" && (
            <AlertDialogTitle className="sr-only">
              Cerrando diálogo...
            </AlertDialogTitle>
          )}

          {estadoModal === "verificando" && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <AlertDialogTitle>Verificando</AlertDialogTitle>
            </div>
          )}

          {estadoModal === "confirmacion" && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  ¿Estás seguro de que hiciste el pago?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción notificará al sistema para validar la transacción.
                  Asegúrate de haber completado la transferencia.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setEstadoModal("cerrado")}>
                  Rechazar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    manejarAceptarPago();
                  }}
                >
                  Aceptar
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}

          {estadoModal === "procesando" && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Verificando pago</AlertDialogTitle>
                <AlertDialogDescription>
                  Este proceso puede durar algunas horas. Puedes revisar el
                  estado de tu pago en tu perfil.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setEstadoModal("cerrado")}>
                  Cerrar
                </AlertDialogCancel>
                <AlertDialogAction onClick={irAlPerfil}>
                  Ir a mi perfil
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}

          {estadoModal === "ya_pendiente" && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Pago en proceso</AlertDialogTitle>
                <AlertDialogDescription>
                  Ya tienes un pago pendiente de verificación. Por favor, espera
                  a que se complete o revisa el estado en tu perfil.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setEstadoModal("cerrado")}>
                  Cerrar
                </AlertDialogCancel>
                <AlertDialogAction onClick={irAlPerfil}>
                  Ir a mi perfil
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
