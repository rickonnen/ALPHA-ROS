"use client";

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
import { useState, useRef } from "react";


type EstadoModal =
  | "cerrado"
  | "descargarQR" 
  | "confirmacion_pago" 
  | "verificando_pago" 
  | "adjuntar_comprobante" 
  | "pendiente_pago"; 

interface Props {
  estadoModal: EstadoModal;
  setEstadoModal: (estado: EstadoModal) => void;
  manejarAceptarPago: () => void;
  irAlPerfil: () => void;
  manejarDescarga: () => void;
  nombrePlan: string;
  archivoSeleccionado: File | null;
  setArchivoSeleccionado: (file: File | null) => void;
}

export default function PagoModal({
  estadoModal,
  setEstadoModal,
  manejarAceptarPago,
  irAlPerfil,
  manejarDescarga,
  nombrePlan,
  archivoSeleccionado,
  setArchivoSeleccionado,
}: Props) {

const fileInputRef = useRef<HTMLInputElement>(null);
const manejarSeleccionArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    setArchivoSeleccionado(e.target.files[0]);
  }
};


  return (
      <AlertDialog
        open={estadoModal !== "cerrado"}
        onOpenChange={(isOpen) => {
          if (!isOpen) setEstadoModal("cerrado");
        }}
      >
        <AlertDialogContent>
          {estadoModal === "cerrado" && (
            <AlertDialogTitle className="sr-only">
              Cerrando diálogo...
            </AlertDialogTitle>
          )}

          {estadoModal === "verificando_pago" && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Verificando pago
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Este proceso puede durar algunas horas. 
                  Puedes revisar el estado de tu pago en tu perfil.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setEstadoModal("cerrado")}>
                  cerrar
                </AlertDialogCancel>
                <AlertDialogAction onClick={irAlPerfil}> 
                  ir a mi perfil
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}

          {estadoModal === "confirmacion_pago" && (
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

          {estadoModal === "adjuntar_comprobante" && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Adjuntar comprobante</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción enviará tu comprobante al equipo de 
                  administración para su validación inmediata.
                </AlertDialogDescription>

                {/* aqui se mostrara el archivo seleccionado */}
                {archivoSeleccionado && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-dashed border-primary/30 flex items-center justify-center">
                    <p className="text-sm font-medium text-primary animate-in fade-in zoom-in duration-300">
                      {archivoSeleccionado.name}
                    </p>
                  </div>
                )}
              </AlertDialogHeader>
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                accept=".pdf"
                onChange={manejarSeleccionArchivo}
              />
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setEstadoModal("cerrado")}>
                  cancelar
                </AlertDialogCancel>
      
                <AlertDialogAction 
                  onClick={(e) => {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }}
                >
                  seleccionar archivo
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}

          {estadoModal === "pendiente_pago" && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Ya tienes una solicitud pendiente</AlertDialogTitle>
                <AlertDialogDescription>
                  Estamos verificando un comprobante para este plan. 
                  No es necesario realizar otro pago. Te 
                  notificaremos en cuanto el administrador valide 
                  la transacción.
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

          {estadoModal === "descargarQR" && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Descargar QR
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Deseas descargar el QR correspondiente al plan 
                  {nombrePlan}?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setEstadoModal("cerrado")}>
                  cancelar
                </AlertDialogCancel>
                <AlertDialogAction onClick={manejarDescarga}> 
                  aceptar
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
  );
}