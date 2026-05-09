import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { X, QrCode, Coins,XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { useEffect, useState, useRef } from 'react';
import ModalExito from "@/components/ModalExito";

const ModalRechazo = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm border-t-8 border-red-500 animate-in zoom-in duration-300">
      <div className="mb-4 text-red-500 bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
        <XCircle size={48} />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Pago Fallido</h2>
      <p className="text-gray-600 mb-6">Lo sentimos, la transacción no pudo ser validada. Por favor, intenta de nuevo.</p>
      <button onClick={onClose} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg active:scale-95">
        CERRAR
      </button>
    </div>
  </div>
);

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
  cargandoCrypto, iniciarPagoCrypto, idReferencia, onTabChange, setEstadoModal
}: Props) => {

// --- ESTADOS PARA LA SIMULACIÓN ---
const [mostrarExito, setMostrarExito] = useState(false);
const [mostrarRechazo, setMostrarRechazo] = useState(false);
const [finalizado, setFinalizado] = useState(false);

// Guardamos el momento exacto en que el usuario entró a la página
const horaEntradaRef = useRef(new Date().toISOString());

useEffect(() => {
  // Si no hay ID o ya terminamos, no hacemos NADA
  if (!idUsuario || finalizado) return;

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
}, [idUsuario, finalizado]); 

  return (
    <div className="flex w-full flex-col items-center justify-center p-10 md:w-1/2 lg:p-16">
      {mostrarExito && <ModalExito onClose={() => setMostrarExito(false)} />}
      {mostrarRechazo && <ModalRechazo onClose={() => setMostrarRechazo(false)} />}
      <div className="flex flex-col items-center w-full max-w-sm">

        {/* para cambio de pestañas */}
        <Tabs 
          defaultValue="qr" 
          className="w-full flex flex-col items-center"
          onValueChange={(value) => onTabChange(value === "crypto" ? "virtual" : "qr")}
        >
          <TabsList className="grid w-full grid-cols-2 mb-8 h-12 p-1 rounded-xl gap-1">
            <TabsTrigger value="qr" 
              className="group gap-2 rounded-lg text-sm font-medium
                transition-all duration-300
                data-[state=active]:font-bold
                data-[state=active]:shadow-sm
                hover:opacity-80"
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
              className="group gap-2 rounded-lg text-sm font-medium
                transition-all duration-300
                data-[state=active]:font-bold
                data-[state=active]:shadow-sm
                hover:opacity-80"
            >
              <Image
                src="/simbolo_tron.png"
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
          <TabsContent value="qr" className="w-full flex flex-col items-center animate-in fade-in duration-300">
            <div className="mb-10 flex h-80 w-80 items-center justify-center rounded-md border border-border shadow-sm bg-white p-6">
              {generandoQr ? (
                <Skeleton className="h-[300px] w-[300px]" />
              ) : qrUrl ? (
                <img src={qrUrl} alt="QR" className="h-[300px] w-[300px] block object-contain" />
              ) : (
                <span className="text-sm uppercase text-muted-foreground">Error al cargar QR</span>
              )}
            </div>

            <div className="flex w-full flex-col gap-4">
              <Button 
                size="lg" 
                disabled={!archivoSeleccionado && !tienePagoPendiente} 
                className="w-full font-semibold text-lg py-6 shadow-md cursor-pointer hover:bg-primary/80" 
                onClick={onVerificar}
              >
                Verificar Pago
              </Button>

              <Button 
                variant="secondary" 
                size="lg" 
                className="w-full font-bold text-lg py-6 shadow-md cursor-pointer" 
                onClick={onDescargar}
              >
                DESCARGAR QR
              </Button>

              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                accept="image/*" 
                onChange={onSeleccionarArchivo} 
              />
              
              {!archivoSeleccionado ? (
                <Button 
                  variant="outline" 
                  className="w-full font-medium text-lg py-6 cursor-pointer border-dashed border-2" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  Adjuntar comprobante
                </Button>
              ) : (
                <div className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg border border-dashed border-gray-400">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <button 
                        type="button"
                        onClick={onVerFoto} 
                        className="text-sm font-medium truncate text-foreground hover:underline cursor-pointer"
                        >
                        {archivoSeleccionado.name}
                        </button>
                    </div>
                    
                    <button
                        type="button"
                        onClick={onQuitarArchivo} 
                        className="ml-4 p-2 hover:bg-red-100 rounded-full transition-all group cursor-pointer"
                        >
                        <X 
                            size={28} 
                            strokeWidth={3} 
                            className="text-red-500 group-hover:text-red-700 transition-colors" 
                        />
                    </button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Contenido Pago Virtual - Mantenemos igual */}
          <TabsContent value="crypto" className="w-full flex flex-col items-center animate-in fade-in duration-300">
            <div className="mb-6 flex min-h-[400px] w-80 flex-col items-center justify-center rounded-md border border-border shadow-sm bg-white p-6 text-center">
              {cargandoCrypto ? (
                <div className="flex flex-col items-center gap-4">
                  <Skeleton className="h-60 w-60" />
                  <p className="text-xs animate-pulse">Generando dirección única...</p>
                </div>
              ) : datosCrypto ? (
                <div className="flex flex-col items-center w-full">
                  <div className="bg-white p-2 border rounded-lg shadow-sm mb-4">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=tron:${datosCrypto.address}`} 
                      alt="QR TRX"
                      className="h-60 w-60 object-contain mx-auto transition-opacity duration-500"
                      onLoad={(e) => (e.currentTarget.style.opacity = "1")}
                      style={{ opacity: 0 }}
                    />
                  </div>
                  
                  <div className="space-y-1 w-full text-center">
                    <p className="text-[11px] font-mono text-muted-foreground break-all px-2 leading-tight">
                      {datosCrypto.address}
                    </p>
                  </div>

                  <p className="mt-4 text-lg font-bold text-emerald-600">
                    Monto: {datosCrypto.amount} TRON(TRX)
                  </p>
                </div>
              ) : (
                <p className="text-sm text-red-500">Error al generar pasarela. Reintenta.</p>
              )}
            </div>
            
            <Button 
              size="lg" 
              variant="default"
              disabled={!datosCrypto}
              className="w-full font-bold text-lg py-7 shadow-md bg-[#1D3547] hover:bg-[#1D3547]/90 uppercase" 
              onClick={() => {
                if (datosCrypto) {
                  navigator.clipboard.writeText(datosCrypto.address);
                  alert("Dirección copiada al portapapeles");
                }
              }}
            >
              COPIAR DIRECCIÓN DE PAGO
            </Button>

            <p className="mt-4 text-[11px] text-center text-muted-foreground uppercase tracking-wider">
              * Red: TRON (TRC-20). Solo envía TRX a esta dirección.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};