import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PagoCliente from "@/features/cobros/sectorPago/pagoCliente";

interface Props {
  searchParams: Promise<{ planId?: string; modalidad?: string; type?: string }>;
}

export default async function PaginaSectorPagos({ searchParams }: Props) {
  const { planId, modalidad, type } = await searchParams;

  if (!planId) return <div className="p-10 text-center">Falta el ID del servicio.</div>;

  // en un futuro cambiar los calores aqui
  const plan = await prisma.planPublicacion.findUnique({
    where: { id_plan: Number(planId) },
  });

  if (!plan) notFound();

  let precioFinal = Number(plan.precio_plan);
  let textoModalidad = "mensual";
  let tiempoAcceso = "30 días";

  if (modalidad === "anual") {
    precioFinal = (precioFinal * 12) * 0.90; // 10% de descuento 
    precioFinal = Math.round(precioFinal * 100) / 100;
    textoModalidad = "anual";
    tiempoAcceso = "12 meses";
  }

  const datosParaPago = {
    titulo: plan.nombre_plan ?? "Plan de Publicación", 
    descripcion: `Estás adquiriendo una suscripción ${textoModalidad}. Acceso completo a todas las funciones por un periodo de ${tiempoAcceso}.`,
    detalleItems: [
      `Publicar ${plan.cant_publicaciones} publicaciones`,
    ],
    precio: precioFinal,
    idReferencia: planId,
    modalidad: textoModalidad
  };

  return (
    <PagoCliente 
      datos={datosParaPago}
      backUrl="/cobros/planes" 
    />
  );
}