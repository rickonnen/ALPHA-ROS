import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { useEffect, useState, useRef } from 'react';
import { PagoVirtual }from "./pagoVirtual";
import { PagoLocal }from "./pagoLocal";

interface Props {
  idUsuario: string;
  precio: number;
  generandoQr: boolean;
  qrUrl: string | null;
  archivoSeleccionado: File | null;
  tienePagoPendiente: boolean;
  estaCargandoEstado: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onVerificar: () => void;
  onDescargar: () => void;
  onSeleccionarArchivo: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onQuitarArchivo: () => void;
  onVerFoto: () => void;
  datosCrypto: { address: string; amount: number; paymentId: string } | null;
  cargandoCrypto: boolean;
  iniciarPagoCrypto: (precio: number, planId: string) => void;
  idReferencia: string;
  onTabChange: (value: "qr" | "virtual") => void; 
  tipoPagoSeleccionado: "qr" | "virtual";
  setEstadoModal: (estado: EstadoModal) => void;
}

type EstadoModal =
  | "cerrado"
  | "confirmacion_pago"
  | "verificando_pago"
  | "pendiente_pago"
  | "pago_completado"
  | "pago_rechazado";

export const AccionesPago = ({
  idUsuario, precio, generandoQr, qrUrl, archivoSeleccionado, tienePagoPendiente,
  estaCargandoEstado, fileInputRef, onVerificar, onDescargar,
  onSeleccionarArchivo, onQuitarArchivo, onVerFoto, datosCrypto, 
  cargandoCrypto, iniciarPagoCrypto, idReferencia, tipoPagoSeleccionado, onTabChange, setEstadoModal
}: Props) => {

// --- ESTADOS PARA LA SIMULACIÓN ---
const [finalizado, setFinalizado] = useState(false);

// Guardamos el momento exacto en que el usuario entró a la página
const horaEntradaRef = useRef(new Date().toISOString());

useEffect(() => {
  // Si no hay ID o ya terminamos, no hacemos NADA
  if (!idUsuario || finalizado || tipoPagoSeleccionado !== "virtual") {
    return;
  }

  console.log("🚀 Iniciando monitoreo de pago desde:", horaEntradaRef.current);

  const intervalo = setInterval(async () => {
    try {
      // Enviamos el userId y la hora de entrada
      const res = await fetch(`/api/cobros/poolingCripto?userId=${idUsuario}&desde=${horaEntradaRef.current}`);
      const data = await res.json();
      
      console.log("⏱️ Revisando... Estado:", data.estado);

      if (data.estado === 2 || data.estado === 3) {
        console.log("🎯 ¡Cambio detectado! Deteniendo reloj.");
        
        clearInterval(intervalo);
        setFinalizado(true); 

        if (data.estado === 2) {
          setEstadoModal("pago_completado");
        }

        if (data.estado === 3) {
          setEstadoModal("pago_rechazado");
        }
      }
    } catch (error) {
      console.error("Error en polling:", error);
    }
  }, 3000);

  return () => {
    console.log("🧹 Limpiando intervalo");
    clearInterval(intervalo);
  };
}, [idUsuario, finalizado, tipoPagoSeleccionado]); 

  return (
    <div className="flex w-full flex-col items-center justify-center p-10 md:w-1/2 lg:p-16">
      <div className="flex flex-col items-center w-full max-w-sm">

        {/* para cambio de pestañas */}
        <Tabs 
          defaultValue="qr" 
          className="w-full flex flex-col items-center"
          onValueChange={(value) => onTabChange(value === "crypto" ? "virtual" : "qr")}
        >
          <TabsList className="grid w-full grid-cols-2 mb-8 h-12 p-1 rounded-xl gap-1">
            <TabsTrigger value="qr" 
              className="group flex items-center justify-center gap-2 rounded-lg text-sm font-medium
                transition-all duration-300
                data-[state=active]:font-bold
                data-[state=active]:shadow-sm
                hover:opacity-80 -translate-y-0.5"
            >
              <Image
                src="/banderaBolivia.svg"
                alt="Bandera Bolivia"
                width={24}
                height={16}
                className="rounded-sm object-cover transition-transform duration-300 group-hover:scale-110"
              />
              Pago Local (USD)
            </TabsTrigger>

            <TabsTrigger value="crypto" 
              className="group flex items-center justify-center gap-2 rounded-lg text-sm font-medium
                transition-all duration-300
                data-[state=active]:font-bold
                data-[state=active]:shadow-sm
                hover:opacity-80 -translate-y-0.5"
            >
              <Image
                src="/logo-tron.png"
                alt="Simbolo tron"
                width={20}
                height={20}
                className="object-contain transition-transform duration-300 group-hover:scale-110"
              />
              TRON (TRX)
            </TabsTrigger>
          </TabsList>

          {/* titulo y precio a pagar */}
          <h2 className="text-2xl font-medium text-muted-foreground mb-2">Total a pagar</h2>
          <div className="text-3xl mb-10 text-foreground font-semibold">
            $ {Number(precio).toLocaleString("es-ES")}
          </div>


          {/* Contenido Pago QR - Mantenemos igual */}
          <TabsContent value="qr" className="w-full">
            <PagoLocal
              generandoQr={generandoQr}
              qrUrl={qrUrl}
              archivoSeleccionado={archivoSeleccionado}
              tienePagoPendiente={tienePagoPendiente}
              estaCargandoEstado={estaCargandoEstado}
              fileInputRef={fileInputRef}
              onVerificar={onVerificar}
              onDescargar={onDescargar}
              onSeleccionarArchivo={onSeleccionarArchivo}
              onQuitarArchivo={onQuitarArchivo}
              onVerFoto={onVerFoto}
            />
          </TabsContent>

          {/* Contenido Pago Virtual - Mantenemos igual */}
          <TabsContent value="crypto" className="w-full">
            <PagoVirtual
              datosCrypto={datosCrypto}
              cargandoCrypto={cargandoCrypto}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};