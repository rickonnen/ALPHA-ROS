"use client";

import { Suspense, useEffect, useState } from "react"; 
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/app/auth/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { TriangleAlert } from "lucide-react";

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
    const [suscripcion, setSuscripcion] = useState(null);
    const [nombre_plan, setNombre_plan] = useState(null);
    const [fecha_inicio, setFecha_inicio] = useState(null);
    const [fecha_expiracion, setFecha_expiracion] = useState(null);
    const [cupos, setCupos] = useState(null);
    const [id_plan, setId_plan] = useState(null);

    const isFree = id_plan === null || id_plan === 7;

    const obtenerDatosSuscripcion = async () => {
        try {
            if (!user?.id) {
                console.warn("Usuario no autenticado");
                return;
            }
            console.log("User ID:", user?.id);
            const res = await fetch(`/api/cobros/getSuscripcion?id_usuario=${user.id}`, {
                cache: "no-store",
                method: "GET"
            });

            if (!res.ok) {
                throw new Error("Error al obtener suscripción");
            }
            const data = await res.json();

            setSuscripcion(data);
            setNombre_plan(data.nombre_plan);
            setFecha_inicio(data.fecha_inicio);
            setFecha_expiracion(data.fecha_fin);
            setCupos(data.cant_publicaciones);
            setId_plan(data.id_plan);

            console.log("Suscripción obtenida:", data);
            
        } catch (error) {
            console.error("Error:", error);
        }finally {
            setLoading(false); 
        }
    };  

    const formatearFecha = (fecha: string | null) => {
        if (!fecha) return "-";
        return new Date(fecha).toLocaleDateString();
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
            await obtenerDatosSuscripcion();
        } catch (error) {
            console.error("Error al cancelar:", error);
        }
    };


    useEffect(() => {
        if (!user?.id) return;
        obtenerDatosSuscripcion();
    }, [user?.id]);

    
    if(!user || loading) { 
        return (
            <div className="flex items-center justify-center h-110">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
    <Card className="border-none bg-transparent shadow-none text-white animate-in fade-in slide-in-from-bottom-4 duration-700">

        <CardContent className="flex flex-col mt-3">
            <CardHeader>
                <CardTitle  className="text-xl font-bold border-b border-white/20 pb-2 tracking-tight w-full">
                SUSCRIPCION ACTUAL
                </CardTitle>
            </CardHeader>
    
            {/* Contenido superior */}
            <div className="flex flex-col md:flex-row gap-8 mt-6">
          
                {/* Card izquierda */}
                <Card
                  className="relative w-[320px] h-[160px] rounded-[16px] overflow-hidden border border-slate-200/50"
                  style={{
                    background: "linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%)",
                    boxShadow: "3px 3px 10px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.5), inset 0 1px 0 rgba(255,255,255,0.4)",
                    transition: "all 0.3s ease",
                  }}>

                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: "repeating-linear-gradient(135deg, transparent, transparent 18px, rgba(148,163,184,0.04) 18px, rgba(148,163,184,0.04) 19px)"
                  }}/>

                  <div className="absolute top-0 left-0 right-0 h-[60px] pointer-events-none" style={{
                    background: "linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)"
                  }}/>

                  <span className="absolute -top-0.5 left-4 bg-gradient-to-r from-primary to-sky-800 text-white text-sm px-3 py-1 rounded-md font-semibold"
                    style={{ boxShadow: "0 2px 6px rgba(14,165,233,0.35)" }}>
                    Tu Plan
                  </span>
                  <div className="mt-4 ml-5 relative z-10">
                    
                    <div className="flex items-center gap-2">
                      <Image src="/logo-principal.svg" alt="Logo" width={30} height={30} className="rounded-lg"/>
                      <p className="text-xs font-semibold text-slate-400 tracking-widest uppercase">
                        Versión
                      </p>
                    </div>

                    {isFree ? (
                      <h2 className="text-4xl font-black text-slate-800 mt-1"
                          style={{ fontFamily: "'Bebas Neue', sans-serif", textShadow: "0 1px 2px rgba(0,0,0,0.08)" }}>
                        GRATUITA
                      </h2>
                    ) : (
                      <h2 className="text-4xl font-black relative text-slate-800 overflow-hidden mt-1"
                          style={{ fontFamily: "'Bebas Neue', sans-serif", textShadow: "0 1px 2px rgba(0,0,0,0.08)" }}>
                        {nombre_plan}
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/24 to-transparent skew-x-[-20deg]"
                          style={{ animation: "shineMove 3.1s ease-in-out infinite" }}/>
                        <style jsx>{`
                          @keyframes shineMove {
                            0% { transform: translateX(-120%) skewX(-20deg); }
                            100% { transform: translateX(120%) skewX(-20deg); }
                          }
                        `}</style>
                     </h2>
                    )}
                  </div>
                </Card>

                {/* Card derecha de descripción */}
                <div className="w-[320px] md:w-[350px] h-[200px] md:h-[200px] bg-gradient-to-br from-gray-100 to-gray-50 rounded-[10px] p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200/50">
                    <h2 className="text-gray-800 font-bold text-xl mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-blue-400 rounded"></span>
                        Descripción
                    </h2>
                    <p className="text-1xl text-gray-700 mt-3 leading-relaxed">
                        {!isFree
                        ? `El ${nombre_plan} te permite realizar ${cupos} publicaciones`
                        : "El plan gratuito te permite realizar 2 publicaciones de prueba"}
                    </p>
                </div>
            </div>

            {/* contenido inferior */}
            
                {!isFree ? (
                    <div className="mt-2" >
                        <div className="flex flex-row gap-21">
                            <div>
                                <p className="text-1xl font-semibold text-gray-400 mb-1">
                                    Inicio:
                                </p>
                                <p className="text-1xl font-bold text-white">
                                    {formatearFecha(fecha_inicio)}
                                </p>
                            </div>
                            <div>
                                <p className="text-1xl font-semibold text-gray-400 mb-1">
                                    Expira:
                                </p>
                                <p className="text-1xl font-bold text-white">
                                    {formatearFecha(fecha_expiracion)}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button className="bg-destructive text-white px-5 py-2 rounded-xl font-semibold shadow-sm hover:brightness-110">
                                  Cancelar Plan
                                </button>
                              </AlertDialogTrigger>

                              <AlertDialogContent className="max-w-lg py-8 px-2">
                                <AlertDialogHeader className="text-center items-center">
                                <TriangleAlert className="text-destructive w-18 h-18 mb-2 mx-auto" />
                                  <AlertDialogTitle className="text-xl text-center">
                                    ¿Seguro que deseas cancelar tu plan?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-center text-sm mt-4">
                                    Al cancelar tu plan, dejarás de acceder a sus beneficios y tu cuenta
                                    pasará automáticamente al plan gratuito.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>

                                <div className="flex justify-center mt-3 gap-30">
                                  <AlertDialogCancel className="bg-destructive text-white hover:bg-destructive/90 hover:text-white border-none px-6">
                                    Salir     
                                  </AlertDialogCancel>
                                  <AlertDialogAction onClick={cancelarPlan}>
                                    Confirmar
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>

                            <Link href="/cobros/planes">
                                <button className="bg-secondary text-secondary-foreground px-5 py-2 rounded-xl font-semibold shadow-md border border-black/10 hover:brightness-110 transition">
                                    Cambiar Plan
                                </button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="mt-16">
                        <Link href="/cobros/planes">
                            <button className="bg-secondary text-secondary-foreground px-5 py-2 rounded-xl font-semibold shadow-md border border-black/10 hover:brightness-110 transition">
                                Explorar Planes
                            </button>
                        </Link>
                    </div>
                )}
            
        </CardContent>
    </Card>
  );
}