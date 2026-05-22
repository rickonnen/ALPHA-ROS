"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { RefreshCw } from "lucide-react";

interface ObjUsuarioDesactivado {
  id_usuario: string;
  email: string | null;
  estado: number;
  fecha_desactivacion: string | null;
}

const CLS_FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function ReactivacionPerfilesPage() {
  const [arrUsuarios, setArrUsuarios] = useState<ObjUsuarioDesactivado[]>([]);
  const [bolIsLoading, setBolIsLoading] = useState(true);
  const [bolIsActivating, setBolIsActivating] = useState<string | null>(null);
  const [intCurrentPage, setIntCurrentPage] = useState(1);
  const [intTotalPages, setIntTotalPages] = useState(1);
  const [strError, setStrError] = useState<string | null>(null);
  const [strSuccessMsg, setStrSuccessMsg] = useState<string | null>(null);

  const fnFetchUsuarios = useCallback(async (intPage: number) => {
    setBolIsLoading(true);
    setStrError(null);
    try {
      const objRes = await fetch(
        `/api/admin/reactivacionPerfiles?page=${intPage}&limit=10`
      );
      if (!objRes.ok) throw new Error("Error al cargar los datos.");
      const objData = await objRes.json();
      setArrUsuarios(objData.data);
      setIntTotalPages(objData.totalPages);
      setIntCurrentPage(objData.page);
    } catch {
      setStrError("No se pudo cargar la lista de usuarios desactivados.");
    } finally {
      setBolIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fnFetchUsuarios(1);
  }, [fnFetchUsuarios]);

  const fnActivarPerfil = async (strIdUsuario: string) => {
    setBolIsActivating(strIdUsuario);
    setStrError(null);
    setStrSuccessMsg(null);
    try {
      const objRes = await fetch("/api/admin/reactivacionPerfiles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: strIdUsuario }),
      });
      if (!objRes.ok) throw new Error("Error al activar el perfil.");
      setStrSuccessMsg("Perfil reactivado correctamente.");
      // Recargar la misma página eliminando al usuario activado de la lista
      setArrUsuarios((prev) =>
        prev.filter((u) => u.id_usuario !== strIdUsuario)
      );
    } catch {
      setStrError("Ocurrió un error al intentar reactivar el perfil.");
    } finally {
      setBolIsActivating(null);
    }
  };

  const fnFormatFecha = (strFecha: string | null) => {
    if (!strFecha) return "—";
    return new Date(strFecha).toLocaleString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <section className="w-full px-4 sm:px-8 lg:px-16 py-8 min-h-screen flex flex-col gap-6 bg-background animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Título */}
      <div className="w-full text-center mb-6">
        <h1 className="text-main-title font-black text-foreground uppercase tracking-wide">
          Reactivacion de Perfiles
        </h1>
      </div>

      {/* Barra superior: descripción + botón actualizar */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center w-full mb-2">
        <p className="text-body-info font-medium text-muted-foreground">
          Usuarios con perfil desactivado. Usa el botón{" "}
          <span className="font-bold text-foreground">Activar</span> para
          restablecer el acceso.
        </p>
        <button
          onClick={() => fnFetchUsuarios(intCurrentPage)}
          disabled={bolIsLoading}
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-primary text-xs font-bold uppercase text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed ${CLS_FOCUS}`}
        >
          <RefreshCw
            className={`h-4 w-4 ${bolIsLoading ? "animate-spin" : ""}`}
          />
          Actualizar
        </button>
      </div>

      {/* Mensajes de feedback */}
      {strSuccessMsg && (
        <div className="rounded-md border border-green-500 bg-green-50 px-4 py-2 text-sm font-medium text-green-800">
          {strSuccessMsg}
        </div>
      )}
      {strError && (
        <div className="rounded-md border border-red-400 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
          {strError}
        </div>
      )}

      {/* Tabla */}
      <div className="w-full overflow-x-auto rounded-xl border border-card-border shadow-sm">
        <table className="w-full text-sm text-foreground">
          <thead>
            <tr className="border-b border-card-border bg-secondary-fund">
              <th className="px-6 py-4 text-center font-bold uppercase tracking-wider text-muted-foreground">
                Email del Usuario
              </th>
              <th className="px-6 py-4 text-center font-bold uppercase tracking-wider text-muted-foreground">
                Estado
              </th>
              <th className="px-6 py-4 text-center font-bold uppercase tracking-wider text-muted-foreground">
                Fecha de Desactivación
              </th>
              <th className="px-6 py-4 text-center font-bold uppercase tracking-wider text-muted-foreground">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {bolIsLoading ? (
              Array.from({ length: 5 }).map((_, intIdx) => (
                <tr
                  key={intIdx}
                  className="border-b border-card-border animate-pulse"
                >
                  {Array.from({ length: 4 }).map((__, intCol) => (
                    <td key={intCol} className="px-6 py-4">
                      <div className="h-4 rounded bg-secondary-fund" />
                    </td>
                  ))}
                </tr>
              ))
            ) : arrUsuarios.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-muted-foreground"
                >
                  No hay perfiles desactivados.
                </td>
              </tr>
            ) : (
              arrUsuarios.map((objUser) => (
                <tr
                  key={objUser.id_usuario}
                  className="border-b border-card-border transition-colors hover:bg-secondary-fund/40"
                >
                  <td className="px-6 py-4 text-center">
                    {objUser.email ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold tabular-nums">
                    {objUser.estado}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {fnFormatFecha(objUser.fecha_desactivacion)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => fnActivarPerfil(objUser.id_usuario)}
                        disabled={bolIsActivating === objUser.id_usuario}
                        className={`inline-flex items-center gap-1 rounded-md bg-primary px-4 py-1.5 text-xs font-bold uppercase text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed ${CLS_FOCUS}`}
                      >
                        {bolIsActivating === objUser.id_usuario ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : null}
                        Activar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {!bolIsLoading && intTotalPages > 0 && (
        <div className="flex w-full items-center justify-between pt-2 text-sm text-muted-foreground">
          <span>
            Pagina {intCurrentPage} de {intTotalPages || 1}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fnFetchUsuarios(intCurrentPage - 1)}
              disabled={intCurrentPage <= 1 || bolIsLoading}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-card-border bg-card text-xs font-bold uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary-fund transition-colors ${CLS_FOCUS}`}
            >
              <Image
                src="/leftArrow.svg"
                alt="Anterior"
                width={14}
                height={14}
                className="h-3.5 w-3.5 object-contain"
              />
              Anterior
            </button>
            <button
              onClick={() => fnFetchUsuarios(intCurrentPage + 1)}
              disabled={intCurrentPage >= intTotalPages || bolIsLoading}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-card-border bg-card text-xs font-bold uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary-fund transition-colors ${CLS_FOCUS}`}
            >
              Siguiente
              <Image
                src="/rightArrow.svg"
                alt="Siguiente"
                width={14}
                height={14}
                className="h-3.5 w-3.5 object-contain"
              />
            </button>
          </div>
        </div>
      )}

      {/* Botón Volver */}
      <div className="w-full flex mt-4">
        <Link
          href="/admin"
          className={`flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded font-bold shadow-sm hover:bg-primary/90 transition-colors ${CLS_FOCUS}`}
        >
          <Image
            src="/leftArrow.svg"
            alt="Flecha izquierda"
            width={16}
            height={16}
            className="w-4 h-4 object-contain brightness-0 invert"
          />
          VOLVER
        </Link>
      </div>
    </section>
  );
}