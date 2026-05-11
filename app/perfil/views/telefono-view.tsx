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


/**
 * Author: Miguel Angel Condori
 * Date: (2026-04-04):
 *  Se agregó prop onTelefonosChange para propagar cambios al componente padre.
 *  Se implementó helper notificarCambios para sincronizar Perfil y Seguridad sin recargar.
 *  Se añadió helper quitarEspacio para mostrar teléfonos sin espacio solo en esta vista.
 *  Se restringió el input para aceptar únicamente '+' al inicio y números consecutivos.
 *  Se bloqueó el pegado de texto (onPaste) para evitar caracteres no permitidos.
 *  Se reemplazó emoji de teléfono por ícono Smartphone de lucide-react.
 *  Se añadió cursor-pointer a todos los botones interactivos.
 */



/**
 * Author: Miguel Angel Condori
 * Date: (2026-04-17):
 *  Se movió paisDefault y se agregaron parsearValores y parsearPaises fuera del componente.
 *  Se eliminó useEffect de inicialización, los useState ahora parsean desde el primer render.
 *  Se implementó validación en tiempo real con estados: empty, invalid, exists, valid.
 *  Se agregó debounce de 600ms para evitar requests innecesarios al backend.
 *  Se creó endpoint /api/perfil/telefono/existe con soporte para excluir al propio usuario.
 *  Se habilitó pegado desde portapapeles con sanitización (solo números y espacios, máx 15).
 *  Se ajustaron estilos del selector de país, input y botones según estado de edición.
 *  Se corrigió el dropdown para cerrarse al cancelar la edición.
 *  El botón Confirmar cambios solo se activa con fondo blanco cuando el número es válido.
 *  El botón Cancelar se ilumina solo cuando hay una edición activa.
 *  El botón Editar muestra fondo oscuro sin borde naranja cuando está en modo edición.
 */

"use client";

import { useState, useRef } from "react";

import { PAISES } from "@/lib/paises";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { parsePhoneNumberFromString }  from "libphonenumber-js";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import { ArrowLeft, Smartphone, ChevronDown, Pencil, Trash2 } from "lucide-react";

interface TelefonosViewProps {
  id_usuario: string;
  telefonos: string[];
  onBack: () => void;
  onTelefonosChange: (nuevosTelefonos: string[]) => void;
}

/**
 * Cada vez deberia de ser una consulta a la base de datos ya que los telefonos se actualizan constantemente?
 * solo despues de un update o delete realmente o create
 *
 *
 */

const MAX_TELEFONOS = 3;

const paisDefault = PAISES.find(p => p.iso === "bo") || PAISES[0];

const parsearValores = (telefonos: string[]): string[] =>
  Array.from({ length: MAX_TELEFONOS }, (_, i) => {
    const phone = parsePhoneNumberFromString((telefonos[i] ?? "").replace(/\s+/g, ""));
    return phone?.isValid() ? phone.nationalNumber : (telefonos[i] ?? "");
  });

const parsearPaises = (telefonos: string[]) =>
  Array.from({ length: MAX_TELEFONOS }, (_, i) => {
    const phone = parsePhoneNumberFromString((telefonos[i] ?? "").replace(/\s+/g, ""));
    if (!phone?.isValid()) return paisDefault;
    const codigo = `+${phone.countryCallingCode}`;
    return PAISES.find(p => p.codigo === codigo) ?? paisDefault;
  });


// const quitarEspacio = (tel: string) => tel.replace(/\s+/g, "");

type SnapshotTelefonos = {
  telefonosActivos: boolean[];
  telefonosValues: string[];
  editando: boolean[];
  paisesSeleccionados: {
    iso: string;
    nombre: string;
    codigo: string;
  }[];
};

type EstadoValidacion = "idle" | "empty" | "invalid" | "exists" | "valid";

type ValidacionTelefonos = {
  estado: EstadoValidacion;
  verificando: boolean; 
};


export default function TelefonosView({
  id_usuario,
  telefonos,
  onBack,
  onTelefonosChange,
}: TelefonosViewProps) {

  const [validaciones, setValidaciones] = useState<ValidacionTelefonos[]>(
    Array.from({ length: MAX_TELEFONOS }, () => ({ estado: "idle", verificando: false }))
  );

  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);
  const [telefonoAEliminar, setTelefonoAEliminar] = useState<number | null>(null);

  const [telefonosActivos, setTelefonosActivos] = useState<boolean[]>(
    () => Array.from({ length: MAX_TELEFONOS }, (_, i) =>
      Boolean(parsePhoneNumberFromString((telefonos[i] ?? "").replace(/\s+/g, ""))?.nationalNumber)
    )
  );
  const [telefonosValues, setTelefonosValues] = useState<string[]>(
    () => parsearValores(telefonos)
  );
  const [editando, setEditando] = useState<boolean[]>(
    Array.from({ length: MAX_TELEFONOS }, () => false)
  );

  const [slotEnEdicion, setSlotEnEdicion] = useState<number | null>(null);
  const [snapshot, setSnapshot] = useState<SnapshotTelefonos | null>(null);
  const [paisesSeleccionados, setPaisesSeleccionados] = useState(
    () => parsearPaises(telefonos)
  );
    
  const [openSelect, setOpenSelect] = useState<number | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const notificarCambios = (
    nuevosValues: string[],
    nuevosActivos: boolean[],
    nuevosPaises: {
      iso: string;
      nombre: string;
      codigo: string;
    }[]
  ) => {
    const telefonosActualizados = nuevosValues
      .map((v, i) => {
        if (!nuevosActivos[i] || !v.trim()) return null;
        return `${nuevosPaises[i].codigo} ${v.trim()}`;
      })
      .filter(Boolean) as string[];

    onTelefonosChange(telefonosActualizados);
  };

  const cantidadActivos = telefonosActivos.filter(Boolean).length;
  const hayEdicionAbierta = slotEnEdicion !== null;
  const puedeGuardar =
  hayEdicionAbierta &&
  slotEnEdicion !== null &&
  validaciones[slotEnEdicion].estado === "valid" &&
  !validaciones[slotEnEdicion].verificando &&
  !guardando;
  const puedeAgregar = !hayEdicionAbierta && cantidadActivos < MAX_TELEFONOS;

const guardarSnapshot = () => {
  setSnapshot({
    telefonosActivos: [...telefonosActivos],
    telefonosValues: [...telefonosValues],
    editando: [...editando],
    paisesSeleccionados: [...paisesSeleccionados],
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

      const nuevosPaises = [...paisesSeleccionados];
      nuevosPaises[index] = paisDefault;
      setPaisesSeleccionados(nuevosPaises);

      setValidaciones(prev => {
        const nuevo = [...prev];
        nuevo[index] = { estado: "empty", verificando: false };
        return nuevo;
      });
    } else {
      setValidaciones(prev => {
        const nuevo = [...prev];
        nuevo[index] = { estado: "valid", verificando: false };
        return nuevo;
      });
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

    // const limpio = value
    //   .replace(/[^\d\s]/g, "")
    //   .replace(/^\s+/, "")
    //   .replace(/\s{2,}/g, " ");

    const nuevo = value.replace(/[^\d]/g, "").slice(0, 15);

    const nuevosValues = [...telefonosValues];
    nuevosValues[index] = nuevo;
    setTelefonosValues(nuevosValues);

    // Cancelar validación anterior pendiente
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Validar después de 600ms sin escribir
    debounceRef.current = setTimeout(() => {
      validarTelefono(index, nuevo, paisesSeleccionados[index]);
    }, 600);
  };

  const validarTelefono = async (index: number, numero: string, pais: typeof paisDefault) => {
  // Actualizar estado helper
  const actualizar = (estado: EstadoValidacion, verificando = false) => {
    setValidaciones(prev => {
      const nuevo = [...prev];
      nuevo[index] = { estado, verificando };
      return nuevo;
    });
  };




    const numeroTrimmed = numero.trim();
    if (!numeroTrimmed) {
      actualizar("empty");
      return;
    }

    const numeroCompleto = `${pais.codigo}${numeroTrimmed}`;
    const phone = parsePhoneNumberFromString(numeroCompleto);

    if (!phone || !phone.isValid()) {
      actualizar("invalid");
      return;
    }
      const existeEnOtroSlot = telefonosActivos.some((activo, idx) => {
      if (idx === index || !activo) return false;
      const otroNumero = `${paisesSeleccionados[idx].codigo}${telefonosValues[idx].trim()}`;
      return otroNumero === numeroCompleto;
    });

    if (existeEnOtroSlot) {
      actualizar("exists");
      return;
    }


    actualizar("valid", true);
    try {
      const res = await fetch("/api/perfil/telefono/existe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero: numeroCompleto, id_usuario }),
      });
      const json = await res.json();

      const esElMismoOriginal =
        snapshot?.telefonosActivos[index] &&
        snapshot?.telefonosValues[index]?.trim() === numeroTrimmed &&
        snapshot?.paisesSeleccionados[index]?.codigo === pais.codigo;

      if (json.existe && !esElMismoOriginal) {
        actualizar("exists");
      } else {
        actualizar("valid");
      }
    } catch {
      actualizar("valid");
    }
  };

  const handleCancelar = () => {
    if (!hayEdicionAbierta || !snapshot) return;

    setTelefonosActivos(snapshot.telefonosActivos);
    setTelefonosValues(snapshot.telefonosValues);
    setEditando(snapshot.editando);
    setPaisesSeleccionados(snapshot.paisesSeleccionados);

    setSlotEnEdicion(null);
    setSnapshot(null);

    setTelefonoAEliminar(null);
    setOpenDelete(false);
    setOpenSelect(null);

    setValidaciones(prev => {
      const nuevo = [...prev];
      if (slotEnEdicion !== null) {
        nuevo[slotEnEdicion] = { estado: "idle", verificando: false };
      }
      return nuevo;
    });
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
      const paisDelSlot = paisesSeleccionados[slotActual];
      const numeroCompleto = `${paisDelSlot.codigo}${numero}`; 

      const res = await fetch("/api/perfil/telefono/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario,
          numero: numeroCompleto,  
        }),
      });

      await res.json();

      setSuccess(res.ok);
      setOpen(true);

      if (res.ok) {
        const filtrados = telefonosValues.filter(
          (_, i) => i !== slotActual && telefonosActivos[i]
        );

        const paisesFiltrados = paisesSeleccionados.filter(
          (_, i) => i !== slotActual && telefonosActivos[i]
        );

        const nuevosValues = [
          ...filtrados,
          ...Array(MAX_TELEFONOS - filtrados.length).fill(""),
        ];

        const nuevosPaises = [
          ...paisesFiltrados,
          ...Array(MAX_TELEFONOS - paisesFiltrados.length).fill(paisDefault),
        ];

        const nuevosActivos = nuevosValues.map((v) => Boolean(v.trim()));

        setTelefonosValues(nuevosValues);
        setTelefonosActivos(nuevosActivos);

        setEditando(Array.from({ length: MAX_TELEFONOS }, () => false));
        setSlotEnEdicion(null);
        setSnapshot(null);
        setTelefonoAEliminar(null);
        setOpenDelete(false);
        setPaisesSeleccionados(nuevosPaises);
        notificarCambios(nuevosValues, nuevosActivos, nuevosPaises);
      }
    } catch (error) {
      console.error(error);
      setSuccess(false);
      setOpen(true);
    } finally {
      setGuardando(false);
    }
  };

  // const formatearTelefonoSimple = (codigo_pais: number, numero: string) => {
  //   return `+${codigo_pais} ${numero}`;
  // };


  /**Telefonos   */


const handleGuardar = async () => {
  if (slotEnEdicion === null || guardando) return;

  const slotActual = slotEnEdicion;
  const numeroNuevo = telefonosValues[slotActual]?.trim();
  const paisNuevo = paisesSeleccionados[slotActual] || paisDefault;
  const paisViejo = snapshot?.paisesSeleccionados[slotActual] || paisDefault;
  const numeroViejo = snapshot?.telefonosValues[slotActual]?.trim() || "";

  if (!numeroNuevo) return;

  
  const numeroNuevoCompleto = `${paisNuevo.codigo}${numeroNuevo}`;   // "+59171234567"
  const numeroViejoCompleto = `${paisViejo.codigo}${numeroViejo}`;   // "+59171234567"

  setGuardando(true);

  try {
    let res: Response | undefined;

    if (!snapshot?.telefonosActivos[slotActual]) {
      res = await fetch("/api/perfil/telefono/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario,
          numero: numeroNuevoCompleto,  
        }),
      });
    } else {
      const cambioNumero = numeroViejo !== numeroNuevo;
      const cambioPais = paisViejo.codigo !== paisNuevo.codigo;

      if (!cambioNumero && !cambioPais) {
        // Sin cambios, solo cerrar edición
        const nuevosEditando = [...editando];
        nuevosEditando[slotActual] = false;
        setEditando(nuevosEditando);
        setSlotEnEdicion(null);
        setSnapshot(null);
        setGuardando(false);
        return;
      }

      res = await fetch("/api/perfil/telefono/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario,
          numero_viejo: numeroViejoCompleto,   
          numero_nuevo: numeroNuevoCompleto,  
          // ya no necesitas enviar codigo_pais_viejo / codigo_pais_nuevo
          // el backend los extrae solo con libphonenumber-js
        }),
      });
    }

    if (!res) return;
    const json = await res.json();
    setSuccess(res.ok);
    setOpen(true);

    if (res.ok) {

      const tel = json.data?.telefono ?? json.data?.telefonoNuevo ?? json.data;
      
      const nuevosValues = [...telefonosValues];
      nuevosValues[slotActual] = tel?.nro_telefono ?? numeroNuevo;

      const nuevosEditando = [...editando];
      nuevosEditando[slotActual] = false;

      const nuevosActivos = [...telefonosActivos];
      nuevosActivos[slotActual] = true;

      setTelefonosValues(nuevosValues);
      setEditando(nuevosEditando);
      setTelefonosActivos(nuevosActivos);
      setSlotEnEdicion(null);
      setSnapshot(null);
      setValidaciones(prev => {
        const nuevo = [...prev];
        nuevo[slotActual] = { estado: "idle", verificando: false };
        return nuevo;
      });
      notificarCambios(nuevosValues, nuevosActivos, paisesSeleccionados);
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
        className="px-0 text-white/80 hover:text-white hover:bg-transparent cursor-pointer"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Seguridad
      </Button>
      <div className="flex items-center gap-3">
        <Smartphone className="h-9 w-9 text-white/70" />
        <div>
          <h2 className="text-xl font-bold">Gestionar teléfonos</h2>
          <p className="text-sm text-white/70">
            Puedes registrar hasta 3 números de teléfono en tu cuenta
          </p>
        </div>
      </div>

      <Card className="bg-white/10 border border-white/20 backdrop-blur-md overflow-visible">
      <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base text-white">
            Teléfonos registrados
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5 pb-20 px-3 pr-4 sm:px-6">
          {[0, 1, 2].map((i) =>
            telefonosActivos[i] ? (
              
            <div key={i} className="space-y-1">
                <label className="text-xs text-white/60 tracking-widest">
                  TELÉFONO {i + 1}
                </label>

                  <div className="grid grid-cols-[1fr_36px_36px] sm:grid-cols-[1fr_100px_100px] gap-1.5 sm:gap-3 items-center">                    <div className="flex gap-2 w-full">
                      
                    <div className="relative w-36 sm:w-40">

                    {/* SELECT VISIBLE */}
                    <div
                      onClick={() => {
                        if (slotEnEdicion !== i) return;
                        setOpenSelect(openSelect === i ? null : i);
                      }}
                    className={`flex items-center gap-1 sm:gap-2 h-[42px] px-1 sm:px-2 rounded-md border-2 cursor-pointer text-white transition-colors ${
                        "border-white/20 bg-[#1F3A4D]"
                    }`}
                    >
                      <img
                        src={`https://flagcdn.com/24x18/${paisesSeleccionados[i].iso}.png`}
                        className="w-5 h-4"
                      />
                      <span className="text-sm text-white">{paisesSeleccionados[i].codigo}</span>
                      {slotEnEdicion === i && <ChevronDown className="w-3 h-3 text-white/50 ml-auto" />}
                    </div>

                      {/* DROPDOWN */}
                        {openSelect === i && (
                          <div
                           className="absolute top-full left-0 w-44 sm:w-60 h-[144px] overflow-y-auto bg-[#1e1e2e] border border-white/20 rounded-md z-[10000] text-white scrollbar-thin scrollbar-thumb-white/20"
                              style={{
                                marginTop: !editando[i] || validaciones[i].estado === "idle"
                                  ? "4px"
                                  : validaciones[i].estado === "valid"
                                  ? "18px"
                                  : "34px"
                              }}
                          >
                          {PAISES.map((p) => (
                            <div
                              key={p.iso}
                              onClick={() => {
                                const nuevos = [...paisesSeleccionados];
                                nuevos[i] = p;
                                setPaisesSeleccionados(nuevos);
                                setOpenSelect(null);

                                // Revalidar con el nuevo país
                                if (slotEnEdicion === i) {
                                  if (debounceRef.current) clearTimeout(debounceRef.current);
                                  debounceRef.current = setTimeout(() => {
                                    validarTelefono(i, telefonosValues[i], p);
                                  }, 300);
                                }
                              }}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 cursor-pointer"
                            >
                              <img
                                src={`https://flagcdn.com/24x18/${p.iso}.png`}
                                className="w-5 h-4"
                              />
                             <span className="whitespace-normal break-words leading-tight">{p.nombre}</span>
                              <span className="ml-auto text-white/60">{p.codigo}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* INPUT NUMERO + MENSAJE */}
                      <div className="relative flex flex-col w-full">
                        <div>
                          <input
                          value={telefonosValues[i] || ""}
                          placeholder="Número"
                          maxLength={15}
                          onChange={(e) => handleChange(i, e.target.value)}
                          onPaste={(e) => {
                            e.preventDefault();
                            const pegado = e.clipboardData.getData("text");
                            
                            const limpio = pegado.replace(/[^\d]/g, "");

                            if (!limpio || limpio.length > 15) return;

                            const nuevosValues = [...telefonosValues];
                            nuevosValues[i] = limpio;       // ← era index, ahora i
                            setTelefonosValues(nuevosValues);

                            if (debounceRef.current) clearTimeout(debounceRef.current);
                            debounceRef.current = setTimeout(() => {
                              validarTelefono(i, limpio, paisesSeleccionados[i]);  // ← era index, ahora i
                            }, 300);
                          }}
              
                          readOnly={!editando[i]}
                          className={`h-10 px-3 rounded-md border-2 text-sm text-white placeholder:text-white/40 w-full transition-colors outline-none focus:ring-0 focus:ring-offset-0 ${
                            !editando[i]
                              ? "border-white/20 bg-[#1F3A4D] focus:border-white/20"
                              : validaciones[i].estado === "valid"
                              ? "border-orange-500 bg-[#1F3A4D] focus:border-orange-500"
                              : validaciones[i].estado === "empty" || validaciones[i].estado === "invalid" || validaciones[i].estado === "exists"
                              ? "border-red-600 bg-[#1F3A4D] focus:border-red-600"
                              : "border-white/20 bg-[#1F3A4D] focus:border-white/20"
                          }`}
                        />
                      </div>

                      {editando[i] && (
                        <div className="absolute top-full right-0 mt-0.5 pointer-events-none z-[10001]">
                        {validaciones[i].estado === "empty" && (
                          <span className="text-xs text-red-400 text-right leading-tight block">
                            El número no<br />debe ser vacío
                          </span>
                        )}
                        {validaciones[i].estado === "invalid" && (
                          <span className="text-xs text-red-400 text-right leading-tight block">
                            Número inválido<br />para este país
                          </span>
                        )}
                        {validaciones[i].estado === "exists" && (
                          <span className="text-xs text-red-400 text-right leading-tight block">
                            Este número ya<br />está registrado
                          </span>
                        )}
                        {validaciones[i].estado === "valid" && !validaciones[i].verificando && (
                          <span className="text-xs text-orange-400 block">Número válido</span>
                        )}
                      </div>
                    )}
                    </div>
                    </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleEditar(i)}
                    disabled={hayEdicionAbierta && slotEnEdicion !== i}
                    className={`h-10 w-9 sm:w-full text-xs sm:text-sm disabled:opacity-40 cursor-pointer transition-colors ${                   slotEnEdicion === i
                        ? "border-white/25 bg-[#1F3A4D] text-white/60 hover:bg-[#1F3A4D]/80"
                        : "border-white/25 bg-transparent text-white/80 hover:bg-white/10"
                    }`}
                                      >
                    {/* {slotEnEdicion === i ? "Editando" : "Editar"} */}
                    <span className="sm:hidden">
                      <Pencil className={`w-4 h-4 ${slotEnEdicion === i ? "opacity-50" : ""}`} />
                    </span>
                    <span className="hidden sm:inline">
                      {slotEnEdicion === i ? "Editando" : "Editar"}
                    </span>
                    </Button>

                  {i !== 0 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleEliminarClick(i)}
                      disabled={hayEdicionAbierta}
                   className="h-10 w-9 sm:w-full mt-1 border-red-500 bg-transparent text-red-400 hover:bg-red-500/20 text-xs sm:text-sm disabled:opacity-40 cursor-pointer"                >
                    <span className="sm:hidden"><Trash2 className="w-4 h-4 text-red-400" /></span>
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

        <div className="flex justify-start px-3 sm:px-4 pt-2 pb-4 relative z-0">
          <button
            type="button"
            onClick={handleAgregarTelefono}
            disabled={!puedeAgregar}
          className={`h-10 w-full sm:w-64 px-4 border-2 border-dashed border-white/30 rounded-md text-white/60 cursor-pointer transition text-sm ${
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
          className={`bg-transparent hover:bg-white/10 cursor-pointer transition-colors ${
            hayEdicionAbierta && !guardando
              ? "border-white text-white"
              : "border-white/30 text-white/40"
          }`}
        >
          Cancelar
        </Button>

        <Button
          type="button"
          onClick={handleGuardar}
          disabled={!puedeGuardar}
          className={`font-semibold cursor-pointer transition-colors ${
            puedeGuardar
              ? "bg-white text-black border border-white hover:bg-white/90"
              : "bg-transparent border border-white/30 text-white/40 hover:bg-white/10"
          }`}
        >
          {guardando ? "Guardando..." : "Confirmar cambios"}
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
                className={`px-6 cursor-pointer ${
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
          <AlertDialogTitle className="text-lg font-bold ">
            ¿Eliminar teléfono?
          </AlertDialogTitle>

          <p className="text-sm text-gray-500">
            Esta acción no se puede deshacer. El teléfono será eliminado permanentemente.
          </p>

          <AlertDialogFooter className="flex justify-center gap-2 mt-4">
            <AlertDialogCancel
              onClick={() => setOpenDelete(false)}
              disabled={guardando}
              className="disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={guardando}
              className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 cursor-pointer"
            >
              {guardando ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}