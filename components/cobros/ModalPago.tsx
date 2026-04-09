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

type EstadoModal =
  | "cerrado"
  | "confirmacion"
  | "verificando"
  | "procesando"
  | "ya_pendiente";

interface Props {
  estadoModal: EstadoModal;
  setEstadoModal: (estado: EstadoModal) => void;
  manejarAceptarPago: () => void;
  irAlPerfil: () => void;
}

export default function PagoModal({
  estadoModal,
  setEstadoModal,
  manejarAceptarPago,
  irAlPerfil,
}: Props) {
  return (
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
  );
}