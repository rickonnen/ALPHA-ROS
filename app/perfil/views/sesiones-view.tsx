"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Monitor, Smartphone, Laptop, X, Trash2, Loader2, Wifi } from "lucide-react";
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

interface SesionDispositivo {
  id_sesion_dispositivo: string;
  id_usuario: string;
  ip: string;
  ciudad?: string | null;
  pais?: string | null;
  dispositivo: string;         // "desktop" | "mobile" | "tablet"
  navegador?: string | null;
  app_name?: string | null;
  es_actual: boolean;
  ultimo_acceso: string;       // ISO string
  creado_en: string;
}

interface SesionesViewProps {
  id_usuario: string;
  onBack: () => void;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function tiempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "Activa ahora";
  if (min < 60) return `Hace ${min} min`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `Hace ${hrs} hora${hrs > 1 ? "s" : ""}`;
  const dias = Math.floor(hrs / 24);
  return `Hace ${dias} día${dias > 1 ? "s" : ""}`;
}

function IconoDispositivo({ tipo, esActual }: { tipo: string; esActual: boolean }) {
  const cls = `w-7 h-7 ${esActual ? "text-[#4EA8DE]" : "text-white/50"}`;
  if (tipo === "mobile") return <Smartphone className={cls} />;
  if (tipo === "desktop") return <Monitor className={cls} />;
  return <Laptop className={cls} />;
}

// ─── componente principal ────────────────────────────────────────────────────

export default function SesionesView({ id_usuario, onBack }: SesionesViewProps) {
  const [sesiones, setSesiones] = useState<SesionDispositivo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // modal individual
  const [sesionAEliminar, setSesionAEliminar] = useState<SesionDispositivo | null>(null);
  const [cerrando, setCerrando] = useState(false);

  // modal cerrar todas
  const [confirmarTodas, setConfirmarTodas] = useState(false);
  const [cerrandoTodas, setCerrandoTodas] = useState(false);

  // feedback
  const [resultado, setResultado] = useState<{ ok: boolean; mensaje: string } | null>(null);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const cargarSesiones = async () => {
    try {
      setCargando(true);
      setError(null);
      const res = await fetch(`/api/perfil/sesiones?id_usuario=${id_usuario}`);
      if (!res.ok) throw new Error("Error al cargar sesiones");
      const json = await res.json();
      setSesiones(json.data ?? []);
    } catch {
      setError("No se pudieron cargar las sesiones activas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSesiones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_usuario]);

  // ── cerrar una sesión ──────────────────────────────────────────────────────
  const handleConfirmarCierre = async () => {
    if (!sesionAEliminar || cerrando) return;
    setCerrando(true);
    try {
      const res = await fetch("/api/perfil/sesiones/cerrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario,
          id_sesion_dispositivo: sesionAEliminar.id_sesion_dispositivo,
        }),
      });
      if (!res.ok) throw new Error();
      setSesiones((prev) =>
        prev.filter((s) => s.id_sesion_dispositivo !== sesionAEliminar.id_sesion_dispositivo)
      );
      setResultado({ ok: true, mensaje: "Sesión cerrada correctamente." });
    } catch {
      setResultado({ ok: false, mensaje: "No se pudo cerrar la sesión." });
    } finally {
      setCerrando(false);
      setSesionAEliminar(null);
    }
  };

  // ── cerrar todas ───────────────────────────────────────────────────────────
  const handleCerrarTodas = async () => {
    if (cerrandoTodas) return;
    setCerrandoTodas(true);
    try {
      const res = await fetch("/api/perfil/sesiones/cerrar-todas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario }),
      });
      if (!res.ok) throw new Error();
      // dejamos solo la sesión actual
      setSesiones((prev) => prev.filter((s) => s.es_actual));
      setResultado({ ok: true, mensaje: "Todas las demás sesiones fueron cerradas." });
    } catch {
      setResultado({ ok: false, mensaje: "No se pudieron cerrar las sesiones." });
    } finally {
      setCerrandoTodas(false);
      setConfirmarTodas(false);
    }
  };

  const sesionesOtras = sesiones.filter((s) => !s.es_actual);
  const sesionActual = sesiones.find((s) => s.es_actual);

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 text-white">
      {/* ── Cabecera ── */}
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
        <Laptop className="h-9 w-9 text-white/70" />
        <div>
          <h2 className="text-xl font-bold">Gestión de sesiones</h2>
          <p className="text-sm text-white/70">
            Controla los dispositivos donde tienes una sesión activa en tu cuenta
          </p>
        </div>
      </div>

      {/* ── Estado carga / error ── */}
      {cargando && (
        <div className="flex items-center justify-center py-12 gap-3 text-white/60">
          <Loader2 className="animate-spin h-6 w-6" />
          <span className="text-sm">Cargando sesiones...</span>
        </div>
      )}

      {!cargando && error && (
        <div className="text-center py-10 text-red-400 text-sm">{error}</div>
      )}

      {/* ── Lista de sesiones ── */}
      {!cargando && !error && (
        <Card className="bg-white/10 border border-white/20 backdrop-blur-md overflow-visible">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Wifi className="w-4 h-4 text-white/60" />
              Sesiones activas
            </CardTitle>
          </CardHeader>

          <CardContent className="px-3 sm:px-6 pb-6 space-y-0 divide-y divide-white/10">
            {/* Sesión actual */}
            {sesionActual && (
              <div className="py-4 flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#4EA8DE]/20 flex items-center justify-center">
                  <IconoDispositivo tipo={sesionActual.dispositivo} esActual />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-sm text-white">
                      {sesionActual.ciudad
                        ? `${sesionActual.ciudad}, ${sesionActual.pais ?? ""}`
                        : sesionActual.ip}{" "}
                      <span className="font-normal text-white/50">(Este dispositivo)</span>
                    </p>
                    <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Actual
                    </span>
                  </div>
                  <p className="text-xs text-[#4EA8DE] mt-0.5">
                    {sesionActual.navegador ?? sesionActual.app_name ?? "Navegador desconocido"}{" "}
                    •{" "}
                    <span className="text-white/50">
                      {tiempoRelativo(sesionActual.ultimo_acceso)}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Otras sesiones */}
            {sesionesOtras.length === 0 && !sesionActual && (
              <div className="py-8 text-center text-white/40 text-sm">
                No hay sesiones activas registradas.
              </div>
            )}

            {sesionesOtras.map((s) => (
              <div key={s.id_sesion_dispositivo} className="py-4 flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <IconoDispositivo tipo={s.dispositivo} esActual={false} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white">
                    {s.ciudad ? `${s.ciudad}, ${s.pais ?? ""}` : s.ip}
                  </p>
                  <p className="text-xs text-white/50 mt-0.5">
                    {s.app_name ?? s.navegador ?? "App desconocida"} •{" "}
                    {tiempoRelativo(s.ultimo_acceso)}
                  </p>
                </div>
                {/* Botón eliminar — ícono basurero rojo */}
                <button
                  onClick={() => setSesionAEliminar(s)}
                  title="Cerrar sesión"
                  className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Botón cerrar todas ── */}
      {!cargando && sesionesOtras.length > 0 && (
        <div className="flex justify-start">
          <Button
            type="button"
            variant="outline"
            onClick={() => setConfirmarTodas(true)}
            className="border-red-500 text-red-400 bg-transparent hover:bg-red-500/20 cursor-pointer transition-colors"
          >
            Cerrar todas las demás
          </Button>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          MODAL: Confirmar cierre de sesión individual
      ══════════════════════════════════════════════ */}
      <AlertDialog open={!!sesionAEliminar}>
        <AlertDialogContent className="text-center bg-white border border-gray-100 text-black max-w-xs mx-auto rounded-2xl">
          {/* Ícono */}
          <div className="flex justify-center mb-1">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              {/* SVG laptop/phone según tipo */}
              {sesionAEliminar?.dispositivo === "mobile" ? (
                <Smartphone className="w-8 h-8 text-red-400" />
              ) : (
                <Laptop className="w-8 h-8 text-red-400" />
              )}
            </div>
          </div>

          <AlertDialogTitle className="text-lg font-bold tracking-tight">
            ¿Cerrar sesión?
          </AlertDialogTitle>

          {sesionAEliminar && (
            <p className="text-sm text-gray-500 mt-1">
              ¿Estás seguro de cerrar sesión en el dispositivo{" "}
              <span className="text-red-500 font-semibold">
                {sesionAEliminar.ciudad
                  ? `${sesionAEliminar.ciudad}, ${sesionAEliminar.pais ?? ""}`
                  : sesionAEliminar.ip}{" "}
                • {tiempoRelativo(sesionAEliminar.ultimo_acceso)}
              </span>
            </p>
          )}

          <AlertDialogFooter className="mt-5 flex gap-3">
            <AlertDialogCancel
              onClick={() => setSesionAEliminar(null)}
              disabled={cerrando}
              className="flex-1 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmarCierre}
              disabled={cerrando}
              className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-md shadow-red-100 disabled:opacity-50 cursor-pointer"
            >
              {cerrando ? (
                <span className="flex items-center gap-1 justify-center">
                  <Loader2 className="animate-spin w-4 h-4" /> Cerrando...
                </span>
              ) : (
                "Sí, cerrar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ══════════════════════════════════════════════
          MODAL: Confirmar cerrar TODAS
      ══════════════════════════════════════════════ */}
      <AlertDialog open={confirmarTodas}>
        <AlertDialogContent className="text-center bg-white border border-gray-100 text-black max-w-xs mx-auto rounded-2xl">
          <div className="flex justify-center mb-1">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <X className="w-8 h-8 text-red-400" />
            </div>
          </div>

          <AlertDialogTitle className="text-lg font-bold tracking-tight">
            ¿Cerrar todas las sesiones?
          </AlertDialogTitle>

          <p className="text-sm text-gray-500 mt-1">
            Se cerrarán todas las sesiones activas excepto la actual. Los dispositivos deberán
            volver a iniciar sesión.
          </p>

          <AlertDialogFooter className="mt-5 flex gap-3">
            <AlertDialogCancel
              onClick={() => setConfirmarTodas(false)}
              disabled={cerrandoTodas}
              className="flex-1 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCerrarTodas}
              disabled={cerrandoTodas}
              className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-md shadow-red-100 disabled:opacity-50 cursor-pointer"
            >
              {cerrandoTodas ? (
                <span className="flex items-center gap-1 justify-center">
                  <Loader2 className="animate-spin w-4 h-4" /> Cerrando...
                </span>
              ) : (
                "Sí, cerrar todas"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ══════════════════════════════════════════════
          MODAL: Feedback (éxito / error)
      ══════════════════════════════════════════════ */}
      <AlertDialog open={!!resultado}>
        <AlertDialogContent className="text-center bg-white border border-gray-100 text-black max-w-xs mx-auto rounded-2xl">
          <div className="flex justify-center mb-2">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                resultado?.ok ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <span className="text-3xl">{resultado?.ok ? "✓" : "✕"}</span>
            </div>
          </div>
          <AlertDialogTitle className="text-lg font-bold">
            {resultado?.ok ? "¡Listo!" : "Ocurrió un error"}
          </AlertDialogTitle>
          <p className="text-sm text-gray-500 mt-1">{resultado?.mensaje}</p>
          <AlertDialogFooter className="mt-4">
            <div className="w-full flex justify-center">
              <AlertDialogAction
                onClick={() => setResultado(null)}
                className={`px-8 rounded-xl cursor-pointer ${
                  resultado?.ok
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
    </div>
  );
}
