/**
 * dev: Kevin Isnado
 * Date: 24/03/26
 * Description: Pagina principal de historial de pagos
 */

import CardPago from "./card-pago";
import EstadoVacio from "./estado-vacio";

interface Pago {
  id: number;
  plan: string;
  fecha: string;
  monto: number;
  estado: "pendiente" | "realizado";
}

const pagosMock: Pago[] = [
  {
    id: 1,
    plan: "Plan Estándar",
    fecha: "19/03/2026",
    monto: 180,
    estado: "pendiente",
  },
  {
    id: 2,
    plan: "Plan Profesional",
    fecha: "18/03/2026",
    monto: 250,
    estado: "realizado",
  },
];

export default function ListaPagos({ estado }: { estado: "pendiente" | "realizado" }) {
  const filtrados = pagosMock.filter((p) => p.estado === estado);

  if (filtrados.length === 0) {
    return <EstadoVacio />;
  }

  return (
    <div className="space-y-4 mt-4">
      {filtrados.map((pago) => (
        <CardPago key={pago.id} pago={pago} />
      ))}
    </div>
  );
}