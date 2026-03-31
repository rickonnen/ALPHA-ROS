"use client";

import Link from "next/link";
import { Home, Key, Tag } from "lucide-react";
import { useEffect, useState } from "react";

// ---------------------------------------------------------------
//  Tipos
// ---------------------------------------------------------------
interface CategoryItem {
  strName:  string;
  intCount: number;
}

interface ExploreCategory {
  strId:        string;
  strTitle:     string;
  intTotal:     number;
  objIcon:      React.ReactNode;
  arrItems:     CategoryItem[];
  strLinkHref:  string;
  strLinkLabel: string;
}

// ---------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------
const getTotalCount = (arrItems: CategoryItem[]) =>
  arrItems.reduce((intSum, objItem) => intSum + objItem.intCount, 0);

const strDisplayName: Record<string, string> = {
  Casa:         "Casas",
  Departamento: "Departamentos",
  Cuarto:       "Cuartos",
  Terreno:      "Terrenos",
  Oficina:      "Oficinas",
};

// ---------------------------------------------------------------
//  Funciones fetch → API Routes
// ---------------------------------------------------------------
async function fetchTop5CiudadesAlquiler(): Promise<CategoryItem[]> {
  const res = await fetch("/backend/home/explore/alquiler");
  const { data } = await res.json();
  return data.map((row: { ciudad: string; total: number }) => ({
    strName:  row.ciudad,
    intCount: Number(row.total),
  }));
}

async function fetchTop5CiudadesVenta(): Promise<CategoryItem[]> {
  const res = await fetch("/backend/home/explore/venta");
  const { data } = await res.json();
  return data.map((row: { ciudad: string; total: number }) => ({
    strName:  row.ciudad,
    intCount: Number(row.total),
  }));
}

async function fetchTiposInmueble(): Promise<CategoryItem[]> {
  const res = await fetch("/backend/home/explore/tipos");
  const { data } = await res.json();
  return data.map((row: { tipo_inmueble: string; total: number }) => ({
    strName:  strDisplayName[row.tipo_inmueble] ?? row.tipo_inmueble,
    intCount: Number(row.total),
  }));
}

// ---------------------------------------------------------------
//  Sub-componentes (sin cambios)
// ---------------------------------------------------------------
function CategoryRow({ objItem, intIndex }: { objItem: CategoryItem; intIndex: number }) {
  return (
    <div
      className="group/row flex justify-between items-center px-3 py-2.5 rounded-lg
           bg-[#F4EFE6] hover:bg-[#E7E1D7] transition-all duration-200
           hover:shadow-sm cursor-default"
      style={{ animationDelay: `${intIndex * 60}ms` }}
    >
      <span className="text-sm text-[#2E2E2E] font-medium group-hover/row:text-[#1F3A4D] transition-colors duration-200">
        {objItem.strName}
      </span>
      <span
        className="text-sm font-bold text-[#1F3A4D] tabular-nums
           bg-[#E7E1D7]/60 group-hover/row:bg-[#1F3A4D] group-hover/row:text-[#E7E1D7]
           px-2 py-0.5 rounded-md transition-all duration-200"
      >
        {objItem.intCount.toLocaleString("es-BO")}
      </span>
    </div>
  );
}

function ExploreCard({ objCategory }: { objCategory: ExploreCategory }) {
  return (
    <div
      className="group relative flex flex-col rounded-2xl overflow-hidden
                 bg-[#F5F1EA] border border-[#D6CFC3]
                 shadow-sm hover:shadow-xl
                 transition-all duration-400 ease-out
                 hover:-translate-y-1.5"
    >
      <div
        className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#C26E5A] via-[#D4956A] to-[#1F3A4D]
        opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />

      <div className="flex items-center justify-between px-5 py-4 bg-[#1F3A4D]">
        <div className="flex items-center gap-2.5 text-[#E7E1D7]">
          <span
            className="flex items-center justify-center w-7 h-7 rounded-lg
            bg-[#E7E1D7]/15 group-hover:bg-[#C26E5A]/80
            transition-colors duration-300"
          >
            {objCategory.objIcon}
          </span>
          <span className="font-semibold text-base tracking-tight">
            {objCategory.strTitle}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-[#E7E1D7]/60 font-medium leading-none mb-0.5">
            total
          </p>
          <p className="text-sm font-bold text-[#E7E1D7] tabular-nums">
            {objCategory.intTotal.toLocaleString("es-BO")}
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-1.5">
        {objCategory.arrItems.map((objItem, intIndex) => (
          <CategoryRow key={objItem.strName} objItem={objItem} intIndex={intIndex} />
        ))}
      </div>

      <div className="px-5 py-4 border-t border-[#D6CFC3]/70">
        <Link
          href={objCategory.strLinkHref}
          className="group/link inline-flex items-center gap-1.5 rounded-sm
                     text-sm font-semibold text-[#C26E5A]
                     hover:text-[#1F3A4D] transition-colors duration-200
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F1EA]"
        >
          {objCategory.strLinkLabel}
          <svg
            className="w-4 h-4 translate-x-0 group-hover/link:translate-x-1 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
//  Skeleton mientras cargan los datos
// ---------------------------------------------------------------
function ExploreCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden bg-[#F5F1EA] border border-[#D6CFC3] shadow-sm animate-pulse">
      <div className="px-5 py-4 bg-[#1F3A4D] flex justify-between items-center">
        <div className="h-4 w-24 bg-[#E7E1D7]/30 rounded" />
        <div className="h-4 w-12 bg-[#E7E1D7]/30 rounded" />
      </div>
      <div className="flex-1 px-4 py-4 space-y-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between px-3 py-2.5 rounded-lg bg-[#F4EFE6]">
            <div className="h-3 w-28 bg-[#D6CFC3] rounded" />
            <div className="h-3 w-10 bg-[#D6CFC3] rounded" />
          </div>
        ))}
      </div>
      <div className="px-5 py-4 border-t border-[#D6CFC3]/70">
        <div className="h-3 w-36 bg-[#D6CFC3] rounded" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
//  Componente principal
// ---------------------------------------------------------------
export default function ExploreBy() {
  const [arrRentals,       setArrRentals]       = useState<CategoryItem[]>([]);
  const [arrSales,         setArrSales]         = useState<CategoryItem[]>([]);
  const [arrPropertyTypes, setArrPropertyTypes] = useState<CategoryItem[]>([]);
  const [blnLoading,       setBlnLoading]       = useState(true);
  const [strError,         setStrError]         = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [arrAlquiler, arrVenta, arrTipos] = await Promise.all([
          fetchTop5CiudadesAlquiler(),
          fetchTop5CiudadesVenta(),
          fetchTiposInmueble(),
        ]);
        setArrRentals(arrAlquiler);
        setArrSales(arrVenta);
        setArrPropertyTypes(arrTipos);
      } catch (err) {
        console.error("Error cargando datos de exploración:", err);
        setStrError("No se pudieron cargar los datos.");
      } finally {
        setBlnLoading(false);
      }
    }
    loadData();
  }, []);

  const arrCategories: ExploreCategory[] = [
    {
      strId:        "rentals",
      strTitle:     "Alquileres",
      intTotal:     getTotalCount(arrRentals),
      objIcon:      <Key className="w-4 h-4" />,
      arrItems:     arrRentals,
      strLinkHref:  "/busqueda?operacion=Alquiler",
      strLinkLabel: "Ver todas las ciudades",
    },
    {
      strId:        "sales",
      strTitle:     "En venta",
      intTotal:     getTotalCount(arrSales),
      objIcon:      <Home className="w-4 h-4" />,
      arrItems:     arrSales,
      strLinkHref:  "/busqueda?operacion=Venta",
      strLinkLabel: "Ver todas las ciudades",
    },
    {
      strId:        "property-types",
      strTitle:     "Tipo de inmueble",
      intTotal:     getTotalCount(arrPropertyTypes),
      objIcon:      <Tag className="w-4 h-4" />,
      arrItems:     arrPropertyTypes,
      strLinkHref:  "/busqueda",
      strLinkLabel: "Ver todos los tipos",
    },
  ];

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-[#2E2E2E] mb-6 tracking-tight">
        Explorar por:
      </h2>

      {strError ? (
        <p className="text-sm text-red-500">{strError}</p>
      ) : blnLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => <ExploreCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {arrCategories.map((objCategory) => (
            <ExploreCard key={objCategory.strId} objCategory={objCategory} />
          ))}
        </div>
      )}
    </div>
  );
}