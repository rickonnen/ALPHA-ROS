"use client";

import { Suspense, useEffect, useState } from "react"; 
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/app/auth/AuthContext";
import Link from "next/link";

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


    const { user } = useAuth();
    const [suscripcion, setSuscripcion] = useState(null);
    const [nombre_plan, setNombre_plan] = useState(null);
    const [fecha_inicio, setFecha_inicio] = useState(null);
    const [fecha_expiracion, setFecha_expiracion] = useState(null);
    const [cupos, setCupos] = useState(null);

    const [mostrarModal, setMostrarModal] = useState(false);

    const obtenerDatosSuscripcion = async () => {
        try {
            if (!user?.id) {
                console.warn("Usuario no autenticado");
                return;
            }
            console.log("User ID:", user?.id);
            const res = await fetch(`/api/cobros/getSuscripcion?id_usuario=${user.id}`, {
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

            console.log("Suscripción obtenida:", data);
            
        } catch (error) {
            console.error("Error:", error);
        }
    };  

    const formatearFecha = (fecha: string | null) => {
        if (!fecha) return "-";
        return new Date(fecha).toLocaleDateString();
    };

    {/* const cancelarPlan = async () => {
        try {
            const res = await fetch("/api/cobros/cancelar", {
            method: "POST",
            });

            if (!res.ok) {
            throw new Error("Error al cancelar");
            }
            //  volver a cargar datos
            await obtenerDatosSuscripcion();

        } catch (error) {
            console.error("Error al cancelar:", error);
        }
    };*/}


    useEffect(() => {
        if (user?.id) {
            obtenerDatosSuscripcion();
        }
    }, [user?.id]);

    
    if(!user) { 
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D3547]"></div>
            </div>
        );
    }

    return (
    <Card className="border-none bg-transparent shadow-none text-white animate-in fade-in slide-in-from-bottom-4 duration-700">

        <CardContent className="flex flex-col">
            <CardHeader>
                <CardTitle  className="text-xl font-bold border-b border-white/20 pb-2 tracking-tight w-full">
                suscripción
                </CardTitle>
            </CardHeader>
    
            {/* Contenido superior */}
            <div className="flex gap-8">
          
                {/* Card izquierda */}
                <Card className="relative w-[320px] h-[160px] bg-white rounded-[10px] shadow-md P-20">
                    <span className="absolute -top-0.5 left  bg-gray-500 text-white text-sm px-3 py-1 rounded-md font-semibold">
                    Tu Plan
                    </span>

                    <div className="mt-6 ml-5">
                        <p className="text-1Xl -popover font-bold"> Versión</p>
                        {!nombre_plan ? (
                            <h2 className="text-4xl font-black text-gray-700 mt-3 ">
                                GRATUITA
                            </h2> 
                            ) : ( 
                            <h2 className="text-4xl font-black text-gray-700 mt-1 "> 
                                {nombre_plan}
                            </h2>) }
                    </div>
                </Card>

                {/* Card derecha de descripción */}
                <div className="w-[350px] h-[200px] bg-gray-100 rounded-[10px] p-6">
                    <h2 className="text-popover-foreground font-bold text-xl mb-4">Descripción</h2>
                    <h2 className="text-1xl  text-gray-700 mt-3 ">
                        El {nombre_plan ? nombre_plan : "plan gratuito"} te permite realizar {cupos ? `más de ${cupos}` : "hasta 2"} publicaciones.
                    </h2>
                </div>
            </div>

            {/* contenido inferior */}
            
                {fecha_inicio && fecha_expiracion? (
                    <div className="-mt-6" >
                        <div className="flex gap-32">
                            <h2 className="text-1xl  text-gray-700 mt-3 ">
                                Inicio:
                            </h2>
                            <h2 className="text-1xl  text-gray-700 mt-3 ">
                                Expira:
                            </h2>
                        </div>

                        <div className="flex gap-24" >
                            <h2 className="text-1xl  text-gray-700 mt-3 ">
                                {formatearFecha(fecha_inicio)}
                            </h2>
                            <h2 className="text-1xl  text-gray-700 mt-3 ">
                                {formatearFecha(fecha_expiracion)}
                            </h2>
                        </div>

                        <div className="flex gap-6 mt-6">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button className="bg-destructive text-white px-5 py-2 rounded-xl font-semibold hover:scale-105 transition">
                                  Cancelar Plan
                                </button>
                              </AlertDialogTrigger>

                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Seguro que deseas cancelar tu plan?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Si cancelas tu plan, mantendras los beneficios hasta la fecha de vencimiento. Luego, tu cuenta cambiara automáticamente al plan gratuito.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>

                                <div className="flex justify-end gap-4 mt-4">
                                  <AlertDialogCancel>
                                    Salir
                                  </AlertDialogCancel>

                                    {/* onClick={cancelarPlan}*/}
                                  <AlertDialogAction    >
                                    Confirmar
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>

                            <Link href="/cobros/planes">
                                <button className="bg-primary text-white px-5 py-2 rounded-xl font-semibold hover:scale-105 transition">
                                    Explorar Planes
                                </button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="mt-16">
                        <Link href="/cobros/planes">
                            <button className="bg-primary text-white px-5 py-2 rounded-xl font-semibold hover:scale-105 transition">
                                Explorar Planes
                            </button>
                        </Link>
                    </div>
                )}
            
        </CardContent>
    </Card>
  );
}       