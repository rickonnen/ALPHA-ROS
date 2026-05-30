/**
 * Dev: Jose Daniel Condarco Flores      Fecha: 27/04/2026
 * Modal de confirmacion para eliminar un elemento del historial de busqueda.
 * Muestra una ventana centrada con mensaje, boton de aceptar, boton de cancelar y boton X.
 * Solo permite cerrar el modal mediante aceptar, cancelar o X; no se cierra con clic fuera ni con ESC.
 * @param bolOpen Estado que indica si el modal debe mostrarse o permanecer oculto
 * @param strItemName Nombre del elemento del historial seleccionado para eliminar
 * @param fnOnAccept Funcion que confirma la eliminacion del elemento seleccionado
 * @param fnOnCancel Funcion que cancela la accion y cierra el modal sin eliminar
 * @return Elemento JSX que renderiza el modal de confirmacion de eliminacion
 */
"use client";

import { useEffect } from "react";

interface ConfirmDeleteHistoryModalProps {
    bolOpen: boolean;
    strItemName?: string;
    fnOnAccept: () => void;
    fnOnCancel: () => void;
}

export default function ConfirmDeleteHistoryModal({
    bolOpen,
    strItemName,
    fnOnAccept,
    fnOnCancel,
}: ConfirmDeleteHistoryModalProps) {
    
    useEffect(() => {
        if (bolOpen && typeof document !== "undefined") {
            // Si hay un elemento activo (como un input) le quitamos el foco
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        }
    }, [bolOpen]);

    if (!bolOpen) return null;

    return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/45 px-4">
        <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-history-title"
        className="relative w-full max-w-[28.125rem] rounded-lg bg-background px-8 pb-8 pt-8 shadow-2xl"
        onMouseDown={(objEvent) => {
            objEvent.stopPropagation();
        }}
        onClick={(objEvent) => {
            objEvent.stopPropagation();
        }}
        >
        <button
            type="button"
            onClick={fnOnCancel}
            aria-label="Cerrar modal"
            className="absolute right-5 top-4 text-3xl leading-none text-foreground/40 transition-colors hover:text-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
            x
        </button>

        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20">
            <span className="text-3xl font-bold text-secondary">!</span>
        </div>

        <h2
            id="delete-history-title"
            className="mb-3 text-center text-2xl font-bold text-foreground"
        >
            Eliminar busqueda
        </h2>

        <p className="mb-6 text-center text-base leading-relaxed text-foreground/70">
            Estas seguro de eliminar esta busqueda del historial?
            {strItemName ? (
            <span className="mt-2 block font-semibold text-foreground">
                {strItemName}
            </span>
            ) : null}
        </p>

        <div className="flex flex-col gap-3">
            <button
            type="button"
            onClick={fnOnAccept}
            className="w-full rounded-md bg-primary px-4 py-3 font-bold text-primary-foreground transition-colors hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
            Aceptar
        </button>

            <button
            type="button"
            onClick={fnOnCancel}
            className="w-full rounded-md bg-secondary-fund px-4 py-3 font-bold text-foreground transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
            Cancelar
            </button>
        </div>

        <p className="mt-5 text-center text-xs font-medium text-foreground/40">
            Esta accion solo eliminara el elemento seleccionado
        </p>
        </div>
    </div>
    );
}