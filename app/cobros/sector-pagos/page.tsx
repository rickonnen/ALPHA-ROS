import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PagoCliente from "@/features/cobros/sectorPago/pagoCliente";

interface Props {
  searchParams: Promise<{ planId?: string }>;
}

export default async function PaginaSectorPagos({ searchParams }: Props) {
  const { planId } = await searchParams;

  if (!planId) return <div className="p-10 text-center">Falta el plan.</div>;

  const plan = await prisma.planPublicacion.findUnique({
    where: { id_plan: Number(planId) },
  });

  if (!plan) notFound();

  const planFormateado = {
    ...plan,
    precio_plan: Number(plan.precio_plan),
  };

  return <PagoCliente plan={planFormateado} planId={planId} />;
}