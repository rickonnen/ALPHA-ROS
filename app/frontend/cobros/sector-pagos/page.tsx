"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

// 1. Skeleton adaptado a variables globales
function PaginaCobrosSkeleton() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Columna Izquierda - Skeleton */}
      <div className="flex w-full flex-col justify-between bg-muted/30 p-10 md:w-1/2 lg:p-16">
        <div>
          <Skeleton className="mb-8 h-12 w-3/4" />
          <Skeleton className="mb-4 h-6 w-1/3" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
        <div className="mt-12">
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* Columna Derecha - Skeleton */}
      <div className="flex w-full flex-col items-center justify-center bg-background p-10 md:w-1/2 lg:p-16">
        <div className="flex w-full max-w-sm flex-col items-center">
          <Skeleton className="mb-2 h-6 w-1/2" />
          <Skeleton className="mb-10 h-10 w-1/3" />
          <Skeleton className="mb-10 h-64 w-64 rounded-md" />
          <div className="flex w-full flex-col gap-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaginaSectorPagos() {
  return (
    <Suspense fallback={<PaginaCobrosSkeleton />}>
      <ContenidoPaginaCobros />
    </Suspense>
  );
}

type EstadoModal = "cerrado" | "confirmacion" | "procesando" | "ya_pendiente";

function ContenidoPaginaCobros() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("planId") || "1";
  const idUsuario = searchParams.get("id") ?? "";

  const [nombrePlan, setNombrePlan] = useState("PLAN X");
  const [descripcionPlan, setDescripcionPlan] = useState("");
  const [totalAPagar, setTotalAPagar] = useState<number>(0);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [estaCargando, setEstaCargando] = useState(true);
  const [estadoModal, setEstadoModal] = useState<EstadoModal>("cerrado");

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      setEstaCargando(true);
      try {
        const [resPlan, resQr] = await Promise.all([
          fetch(`/backend/cobros/getplan?planId=${planId}`),
          fetch(`/backend/cobros/descargar?planId=${planId}`),
        ]);

        const dataPlan = await resPlan.json();
        const dataQr = await resQr.json();

        if (dataPlan && !dataPlan.error) {
          setNombrePlan(dataPlan.nombre);
          setTotalAPagar(dataPlan.total);
          setDescripcionPlan(dataPlan.descripcion);
        }

        if (dataQr && dataQr.url) {
          setQrUrl(dataQr.url);
        }
      } catch (error) {
        console.error("Error en la carga inicial:", error);
      } finally {
        setEstaCargando(false);
      }
    };

    cargarDatosIniciales();
  }, [planId]);

  const manejarAceptarPago = async () => {
    setEstadoModal("cerrado");

    try {
      const res = await fetch("/backend/cobros/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: idUsuario,
          id_plan: planId,
        }),
      });

      const data = await res.json();

      if (res.status === 409 || data.yaPendiente) {
        setEstadoModal("ya_pendiente");
      } else {
        setEstadoModal("procesando");
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      setEstadoModal("ya_pendiente");
    }
  };

  const manejarDescarga = async () => {
    if (!qrUrl) return;
    const respuestaImagen = await fetch(qrUrl);
    const blob = await respuestaImagen.blob();
    const urlBlob = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = urlBlob;
    link.download = `QR_Plan_${nombrePlan}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const irAlPerfil = () => {
    router.push(`/frontend/perfil?id=${idUsuario}`);
  };

  if (estaCargando) {
    return <PaginaCobrosSkeleton />;
  }

  // --- RENDERIZADO PRINCIPAL (Sin colores harcodeados) ---
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      {/* Columna Izquierda */}
      <div className="flex w-full flex-col justify-between bg-muted/30 p-10 md:w-1/2 lg:p-16">
        <div>
          <h1 className="mb-8 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl uppercase">
            {nombrePlan}
          </h1>
          <h2 className="mb-4 text-xl font-bold text-foreground">
            Descripción
          </h2>
          <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
            {descripcionPlan || "Cargando detalles..."}
          </div>
        </div>

        <div className="mt-12">
          <Link href={`/frontend/cobros/planes?id=${idUsuario}`}>
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
            $ {totalAPagar.toFixed(2)}
          </div>

          <div className="mb-10 flex h-64 w-64 items-center justify-center overflow-hidden rounded-md border border-border shadow-sm">
            {qrUrl ? (
              <img
                src={qrUrl}
                alt="Código QR de Pago"
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-sm uppercase text-muted-foreground font-medium">
                Generando QR...
              </span>
            )}
          </div>

          <div className="flex w-full flex-col gap-4">
            <Button
              variant="default"
              size="lg"
              className="w-full font-semibold text-lg py-6 shadow-md"
              onClick={() => setEstadoModal("confirmacion")}
            >
              Verificar Pago
            </Button>

            <Button
              variant="secondary"
              size="lg"
              className="w-full font-bold text-lg py-6 shadow-md transition-colors"
              onClick={manejarDescarga}
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
                <AlertDialogAction onClick={manejarAceptarPago}>
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
