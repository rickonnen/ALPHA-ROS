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

/**
 * Author: Miguel Angel Condori
 * Date: (2026-03-28):
 *  Se implementó funcionalidad de edición de teléfonos con soporte para Cancelar y Guardar.
 *  Los botones Cancelar y Guardar solo se habilitan cuando un teléfono está en edición.
 *  Se añadió snapshot de valores previos para restaurar al cancelar cambios.
 *  La adición de un nuevo teléfono muestra un campo editable solo durante la edición.
 *  Se ajustaron estados y UI para evitar conflictos de edición múltiple.
 */
 
/**
 * Author: Miguel Angel Condori
 * Date: (2026-03-29):
 *  Se integraron los endpoints reales (create, update, delete) con el frontend.
 *  Se añadió trim a los números para evitar errores por espacios.
 *  Se evitó realizar requests innecesarios en update cuando no hay cambios.
 *  Se implementó eliminación lógica desde el frontend conectada al backend.
 *  Se reconstruye la lista de teléfonos tras eliminar para mantener consistencia.
 *  Se bloquearon botones durante guardado/eliminación para evitar múltiples requests.
 *  Se deshabilitó cancelar en el AlertDialog durante eliminación en curso.
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
}

/**
 * Cada vez deberia de ser una consulta a la base de datos ya que los telefonos se actualizan constantemente?
 * solo despues de un update o delete realmente o create
 *
 *
 */
const MAX_TELEFONOS = 3;

const crearTelefonos = (telefonos: string[]) =>
  Array.from({ length: MAX_TELEFONOS }, (_, i) => telefonos[i] ?? "");

const crearActivos = (telefonos: string[]) =>
  Array.from({ length: MAX_TELEFONOS }, (_, i) => Boolean(telefonos[i]?.trim()));

type SnapshotTelefonos = {
  telefonosActivos: boolean[];
  telefonosValues: string[];
  editando: boolean[];
};

export default function TelefonosView({
  id_usuario,
  telefonos,
  onBack,
}: TelefonosViewProps) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);
  const [telefonoAEliminar, setTelefonoAEliminar] = useState<number | null>(null);

  const [telefonosActivos, setTelefonosActivos] = useState<boolean[]>(
    crearActivos(telefonos)
  );
  const [telefonosValues, setTelefonosValues] = useState<string[]>(
    crearTelefonos(telefonos)
  );
  const [editando, setEditando] = useState<boolean[]>(
    Array.from({ length: MAX_TELEFONOS }, () => false)
  );

  const [slotEnEdicion, setSlotEnEdicion] = useState<number | null>(null);
  const [snapshot, setSnapshot] = useState<SnapshotTelefonos | null>(null);

  const cantidadActivos = telefonosActivos.filter(Boolean).length;
  const hayEdicionAbierta = slotEnEdicion !== null;
  const puedeAgregar = !hayEdicionAbierta && cantidadActivos < MAX_TELEFONOS;

  const guardarSnapshot = () => {
    setSnapshot({
      telefonosActivos: [...telefonosActivos],
      telefonosValues: [...telefonosValues],
      editando: [...editando],
    });
  };

  const iniciarEdicion = (index: number, crearNuevo: boolean) => {
    if (hayEdicionAbierta) return;

    guardarSnapshot();

    if (crearNuevo) {
      const nuevosActivos = [...telefonosActivos];
      nuevosActivos[index] = true;
      setTelefonosActivos(nuevosActivos);

      const nuevosValues = [...telefonosValues];
      nuevosValues[index] = "";
      setTelefonosValues(nuevosValues);
    }

    const nuevosEdit = [...editando];
    nuevosEdit[index] = true;
    setEditando(nuevosEdit);

    setSlotEnEdicion(index);
  };

  const handleAgregarTelefono = () => {
    if (!puedeAgregar) return;

    const index = telefonosActivos.findIndex((active) => !active);
    if (index === -1) return;

    iniciarEdicion(index, true);
  };

  const handleEditar = (index: number) => {
    if (hayEdicionAbierta) return;
    if (!telefonosActivos[index]) return;

    iniciarEdicion(index, false);
  };

  const handleChange = (index: number, value: string) => {
    if (slotEnEdicion !== index) return;

    const nuevosValues = [...telefonosValues];
    nuevosValues[index] = value;
    setTelefonosValues(nuevosValues);
  };

  const handleCancelar = () => {
    if (!hayEdicionAbierta || !snapshot) return;

    setTelefonosActivos(snapshot.telefonosActivos);
    setTelefonosValues(snapshot.telefonosValues);
    setEditando(snapshot.editando);

    setSlotEnEdicion(null);
    setSnapshot(null);

    setTelefonoAEliminar(null);
    setOpenDelete(false);
  };

  const handleEliminarClick = (index: number) => {
    if (index === 0) return;
    if (hayEdicionAbierta) return;

    setTelefonoAEliminar(index);
    setOpenDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (telefonoAEliminar === null || guardando) return;

    const slotActual = telefonoAEliminar;

    const numero = telefonosValues[slotActual]?.trim();
    if (!numero) return;

    setGuardando(true);

    try {
      const res = await fetch("/backend/perfil/telefono/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario,
          numero,
        }),
      });

      const json = await res.json();

      setSuccess(res.ok);
      setOpen(true);

      if (res.ok) {
        const filtrados = telefonosValues.filter(
          (_, i) => i !== slotActual && telefonosActivos[i]
        );

        const nuevosValues = [
          ...filtrados,
          ...Array(MAX_TELEFONOS - filtrados.length).fill(""),
        ];

        const nuevosActivos = nuevosValues.map((v) => Boolean(v.trim()));

        setTelefonosValues(nuevosValues);
        setTelefonosActivos(nuevosActivos);

        setEditando(Array.from({ length: MAX_TELEFONOS }, () => false));
        setSlotEnEdicion(null);
        setSnapshot(null);
        setTelefonoAEliminar(null);
        setOpenDelete(false);
      }
    } catch (error) {
      console.error(error);
      setSuccess(false);
      setOpen(true);
    } finally {
      setGuardando(false);
    }
  };

  const formatearTelefonoSimple = (codigo_pais: number, numero: string) => {
    return `+${codigo_pais} ${numero}`;
  };

  
  const handleGuardar = async () => {
    if (slotEnEdicion === null || guardando) return;

    const slotActual = slotEnEdicion;
    const numeroNuevo = telefonosValues[slotActual]?.trim();

    if (!numeroNuevo) return;

    setGuardando(true);

    try {
      let res;
      if (!snapshot?.telefonosActivos[slotActual]) {
        res = await fetch("/backend/perfil/telefono/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            numero: numeroNuevo,
            id_usuario,
          }),
        });
      } 
      
      else {
        const numeroViejo = snapshot.telefonosValues[slotActual]?.trim();
        if (!numeroViejo || numeroViejo === numeroNuevo) {
          setSlotEnEdicion(null);
          setSnapshot(null);
          setGuardando(false);
          return;
        }

        res = await fetch("/backend/perfil/telefono/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_usuario,
            numero_viejo: numeroViejo,
            numero_nuevo: numeroNuevo,
          }),
        });
      }

      const json = await res.json();

      setSuccess(res.ok);
      setOpen(true);

      if (res.ok && json.data) {
        const tel =
          json.data.telefonoNuevo ||
          json.data.telefono ||
          json.data;

        if (!tel) throw new Error("Respuesta inválida del backend");

        const numeroFormateado = formatearTelefonoSimple(
          tel.codigo_pais,
          tel.nro_telefono
        );

        const nuevosValues = [...telefonosValues];
        nuevosValues[slotActual] = numeroFormateado;
        setTelefonosValues(nuevosValues);

        const nuevosEditando = [...editando];
        nuevosEditando[slotActual] = false;
        setEditando(nuevosEditando);

        const nuevosActivos = [...telefonosActivos];
        nuevosActivos[slotActual] = true;
        setTelefonosActivos(nuevosActivos);

        setSlotEnEdicion(null);
        setSnapshot(null);
      }
    } catch (error) {
      console.error(error);
      setSuccess(false);
      setOpen(true);
    } finally {
      setGuardando(false);
    }
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
      <p className="text-xs tracking-widest text-white/50 mb-1 pb-5">
      SEGURIDAD › GESTIONAR TELÉFONOS
      </p>

      <div className="flex items-start gap-3">
        <div className="text-2xl">📞</div>
        <div>
          <h2 className="text-xl font-bold">Gestionar teléfonos</h2>
          <p className="text-sm text-white/70">
            Puedes registrar hasta 3 números de teléfono en tu cuenta
          </p>
        </div>
      </div>

      <Card className="bg-white/10 border border-white/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-base text-white">
            Teléfonos registrados
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {[0, 1, 2].map((i) =>
            telefonosActivos[i] ? (
              <div key={i} className="space-y-1">
                <label className="text-xs text-white/60 tracking-widest">
                  TELÉFONO {i + 1}
                </label>

                <div className="grid grid-cols-[1fr_70px_50px] sm:grid-cols-[1fr_100px_100px] gap-2 sm:gap-3 items-center">
                  <input
                    value={telefonosValues[i] || ""}
                    placeholder="Sin teléfono"
                    onChange={(e) => handleChange(i, e.target.value)}
                    readOnly={!editando[i]}
                    className={`h-10 px-3 rounded-md border border-white/20 text-sm text-white placeholder:text-white/40 w-full ${
                      editando[i] ? "bg-white/20" : "bg-white/10"
                    }`}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleEditar(i)}
                    disabled={hayEdicionAbierta && slotEnEdicion !== i}
                    className="h-10 w-full text-xs sm:text-sm border-white/25 bg-transparent text-white/80 hover:bg-white/10 disabled:opacity-40"
                  >
                    {slotEnEdicion === i ? "Editando" : "Editar"}
                  </Button>

                  {i !== 0 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleEliminarClick(i)}
                      disabled={hayEdicionAbierta}
                      className="h-10 w-full border-red-500 bg-transparent text-red-400 hover:bg-red-500/20 text-xs sm:text-sm disabled:opacity-40"
                    >
                      <span className="sm:hidden">🗑</span>
                      <span className="hidden sm:inline">Eliminar</span>
                    </Button>
                  ) : (
                    <div />
                  )}
                </div>
              </div>
            ) : null
          )}
        </CardContent>

        <div className="flex justify-center px-4 pb-4">
          <button
            type="button"
            onClick={handleAgregarTelefono}
            disabled={!puedeAgregar}
            className={`h-10 w-full sm:w-auto px-4 border-2 border-dashed border-white/30 rounded-md text-white/60 transition text-sm ${
              puedeAgregar ? "hover:bg-white/10" : "opacity-50 cursor-not-allowed"
            }`}
          >
            + Agregar teléfono
          </button>
        </div>
      </Card>

      <div className="flex gap-3 justify-center sm:justify-start">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancelar}
          disabled={!hayEdicionAbierta || guardando}
          className="border-white/30 bg-transparent text-white/70 hover:bg-white/10 disabled:opacity-40"
        >
          Cancelar
        </Button>

        <Button
          type="button"
          onClick={handleGuardar}
          disabled={!hayEdicionAbierta || guardando}
          className="font-semibold bg-transparent border border-white/30 text-white hover:bg-white/10 disabled:opacity-40"
        >
          {guardando ? "Guardando..." : "Guardar cambios"}
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
              <span className="text-3xl">{success ? "✓" : "✕"}</span>
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
            ¿Eliminar teléfono?
          </AlertDialogTitle>

          <p className="text-sm text-gray-500">
            Esta acción no se puede deshacer. El teléfono será eliminado permanentemente.
          </p>

          <AlertDialogFooter className="flex justify-center gap-2 mt-4">
            <AlertDialogCancel
              onClick={() => setOpenDelete(false)}
              disabled={guardando}
              className="disabled:opacity-50"
            >
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={guardando}
              className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
            >
              {guardando ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}