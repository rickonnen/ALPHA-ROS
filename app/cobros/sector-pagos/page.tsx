import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PagoCliente from "@/features/cobros/sectorPago/pagoCliente";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
interface Props {
  searchParams: Promise<{ planId?: string }>;
}


export default async function PaginaSectorPagos({ searchParams }: Props) {
  const session = await getServerSession();
  if (!session) {
    redirect("/cobros/planes?auth_required=true");
    return null; // Por seguridad, no renderizamos nada más
  }

  const params = await searchParams;
  const { planId } = await searchParams;

  if (!planId) return <div className="p-10 text-center">Falta el plan.</div>;

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
  return <PagoCliente plan={planFormateado} planId={planId} />;
}
