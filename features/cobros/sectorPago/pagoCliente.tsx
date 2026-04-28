"use client";
import Link from "next/link";
import { PlanPublicacion } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/app/auth/AuthContext";
import { useEffect } from "react";
import { usePagoCliente } from "@/components/hooks/usePagoCliente";
import { useRouter } from "next/navigation";
import ModalPago from "@/components/cobros/ModalPago";

interface Props {
  plan: Omit<PlanPublicacion, "precio_plan"> & { precio_plan: number };
  planId: string;
  modalidad: string;
}

export default function PagoCliente({ plan, planId, modalidad }: Props) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const {
    qrUrl,
    generandoQr,
    estadoModal,
    setEstadoModal,
    manejarAceptarPago,
    manejarDescarga,
    alDarClickEnVerificarPrincipal,
    irAlPerfil,
    archivoSeleccionado,
    setArchivoSeleccionado,
    manejarSeleccionArchivo,
    fileInputRef,
    tienePagoPendiente,
    estaCargandoEstado,
  } = usePagoCliente(plan, planId, modalidad);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/cobros/planes?auth_required=true");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D3547]"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Columna Izquierda */}
      <div className="flex w-full flex-col bg-muted/30 p-10 md:w-1/2 lg:p-16">
        
        {/* Contenedor Superior (Título y Descripción) */}
        <div className="flex flex-col">
          {/* Botón Volver solo para móvil*/}
          <div className="md:hidden mb-6">
            <Link 
              href={`/cobros/planes?id=${user?.id}`} 
              className="w-fit block"
            >
              <Button variant="default" className="font-bold uppercase text-xs">
                Volver
              </Button>
            </Link>
          </div>

          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl uppercase">
            {plan.nombre_plan}
          </h1>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">
              Resumen de suscripción
            </h2>
            
            <p className="text-muted-foreground leading-relaxed">
              Estás adquiriendo una suscripción <strong className="text-primary capitalize">{modalidad}</strong>. 
              Acceso completo a todas las funciones por un periodo de{" "}
              <span className="font-semibold text-foreground">
                {modalidad === "anual" ? "12 meses" : "30 días"}
              </span>.
            </p>

            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-3">
                Detalles del plan
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center text-foreground">
                  Publicar {plan.cant_publicaciones} publicaciones
                </li>
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
                    <span className="font-semibold text-foreground"> ${Number(plan.precio_plan).toLocaleString("es-ES")}</span>.
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

        {/* ESPACIADOR FLEXIBLE: Esto empuja todo lo que sigue hacia abajo */}
        <div className="flex-grow" />

        {/* Botón Volver para PC: Pegado abajo */}
        <div className="hidden md:block mt-10">
          <Link 
            href={`/cobros/planes?id=${user?.id}`} 
            className="w-fit block"
          >
            <Button variant="default" className="font-bold uppercase flex items-center transition-all duration-300 cursor-pointer hover:bg-primary/80">
              <ArrowLeft className="h-4 w-4 mr-2" /> Volver
            </Button>
          </Link>
        </div>
      </div>

      {/* Columna Derecha */}
      <div className="flex w-full flex-col items-center justify-center p-10 md:w-1/2 lg:p-16">
        <div className="flex flex-col items-center w-full max-w-sm">
          <h2 className="text-2xl font-medium text-muted-foreground mb-2">Total a pagar</h2>
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
            {/* Botón Principal de Verificar */}
            {estaCargandoEstado ? (
              <Skeleton className="w-full h-[60px] rounded-md" />
            ) : (
              <Button
                variant="default"
                size="lg"
                disabled={!archivoSeleccionado && !tienePagoPendiente}
                className="w-full font-semibold text-lg py-6 shadow-md cursor-pointer hover:bg-primary/80"
                onClick={alDarClickEnVerificarPrincipal}
              >
                Verificar Pago
              </Button>
            )}

            {/* Botón de Descargar QR (este puede ser estático o skeleton si prefieres) */}
            <Button
              variant="secondary"
              size="lg"
              className="w-full font-bold text-lg py-6 shadow-md transition-colors cursor-pointer"
              onClick={manejarDescarga}
            >
              DESCARGAR QR
            </Button>

            {/* Input oculto */}
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              accept="image/*"
              onChange={manejarSeleccionArchivo}
            />

            {/* Lógica dinámica de Adjuntar Comprobante */}
            {estaCargandoEstado ? (
              <Skeleton className="w-full h-[60px] rounded-md" />
            ) : tienePagoPendiente ? (
              <Button
                variant="default"
                disabled
                className="w-full font-medium text-lg py-6 opacity-50 cursor-not-allowed cursor-pointer"
              >
                Adjuntar comprobante
              </Button>
            ) : (
              <>
                {!archivoSeleccionado ? (
                  <Button
                    variant="default"
                    className="w-full font-medium text-lg py-6 cursor-pointer hover:bg-primary/80"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Adjuntar comprobante
                  </Button>
                ) : (
                  <div className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg border border-dashed border-gray-400 animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-sm font-medium truncate max-w-[150px] md:max-w-[200px] text-foreground">
                        {archivoSeleccionado.name}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => {
                        setArchivoSeleccionado(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      
                      className="ml-4 p-2 hover:bg-red-100 rounded-full transition-all group cursor-pointer"
                      title="Quitar archivo"
                      type="button"
                    >
                      <X 
                        size={28} 
                        strokeWidth={3} 
                        className="text-red-500 group-hover:text-red-700 transition-colors" 
                      />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      
      
      <ModalPago
        estadoModal={estadoModal}
        setEstadoModal={setEstadoModal}
        manejarDescarga={manejarDescarga}
        manejarAceptarPago={manejarAceptarPago}
        irAlPerfil={irAlPerfil}
        nombrePlan={plan.nombre_plan ?? "seleccionado"}
        archivoSeleccionado={archivoSeleccionado}
        setArchivoSeleccionado={setArchivoSeleccionado}
      />
    </div>
  );
}