import { Suspense, useState } from "react"; 
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SuscripcionPage() {

    {/* BASE DE DE LA INTERFAZ DE MI PLAN */}


    const id_suscripcion = 3; 
    const esPremium = id_suscripcion > 1;
  
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
                    <span className="absolute -top-0.5 left 1 bg-gray-500 text-white text-sm px-3 py-1 rounded-md font-semibold">
                    Tu Plan
                    </span>

                    <div className="mt-6 ml-5">
                        <p className="text-1Xl -popover font-bold"> Versión</p>
                        
                        <h2 className="text-4xl font-black text-gray-700 mt-3 ">
                        {esPremium ? "PLAN X" : "GRATUITA"}
                        </h2>
                    </div>
                </Card>

                {/* Card derecha de descripción */}
                <div className="w-[350px] h-[200px] bg-gray-100 rounded-[10px] p-6">
                    <h3 className="text-popover-foreground font-bold text-xl mb-4">Descripción</h3>

                </div>
            </div>

            {/* contenido inferior */}
            
                {esPremium ? (
                    <div className="-mt-6" >
                        <div className="flex gap-32">
                            <h2 className="text-1xl  text-gray-700 mt-3 ">
                                Inicio:
                            </h2>
                            <h2 className="text-1xl  text-gray-700 mt-3 ">
                                Expira:
                            </h2>
                        </div>

                        <div className="flex gap-15">
                            <h2 className="text-1xl  text-gray-700 mt-3 ">
                                ____/____/____
                            </h2>
                            <h2 className="text-1xl  text-gray-700 mt-3 ">
                                ____/____/____
                            </h2>
                        </div>

                        <div className="flex gap-6 mt-6">
                            <button className="bg-destructive text-white px-5 py-2 rounded-xl font-semibold hover:scale-105 transition">
                                Cancelar Plan
                            </button>
                     
                            <button className="bg-primary text-white px-5 py-2 rounded-xl font-semibold hover:scale-105 transition">
                                Cambiar Plan
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-16">
                        <button className="bg-primary text-white px-5 py-2 rounded-xl font-semibold hover:scale-105 transition">
                            Cambiar Plan
                        </button>
                    </div>
                )}
            
        </CardContent>
    </Card>
  );
}