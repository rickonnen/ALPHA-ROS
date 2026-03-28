
/**
 * Component: TelefonosView
 * Author: Miguel Angel Condori
 * Date: 2026-03-27
 * Description: Gestiona los números de teléfono del usuario dentro de la
 * sección de seguridad. Permite visualizar hasta tres teléfonos registrados,
 * así como realizar acciones de edición, eliminación y agregado de nuevos
 * números. Implementa una interfaz responsive utilizando componentes tipo
 * Card y Button, e integra AlertDialog para mostrar retroalimentación al
 * guardar cambios (éxito o error simulado).
 */

/**
 * Author: Miguel Angel Condori
 * Date: (2026-03-28):
 *  Se añadió navegación con botón "Volver a Seguridad" mediante onBack.
 *  Se mejoró la UI de botones eliminando fondos sólidos y usando estilos con borde.
 *  Se implementó AlertDialog para confirmación de eliminación de teléfonos.
 *  Se añadió estado para manejar el teléfono seleccionado a eliminar.
 *  Se mejoró el AlertDialog de guardado con feedback visual (éxito/error).
 *  Se ajustó la alineación y tamaño de botones dentro de los dialogs.
 */


"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import { ArrowLeft } from "lucide-react";

interface TelefonosViewProps {
  id_usuario: string;
  telefonos: string[];
  onBack: () => void;
};

export default function TelefonosView({ id_usuario, telefonos, onBack }: TelefonosViewProps) {

  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(true);


  const [openDelete, setOpenDelete] = useState(false);
  const [telefonoAEliminar, setTelefonoAEliminar] = useState<number | null>(null);

  const handleGuardar = () => {
    const ok = Math.random() > 0.5;
    setSuccess(ok);
    setOpen(true);
  };


  const handleEliminarClick = (index: number) => {
    setTelefonoAEliminar(index);
    setOpenDelete(true);
  };

  const handleConfirmDelete = () => {
    console.log("Eliminar telefono:", telefonoAEliminar);
    setOpenDelete(false);
  };

  return (
    <div className="space-y-6 text-white">

      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        className="px-0 text-white/80 hover:text-white hover:bg-transparent"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a Seguridad
      </Button>


      <div className="flex items-start gap-3">
        <div className="text-2xl">📞</div>
        <div>
          <h2 className="text-xl font-bold">
            Gestionar teléfonos
          </h2>
          <p className="text-sm text-white/70">
            Puedes registrar hasta 3 números de teléfono en tu cuenta
          </p>
        </div>
      </div>

      {/* CARD */}
      <Card className="bg-white/10 border border-white/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-base text-white">
            Teléfonos registrados
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">

          <div className="space-y-1">
            <label className="text-xs text-white/60 tracking-widest">
              TELÉFONO 1
            </label>

            <div className="grid grid-cols-[1fr_70px_50px] sm:grid-cols-[1fr_100px_100px] gap-2 sm:gap-3 items-center">
              <input
                value={telefonos[0] || ""}
                placeholder={telefonos[0] ? "" : "Sin teléfono"}
                readOnly
                className="h-10 px-3 rounded-md border border-white/20 bg-white/10 text-sm text-white placeholder:text-white/40 w-full"
              />

              <Button variant="outline" className="h-10 w-full text-xs sm:text-sm border-white/25 bg-transparent text-white/80 hover:bg-white/10">
                Editar
              </Button>

              <div />
            </div>
          </div>


          <div className="space-y-1">
            <label className="text-xs text-white/60 tracking-widest">
              TELÉFONO 2
            </label>

            <div className="grid grid-cols-[1fr_70px_50px] sm:grid-cols-[1fr_100px_100px] gap-2 sm:gap-3 items-center">
              <input
                value={telefonos[1] || ""}
                placeholder={telefonos[1] ? "" : "Sin teléfono"}
                readOnly
                className="h-10 px-3 rounded-md border border-white/20 bg-white/10 text-sm text-white placeholder:text-white/40 w-full"
              />

              <Button variant="outline" className="h-10 w-full text-xs sm:text-sm border-white/25 bg-transparent text-white/80 hover:bg-white/10">
                Editar
              </Button>

              <Button
                variant="outline"
                onClick={() => handleEliminarClick(1)}
                className="h-10 w-full border-red-400/40 bg-transparent text-red-300 hover:bg-red-500/10 text-xs sm:text-sm"
              >
                <span className="sm:hidden">🗑</span>
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
            </div>
          </div>


          <div className="space-y-1">
            <label className="text-xs text-white/60 tracking-widest">
              TELÉFONO 3
            </label>

            <div className="grid grid-cols-[1fr_70px_50px] sm:grid-cols-[1fr_100px_100px] gap-2 sm:gap-3 items-center">
              <input
                value={telefonos[2] || ""}
                placeholder={telefonos[2] ? "" : "Sin teléfono"}
                readOnly
                className="h-10 px-3 rounded-md border border-white/20 bg-white/5 text-sm text-white placeholder:text-white/40 w-full"
              />

              <Button variant="outline" className="h-10 w-full text-xs sm:text-sm border-white/25 bg-transparent text-white/80 hover:bg-white/10">
                Editar
              </Button>

              <Button
                variant="outline"
                onClick={() => handleEliminarClick(2)}
                className="h-10 w-full border-red-400/40 bg-transparent text-red-300 hover:bg-red-500/10 text-xs sm:text-sm"
              >
                <span className="sm:hidden">🗑</span>
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button className="h-10 w-full sm:w-auto px-4 border-2 border-dashed border-white/30 rounded-md text-white/50 hover:bg-white/10 transition text-sm">
              + Agregar teléfono
            </button>
          </div>

        </CardContent>
      </Card>

      <div className="flex gap-3 justify-center sm:justify-start">
        <Button
          variant="outline"
          className="border-white/30 bg-transparent text-white/70 hover:bg-white/10"
        >
          Cancelar
        </Button>

        <Button
          className="font-semibold bg-transparent border border-white/30 text-white hover:bg-white/10"
          onClick={handleGuardar}
        >
          Guardar cambios
        </Button>
      </div>

      <AlertDialog open={open}>
        <AlertDialogContent className="text-center bg-white border border-gray-200 text-black">

          <div className="flex justify-center mb-2">
            <div
              className={`h-16 w-16 flex items-center justify-center rounded-full ${
                success ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <span className="text-3xl">
                {success ? "✓" : "✕"}
              </span>
            </div>
          </div>

          <AlertDialogTitle className="text-lg font-bold">
            {success ? "¡Teléfonos actualizados!" : "Ocurrió un error"}
          </AlertDialogTitle>

          <p className="text-sm text-gray-500">
            {success
              ? "Los teléfonos fueron actualizados exitosamente."
              : "No pudimos actualizar el teléfono, por favor inténtalo de nuevo."}
          </p>

          <AlertDialogFooter className="mt-4">
            <div className="w-full flex justify-center">
              <AlertDialogAction
                onClick={() => setOpen(false)}
                className={`px-6 ${
                  success
                    ? "bg-primary text-primary-foreground"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                Aceptar
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>


      <AlertDialog open={openDelete}>
        <AlertDialogContent className="text-center bg-white border border-gray-200 text-black">

          <AlertDialogTitle className="text-lg font-bold">
            ¿Eliminar publicación?
          </AlertDialogTitle>

          <p className="text-sm text-gray-500">
            Esta acción no se puede deshacer. El teléfono será eliminado permanentemente.
          </p>

          <AlertDialogFooter className="flex justify-center gap-2 mt-4">
            <AlertDialogCancel onClick={() => setOpenDelete(false)}>
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}