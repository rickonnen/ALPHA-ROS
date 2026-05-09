"use client";
import { useAuth } from "@/app/auth/AuthContext";
import { usePagoCliente } from "@/components/hooks/usePagoCliente";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ModalPago from "@/components/cobros/ModalPago";
import { ResumenPago } from "./ResumenPago";
import { AccionesPago } from "./AccionesPago";
import { PrevisualizacionFoto } from "./PrevisualizacionFoto";

interface DatosPago {
  titulo: string;
  descripcion: string;
  detalleItems: string[];
  precio: number;
  idReferencia: string;
  modalidad: string;
  tipoPlan: number;
  idPublicacion: string | null;
}

interface Props {
  datos: DatosPago;
  backUrl: string;
  resumenPublicacionNode?: React.ReactNode; 
}

export default function PagoCliente({ datos, backUrl, resumenPublicacionNode }: Props) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [verFoto, setVerFoto] = useState(false);
  const [tipoPagoSeleccionado, setTipoPagoSeleccionado] = useState<"qr" | "virtual">("qr");

  //para planes
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
    previewUrl, 
    setPreviewUrl,
    manejarSeleccionArchivo, 
    fileInputRef, 
    tienePagoPendiente, 
    estaCargandoEstado, 
    datosCrypto,      
    cargandoCrypto,   
    iniciarPagoCrypto
  } = usePagoCliente(datos.idReferencia, datos.modalidad, datos.idPublicacion);

  useEffect(() => {
    // Solo se dispara una vez cuando el usuario carga la página y está logueado
    if (user?.id && !datosCrypto && !cargandoCrypto) {
      iniciarPagoCrypto(datos.precio, datos.idReferencia);
    }
  }, [user?.id, datos.idReferencia]);


  if (isLoading || !user) return <div className="flex min-h-screen items-center justify-center">Cargando...</div>;

  const manejarSeleccionYAbrir = (e: React.ChangeEvent<HTMLInputElement>) => {
    manejarSeleccionArchivo(e);
    setVerFoto(true); 
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex w-full flex-col bg-muted/30 md:w-1/2 border-r border-border/50">
        <div className="p-10 lg:p-16 flex flex-col h-full w-full">
           
           {/* Eliminamos el card de aquí arriba y se lo pasamos como prop al ResumenPago */}
           <ResumenPago 
             titulo={datos.titulo} descripcion={datos.descripcion} 
             detalles={datos.detalleItems} monto={datos.precio} backUrl={backUrl} 
             tipoPago={tipoPagoSeleccionado}
             tipoPlan={datos.tipoPlan}
             resumenPublicacionNode={resumenPublicacionNode} 
           />

        </div>
      </div>

      <AccionesPago 
        idUsuario={user.id}
        precio={datos.precio} 
        generandoQr={generandoQr} 
        qrUrl={qrUrl}
        archivoSeleccionado={archivoSeleccionado} 
        tienePagoPendiente={tienePagoPendiente}
        estaCargandoEstado={estaCargandoEstado} 
        fileInputRef={fileInputRef}
        onVerificar={alDarClickEnVerificarPrincipal} 
        onDescargar={manejarDescarga}
        onSeleccionarArchivo={manejarSeleccionYAbrir} 
        onQuitarArchivo={() => {
          setArchivoSeleccionado(null);
          setPreviewUrl(null); 
          setVerFoto(false);  
          if (fileInputRef.current) {
            fileInputRef.current.value = ""; 
          }
        }}
        onVerFoto={() => setVerFoto(true)}
        datosCrypto={datosCrypto}
        cargandoCrypto={cargandoCrypto}
        iniciarPagoCrypto={iniciarPagoCrypto}
        idReferencia={datos.idReferencia}
        onTabChange={setTipoPagoSeleccionado}
        setEstadoModal={setEstadoModal}
      />

      {verFoto && previewUrl && (
        <PrevisualizacionFoto 
          url={previewUrl} 
          onClose={() => setVerFoto(false)}
        />
      )}

      <ModalPago 
        estadoModal={estadoModal} setEstadoModal={setEstadoModal} 
        manejarDescarga={manejarDescarga} manejarAceptarPago={manejarAceptarPago}
        irAlPerfil={irAlPerfil} nombrePlan={datos.titulo} 
        archivoSeleccionado={archivoSeleccionado} setArchivoSeleccionado={setArchivoSeleccionado}
      />
    </div>
  );
}