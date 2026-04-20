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

export function ModalDowngrade({
  isOpen,
  onClose,
  onConfirm,
  nombrePlan,
}: Props) {
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
      <DialogContent className="sm:max-w-[425px]">
        {paso === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold uppercase">
                Aviso de Cambio
              </DialogTitle>
              <DialogDescription className="py-4 text-base">
                Al realizar esta acción se le bajará a un plan inferior (
                <strong>{nombrePlan}</strong>). ¿Desea continuar?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={() => setPaso(2)}>Aceptar</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold uppercase text-destructive">
                Confirmación Final
              </DialogTitle>
              <DialogDescription className="py-4 text-base">
                Confirme que quiere bajar a un plan inferior. Esta acción se
                aplicará de inmediato.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setPaso(1)}
                disabled={loading}
              >
                Aceptar
              </Button>
              <Button
                variant="destructive"
                onClick={handleFinalConfirm}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Confirmar"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
