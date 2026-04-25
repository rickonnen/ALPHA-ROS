import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PagoCliente from "@/features/cobros/sectorPago/pagoCliente";

interface Props {
  searchParams: Promise<{ planId?: string; modalidad?: string}>;
}

export default async function PaginaSectorPagos({ searchParams }: Props) {
  const { planId, modalidad } = await searchParams;

  if (!planId) return <div className="p-10 text-center">Falta el plan.</div>;

  const plan = await prisma.planPublicacion.findUnique({
    where: { id_plan: Number(planId) },
  });

  if (!plan) notFound();

  let precioFinal = Number(plan.precio_plan);
  
  if (modalidad === "anual") {
    precioFinal = (precioFinal * 12) - (precioFinal*12*0.10); 
    precioFinal = Math.round(precioFinal * 100) / 100;
  }

  const planFormateado = {
    ...plan,
    precio_plan: precioFinal,
  };

  return <PagoCliente plan={planFormateado} planId={planId} modalidad={modalidad || "mensual"} />;
}