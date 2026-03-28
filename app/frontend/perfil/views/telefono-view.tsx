"use client";

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

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function TelefonosView() {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(true);

  //simulando comportamiento
  const handleGuardar = () => {
    
    const ok = Math.random() > 0.5;

    setSuccess(ok);
    setOpen(true);
  };

  return (
    <div className="space-y-6 text-white">

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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Teléfonos registrados
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">

          <div className="space-y-1">
            <label className="text-xs text-gray-400 tracking-widest">
              TELÉFONO 1
            </label>

            <div className="grid grid-cols-[1fr_70px_50px] sm:grid-cols-[1fr_100px_100px] gap-2 sm:gap-3 items-center">
              <input
                value="+591 70012345"
                readOnly
                className="h-10 px-3 rounded-md border bg-gray-50 text-sm text-black w-full"
              />

              <Button variant="outline" className="h-10 w-full text-xs sm:text-sm">
                Editar
              </Button>

              <div />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 tracking-widest">
              TELÉFONO 2
            </label>

            <div className="grid grid-cols-[1fr_70px_50px] sm:grid-cols-[1fr_100px_100px] gap-2 sm:gap-3 items-center">
              <input
                value="+591 71234567"
                readOnly
                className="h-10 px-3 rounded-md border bg-gray-50 text-sm text-black w-full"
              />

              <Button variant="outline" className="h-10 w-full text-xs sm:text-sm">
                Editar
              </Button>

              <Button
                variant="outline"
                className="h-10 w-full border-red-300 text-red-500 hover:bg-red-50 text-xs sm:text-sm"
              >
                <span className="sm:hidden">🗑</span>
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 tracking-widest">
              TELÉFONO 3
            </label>

            <div className="grid grid-cols-[1fr_70px_50px] sm:grid-cols-[1fr_100px_100px] gap-2 sm:gap-3 items-center">
              <input
                placeholder="No registrado"
                readOnly
                className="h-10 px-3 rounded-md border bg-gray-100 text-sm text-black w-full"
              />

              <Button variant="outline" className="h-10 w-full text-xs sm:text-sm">
                Editar
              </Button>

              <Button
                variant="outline"
                className="h-10 w-full border-red-300 text-red-400 text-xs sm:text-sm"
              >
                <span className="sm:hidden">🗑</span>
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button className="h-10 w-full sm:w-auto px-4 border-2 border-dashed rounded-md text-gray-400 hover:bg-gray-50 transition text-sm">
              + Agregar teléfono
            </button>
          </div>

        </CardContent>
      </Card>

      <div className="flex gap-3 justify-center sm:justify-start">
        <Button
          variant="outline"
          className="border-orange-300 text-orange-400 hover:bg-orange-50"
        >
          Cancelar
        </Button>

        <Button className="font-semibold" onClick={handleGuardar}>
          Guardar cambios
        </Button>
      </div>

      <AlertDialog open={open}>
        <AlertDialogContent className="text-center">


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

          <AlertDialogFooter className="flex justify-center mt-4">
            <AlertDialogAction
              onClick={() => setOpen(false)}
              className={`w-full ${
                success ? "" : "bg-red-500 hover:bg-red-600"
              }`}
            >
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}