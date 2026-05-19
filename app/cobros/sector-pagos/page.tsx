import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import PagoCliente from "@/features/cobros/sectorPago/pagoCliente";
import ResumenPublicacion from "@/features/cobros/sectorPago/ResumenPublicacion";

interface Props {
  searchParams: Promise<{ planId?: string; modalidad?: string; type?: string; idPublicacion?: string }>;
}

export default async function PaginaSectorPagos({ searchParams }: Props) {
  const { planId, modalidad, type, idPublicacion } = await searchParams;

  if (!planId) return <div className="p-10 text-center">Falta el ID del servicio.</div>;

  // en un futuro cambiar los calores aqui
  const plan = await prisma.planPublicacion.findUnique({
    where: { id_plan: Number(planId) },
  });

  if (!plan) notFound();

  // plan.tipo === true  => Es Publicación
  // plan.tipo === false => Es Promoción
  const esPromocion = plan.tipo === false;
  if (!esPromocion && idPublicacion) {
    redirect(`/cobros/sector-pagos?planId=${planId}&modalidad=${modalidad || "mensual"}`);
  }
  if (esPromocion && !idPublicacion) {
    redirect("/perfil");
  }
  const mostrarTarjetaAlMedio = esPromocion && Boolean(idPublicacion);

  let precioFinal = Number(plan.precio_plan);
  let textoModalidad = esPromocion ? "unico" : "mensual";
  let tiempoAcceso = esPromocion ? `${plan.cant_publicaciones} días` : "30 días";

  if (modalidad === "anual" && !esPromocion) {
    precioFinal = (precioFinal * 12) * 0.90; // 10% de descuento 
    precioFinal = Math.round(precioFinal * 100) / 100;
    textoModalidad = "anual";
    tiempoAcceso = "12 meses";
  }

  const datosParaPago = {
      titulo: esPromocion ? `Promoción: ${plan.nombre_plan}` : plan.nombre_plan ?? "Plan de Publicación", 
      descripcion: esPromocion 
        ? `Estás aplicando un plan de visibilidad a tu inmueble. Destacará sobre los demás por un periodo de ${tiempoAcceso}.` 
        : `Estás adquiriendo una suscripción ${textoModalidad}. Acceso completo a todas las funciones por un periodo de ${tiempoAcceso}.`,
      detalleItems: esPromocion 
        ? [`Prioridad destacada en resultados de búsqueda`, `Vigencia de la promoción: ${tiempoAcceso}`]
        : [
          `Publicar ${plan.cant_publicaciones} publicaciones`,
        ],
      precio: precioFinal,
      idReferencia: planId, 
      modalidad: textoModalidad,
      tipoPlan: esPromocion ? 0 : 1, 
      idPublicacion: esPromocion ? (idPublicacion ?? null) : null
    };

  return (
    <PagoCliente 
      datos={datosParaPago}
      backUrl={esPromocion ? `/cobros/planes-promocion?pubId=${idPublicacion}` : "/cobros/planes"} 
      resumenPublicacionNode={
        mostrarTarjetaAlMedio ? <ResumenPublicacion idPublicacion={idPublicacion!} /> : null
      }
    />
  );
}