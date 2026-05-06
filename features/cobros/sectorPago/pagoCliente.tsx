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
}

interface Props {
  datos: DatosPago;
  backUrl: string;
}

export default function PagoCliente({ datos, backUrl }: Props) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [verFoto, setVerFoto] = useState(false);

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
  } = usePagoCliente(datos.idReferencia, datos.modalidad);

  if (isLoading || !user) return <div className="flex min-h-screen items-center justify-center">Cargando...</div>;








  
  const manejarSeleccionYAbrir = (e: React.ChangeEvent<HTMLInputElement>) => {
    manejarSeleccionArchivo(e);
    setVerFoto(true); 
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <ResumenPago 
        titulo={datos.titulo} descripcion={datos.descripcion} 
        detalles={datos.detalleItems} monto={datos.precio} backUrl={backUrl} 
      />

      <AccionesPago 
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