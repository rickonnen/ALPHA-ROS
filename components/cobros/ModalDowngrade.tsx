"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  nombrePlan: string;
}

export function ModalDowngrade({ isOpen, onClose, onConfirm }: Props) {
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);

  // Reiniciar el paso cuando se cierra el modal
  const handleClose = () => {
    setPaso(1);
    onClose();
  };

  const handleFinalConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl p-8 bg-card text-foreground shadow-2xl border border-border">
        {paso === 1 ? (
          <>
            <DialogHeader className="p-0 space-y-2">
              <DialogTitle className="text-xl md:text-2xl font-black uppercase tracking-tight text-foreground text-left">
                AVISO DE CAMBIO
              </DialogTitle>
              <DialogDescription className="text-lg leading-relaxed text-muted-foreground pt-3 text-left">
                Al realizar esta acción se le bajara de plan a uno inferior si
                tiene mas publicaciones de las limitadas por el plan las ultimas
                publicaciones creadas serán suspendidas. ¿Está seguro de que
                desea continuar?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-8 flex-col-reverse sm:flex-row gap-3 sm:gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="rounded-lg font-bold text-base px-6 h-12 w-full sm:w-auto"
              >
                CANCELAR
              </Button>
              <Button
                onClick={() => setPaso(2)}
                className="rounded-lg font-bold text-base px-6 h-12 w-full sm:w-auto"
              >
                ACEPTAR
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="p-0 space-y-2">
              <DialogTitle className="text-xl md:text-2xl font-black uppercase tracking-tight text-destructive text-left">
                CONFIRMACIÓN FINAL
              </DialogTitle>
              <DialogDescription className="text-lg leading-relaxed text-muted-foreground pt-3 text-left">
                Confirme que quiere bajar a un plan inferior. Esta acción se
                aplicará de inmediato.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-8 flex-col-reverse sm:flex-row gap-3 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => setPaso(1)}
                disabled={loading}
                className="rounded-lg font-bold text-base px-6 h-12 w-full sm:w-auto"
              >
                ACEPTAR
              </Button>
              <Button
                variant="destructive"
                onClick={handleFinalConfirm}
                disabled={loading}
                className="rounded-lg font-bold text-base px-6 h-12 w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    CARGANDO
                  </>
                ) : (
                  "CONFIRMAR"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
