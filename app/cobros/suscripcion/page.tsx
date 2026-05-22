"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/app/auth/AuthContext";
import Link from "next/link";
import {
  TriangleAlert,
  Calendar as CalendarIcon,
  Info,
  Crown,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SuscripcionPage() {
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [nombre_plan, setNombre_plan] = useState(null);
  const [fecha_inicio, setFecha_inicio] = useState(null);
  const [fecha_expiracion, setFecha_expiracion] = useState(null);
  const [cupos, setCupos] = useState(null);
  const [id_plan, setId_plan] = useState(null);

  const isFree = id_plan === null || id_plan === 7;

  useEffect(() => {
    const obtenerDatosSuscripcion = async () => {
      try {
        if (!user?.id) {
          console.warn("Usuario no autenticado");
          return;
        }

        const res = await fetch(
          `/api/cobros/getSuscripcion?id_usuario=${user.id}`,
          {
            cache: "no-store",
            method: "GET",
          },
        );

        if (!res.ok) {
          throw new Error("Error al obtener suscripción");
        }

        const data = await res.json();

        setNombre_plan(data.nombre_plan);
        setFecha_inicio(data.fecha_inicio);
        setFecha_expiracion(data.fecha_fin);
        setCupos(data.cant_publicaciones);
        setId_plan(data.id_plan);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      obtenerDatosSuscripcion();
    }
  }, [user?.id]);

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "-";

    const date = new Date(fecha);

    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const anio = String(date.getFullYear()).slice(-2);

    return `${dia}/${mes}/${anio}`;
  };

  const cancelarPlan = async () => {
    try {
      if (!user?.id) {
        console.warn("Usuario no autenticado al cancelar");
        return;
      }

      const res = await fetch("/api/cobros/cancelar-suscripcion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: user.id }),
      });

      if (!res.ok) {
        throw new Error("Error al cancelar");
      }

      const getRes = await fetch(
        `/api/cobros/getSuscripcion?id_usuario=${user.id}`,
        {
          cache: "no-store",
          method: "GET",
        },
      );

      if (!getRes.ok) {
        throw new Error("Error al obtener suscripción actualizada");
      }

      const data = await getRes.json();

      setNombre_plan(data.nombre_plan);
      setFecha_inicio(data.fecha_inicio);
      setFecha_expiracion(data.fecha_fin);
      setCupos(data.cant_publicaciones);
      setId_plan(data.id_plan);
    } catch (error) {
      console.error("Error al cancelar:", error);
    }
  };

  if (!user || loading) {
    return (
      <Card className="border-none bg-transparent shadow-none text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
        <CardHeader>
          <CardTitle className="text-xl font-bold border-b border-white/20 pb-2 tracking-tight w-full">
            SUSCRIPCIÓN ACTUAL
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-5">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            <div className="flex-1 h-140px rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
            <div className="flex-1 h-140px rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
            <div className="w-full lg:w-fit min-w-220px h-140px rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
          </div>

          <div className="mt-5 w-44 h-11 rounded-xl bg-white/5 animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none bg-transparent shadow-none text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold border-b border-white/20 pb-2 tracking-tight w-full">
          SUSCRIPCIÓN ACTUAL
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-5 pb-4 flex flex-col h-full">
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <div className="flex-1 w-full relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 hover:bg-white/10 transition-all duration-300">
            <div className="absolute top-4 right-4">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                  isFree
                    ? "bg-white/10 text-white/70"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {isFree ? "Gratis" : "Activo"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-white/60 mb-4">
              <span className="text-xs uppercase tracking-[0.2em]">
                Plan actual
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-black tracking-tight text-white">
                {isFree ? "GRATUITA" : nombre_plan}
              </h2>

              <p className="text-sm text-white/60">
                {isFree
                  ? "Acceso limitado a funciones básicas."
                  : "Tu suscripción está activa actualmente."}
              </p>
            </div>
          </div>

          <div className="flex-1 w-full rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-2 text-white/60 mb-4">
              <Info className="w-4 h-4 text-secondary" />
              <span className="text-xs uppercase tracking-[0.2em]">
                Beneficios
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">
                  Publicaciones
                </span>

                <span className="text-lg font-bold text-white">
                  {isFree ? "2" : cupos}
                </span>
              </div>

              <div className="w-full h-px bg-white/10" />

              <p className="text-sm leading-relaxed text-white/70">
                {!isFree
                  ? `El ${nombre_plan} permite mantener ${cupos} publicaciones activas simultáneamente.`
                  : "El plan gratuito permite realizar hasta 2 publicaciones limitadas."}
              </p>
            </div>
          </div>

          <div className="w-full lg:w-fit min-w-220px rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-2 text-white/60 mb-4">
              <CalendarIcon className="w-4 h-4 text-secondary" />
              <span className="text-xs uppercase tracking-[0.2em]">
                Vigencia
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/40 mb-1">
                  Inicio
                </p>

                <p className="text-base font-semibold text-white">
                  {isFree ? "-" : formatearFecha(fecha_inicio)}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-white/40 mb-1">
                  Expira
                </p>

                <p className="text-base font-semibold text-white">
                  {isFree ? "-" : formatearFecha(fecha_expiracion)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-auto pt-5">
          <Link href="/cobros/planes">
            <button className="bg-secondary text-secondary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-secondary/90 transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-secondary/20">
              {isFree ? "Explorar planes" : "Cambiar plan"}
            </button>
          </Link>

          {!isFree && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200">
                  Cancelar plan
                </button>
              </AlertDialogTrigger>

              <AlertDialogContent className="bg-background border-border max-w-md py-8 px-6 rounded-xl flex flex-col items-center">
                <AlertDialogHeader className="flex flex-col items-center text-center space-y-3 w-full">
                  <div className="bg-destructive/10 p-3 rounded-full flex items-center justify-center mx-auto">
                    <TriangleAlert className="text-destructive w-8 h-8" />
                  </div>

                  <AlertDialogTitle className="text-xl text-primary font-bold text-center w-full">
                    ¿Seguro que deseas cancelar?
                  </AlertDialogTitle>

                  <AlertDialogDescription className="text-sm text-muted-foreground text-center w-full">
                    Al cancelar tu plan, dejarás de acceder a sus beneficios y
                    tu cuenta pasará automáticamente al plan gratuito.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="flex justify-center gap-3 mt-6 w-full">
                  <AlertDialogCancel className="bg-background border border-border text-foreground hover:bg-muted px-6 h-10 rounded-md">
                    Salir
                  </AlertDialogCancel>

                  <AlertDialogAction
                    onClick={cancelarPlan}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-6 rounded-md border-none"
                  >
                    Confirmar cancelación
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}