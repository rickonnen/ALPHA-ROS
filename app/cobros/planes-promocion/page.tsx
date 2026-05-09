//import { db } from "@/lib/db"; // Asegúrate de que esta ruta a tu prisma client sea la correcta
import { prisma as db } from "../../../lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// 1. Cambiamos la definición para que acepte una Promesa (Next.js 15+)
export default async function PlanesPromocionPage(props: {
  searchParams: Promise<{ pubId: string }>
}) {
  // 2. "Esperamos" a que los parámetros se resuelvan
  const searchParams = await props.searchParams;
  
  // 3. Ahora sí podemos usar .pubId sin que falle
  const idPublicacion = searchParams.pubId
  // 3. CONSULTA A LA BD: Traemos solo los planes donde tipo es "false" (Promociones)
  const planesBD = await db.planPublicacion.findMany({
    where: { 
      tipo: false,
      activo: true 
    },
    orderBy: { cant_publicaciones: 'asc' } // Los ordenamos por días (3, 7, 14, 30)
  });

  // Función auxiliar para asignar colores según el nombre (para mantener el diseño)
  const getColorPorNombre = (nombre: string) => {
    if (nombre.includes("EXPRESS")) return "bg-slate-600";
    if (nombre.includes("BRONCE")) return "bg-[#bf735c]";
    if (nombre.includes("PLATA")) return "bg-gray-400";
    if (nombre.includes("ORO")) return "bg-[#1e3a5f]";
    return "bg-slate-800";
  };

  return (
    <div className="min-h-screen bg-[#f4f1ea] p-8 font-sans text-[#1e3a5f]">
      <div className="max-w-6xl mx-auto">
        
        {/* Navegación - Criterio 1 */}
        <Button variant="outline" asChild className="mb-6 border-[#1e3a5f]">
          <Link href="/perfil/publicacion">
            <ArrowLeft className="mr-2 h-4 w-4" /> VOLVER
          </Link>
        </Button>

        <h1 className="text-4xl font-black text-center mb-10 uppercase italic">
          Planes de Promoción
        </h1>

        {/* Grilla Dinámica - Criterio 11 (Responsivo) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {planesBD.map((plan) => (
            <div key={plan.id_plan} className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col hover:shadow-2xl transition-shadow">
              
              {/* Encabezado dinámico con el nombre de la BD */}
              <div className={`${getColorPorNombre(plan.nombre_plan ?? "")} text-white p-4 text-center font-bold`}>
                {plan.nombre_plan}
              </div>

              <div className="p-8 flex-grow text-center">
                <p className="text-5xl font-black mb-2">${Number(plan.precio_plan)}</p>
                <p className="text-[#bf735c] font-bold uppercase text-xs tracking-widest">
                  {plan.cant_publicaciones} DÍAS DE DURACIÓN
                </p>
                
                <ul className="mt-6 text-sm text-left space-y-2 border-t pt-4 text-gray-600">
                  <li>• Mayor visibilidad en lista</li>
                  <li>• Prioridad en filtros</li>
                  <li>• Etiqueta destacada</li>
                </ul>
              </div>

              <div className="p-6">
                {/* REDIRECCIÓN FINAL - Criterio 6 y 8 */}
                {/* Enviamos el id_plan y el pubId a la siguiente pantalla de cobros */}
                <Button asChild className="w-full bg-[#1e3a5f] hover:bg-[#2a5288] py-6 text-lg font-bold">
                <Link href={`/cobros/sector-pagos?planId=${plan.id_plan}&pubId=${idPublicacion}`}>
                    CONTINUAR
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}