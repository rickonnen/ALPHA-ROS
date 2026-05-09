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
import { TriangleAlert } from "lucide-react";
import { BadgeCheck } from "lucide-react";

type EstadoModal =
  | "cerrado"
  | "confirmacion_pago" 
  | "verificando_pago" 
  | "pendiente_pago"
  | "pago_completado" 
  | "pago_rechazado";   

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
const [loading, setLoading] = useState(false);

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
                <AlertDialogCancel 
                  disabled={loading}
                  onClick={() => setEstadoModal("cerrado")}>
                  Rechazar
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={loading}
                  onClick={async (e) => {
                    e.preventDefault();
                    setLoading(true);

                    await manejarAceptarPago(); // importante que sea async

                    setEstadoModal("verificando_pago");
                    setLoading(false);
                  }}
                >
                  {loading ? "Procesando..." : "Aceptar"}
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

          {estadoModal === "pago_completado" && (
            <>
              <AlertDialogHeader>
                <BadgeCheck className="h-14 w-14 text-green-500 mb-2" />
                <AlertDialogTitle>Pago confirmado</AlertDialogTitle>
                <AlertDialogDescription>
                  Hemos recibido tu pago correctamente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setEstadoModal("cerrado")}>
                  Cerrar
                </AlertDialogCancel>
              </AlertDialogFooter>
            </>
          )}

          {estadoModal === "pago_rechazado" && (
            <>
              <AlertDialogHeader>
                <TriangleAlert className="h-14 w-14 text-red-500 mb-2" />
                <AlertDialogTitle>Pago no completado</AlertDialogTitle>
                <AlertDialogDescription>
                  No hemos podido confirmar tu pago.                    
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setEstadoModal("cerrado")}>
                  Cerrar
                </AlertDialogCancel>
              </AlertDialogFooter>
            </>
          )}

        </AlertDialogContent>
      </AlertDialog>
  );
}