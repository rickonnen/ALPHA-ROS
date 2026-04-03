import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PagoCliente from "@/features/cobros/sectorPago/pagoCliente";

interface Props {
  searchParams: Promise<{
    planId?: string;
    id?: string;
  }>;
}

export default async function PaginaSectorPagos({ searchParams }: Props) {
  const params = await searchParams;
  const planId = params.planId;
  const idUsuario = params.id;

  if (!planId || !idUsuario) {
    return (
      <div className="p-10 text-center text-red-500">
        Faltan datos en la URL.
      </div>
    );
  }

  // Consulta a la base de datos
  const plan = await prisma.planPublicacion.findUnique({
    where: {
      id_plan: Number(planId),
    },
  });

  if (!plan) {
    notFound();
  }

  const planFormateado = {
    ...plan,
    precio_plan: Number(plan.precio_plan),
  };

  // Pasamos el plan ya formateado
  return (
    <PagoCliente plan={planFormateado} idUsuario={idUsuario} planId={planId} />
  );
}
