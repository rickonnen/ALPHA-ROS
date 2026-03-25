"use client";

/**
 * dev: Kevin isnado
 * ultima modif: 25/03/2025 - horas: 6 pm
 * descripcion: lsita de pagos-paginacion-se muestran las 10 transacciones mas recientes
 */

import { useState } from "react";
import CardPago from "./card-pago";
import EstadoVacio from "./estado-vacio";
import ErrorState from "./error-state";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Pago {
  id: number;
  fecha: string;
  detalle: string;
  monto: number;
  estado: "pendiente" | "realizado";
}

// MOCK (se puede duplicar para probar más páginas)
const pagosMock: Pago[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  fecha: "19/03/2026 - 14:30",
  detalle: `Plan ${i + 1}`,
  monto: 100 + i * 5,
  estado: i % 2 === 0 ? "pendiente" : "realizado",
}));

const ITEMS_POR_PAGINA = 10;

export default function ListaPagos({ estado }: { estado: "pendiente" | "realizado" }) {
  
  const [pagina, setPagina] = useState(1);

  const error = false;
  if (error) return <ErrorState />;

  const filtrados = pagosMock.filter((p) => p.estado === estado);

  if (filtrados.length === 0) return <EstadoVacio />;

  //PAGINACIÓN
  const totalPaginas = Math.ceil(filtrados.length / ITEMS_POR_PAGINA);

  const inicio = (pagina - 1) * ITEMS_POR_PAGINA;
  const fin = inicio + ITEMS_POR_PAGINA;

  const datosPagina = filtrados.slice(inicio, fin);

  return (
    <div className="space-y-4 mt-4">

      {/* LISTA */}
      {datosPagina.map((pago) => (
        <CardPago key={pago.id} pago={pago} />
      ))}

      {/* PAGINACIÓN */}
      <Pagination>
        <PaginationContent>

          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPagina((p) => Math.max(p - 1, 1))}
              className="cursor-pointer"
            />
          </PaginationItem>

          {Array.from({ length: totalPaginas }).map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                onClick={() => setPagina(i + 1)}
                isActive={pagina === i + 1}
                className="cursor-pointer"
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => setPagina((p) => Math.min(p + 1, totalPaginas))}
              className="cursor-pointer"
            />
          </PaginationItem>

        </PaginationContent>
      </Pagination>

    </div>
  );
}