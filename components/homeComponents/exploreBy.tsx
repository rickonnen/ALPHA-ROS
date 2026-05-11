"use client";

import Link from "next/link";
import { Home, Key, Tag } from "lucide-react";
import { useEffect, useState } from "react";

// ---------------------------------------------------------------
//  Tipos
// ---------------------------------------------------------------
interface CategoryItem {
  StrName:  string;
  IntCount: number;
}

interface ExploreCategory {
  StrId:           string;
  StrTitle:        string;
  IntTotal:        number;
  ObjIcon:         React.ReactNode;
  ArrItems:        CategoryItem[];
  StrLinkHref:     string;
  StrLinkLabel:    string;
  FnBuildItemHref: (name: string) => string;
}

// ---------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------
const GetTotalCount = (items: CategoryItem[]) =>
  items.reduce((sum, item) => sum + item.IntCount, 0);

const ToQueryParam = (value: string) => value.replace(/ /g, "+");

const DisplayNames: Record<string, string> = {
  Casa:         "Casa",
  Departamento: "Departamento",
  Cuarto:       "Cuarto",
  Terreno:      "Terreno",
  Oficina:      "Oficina",
};

// ---------------------------------------------------------------
//  Funciones fetch → API Routes
// ---------------------------------------------------------------
async function FetchTop5CiudadesAlquiler(): Promise<CategoryItem[]> {
  const res = await fetch("/api/home/explore/alquiler");
  const { data } = await res.json();
  if (!data) return [];
  return data
    .filter((row: { ciudad: string; total: number }) => !!row.ciudad)
    .map((row: { ciudad: string; total: number }) => ({
      StrName:  row.ciudad,
      IntCount: Number(row.total),
    }));
}

async function FetchTop5CiudadesVenta(): Promise<CategoryItem[]> {
  const res = await fetch("/api/home/explore/venta");
  const { data } = await res.json();
  if (!data) return [];
  return data
    .filter((row: { ciudad: string; total: number }) => !!row.ciudad)
    .map((row: { ciudad: string; total: number }) => ({
      StrName:  row.ciudad,
      IntCount: Number(row.total),
    }));
}

async function FetchTiposInmueble(): Promise<CategoryItem[]> {
  const res = await fetch("/api/home/explore/tipos");
  const { data } = await res.json();
  if (!data) return [];
  return data
    .filter((row: { tipo: string; total: number }) => !!row.tipo) // ✅ era tipo_inmueble
    .map((row: { tipo: string; total: number }) => ({
      StrName:  DisplayNames[row.tipo] ?? row.tipo,
      IntCount: Number(row.total),
    }));
}

// ---------------------------------------------------------------
//  Sub-componentes
// ---------------------------------------------------------------
function CategoryRow({
  ObjItem,
  IntIndex,
  StrHref,
}: {
  ObjItem:  CategoryItem;
  IntIndex: number;
  StrHref:  string;
}) {
  return (
    <Link
      href={StrHref}
      className="group/row flex justify-between items-center px-3 py-2.5 rounded-lg
                 bg-background hover:bg-secondary-fund transition-all duration-200 hover:shadow-sm"
      style={{ animationDelay: `${IntIndex * 60}ms` }}
    >
      <span className="text-sm text-foreground font-medium group-hover/row:text-primary transition-colors duration-200">
        {ObjItem.StrName}
      </span>
      <span className="text-sm font-bold text-primary tabular-nums
                       bg-secondary-fund/60 group-hover/row:bg-primary group-hover/row:text-secondary-fund
                       px-2 py-0.5 rounded-md transition-all duration-200">
        {ObjItem.IntCount.toLocaleString("es-BO")}
      </span>
    </Link>
  );
}

function ExploreCard({ ObjCategory }: { ObjCategory: ExploreCategory }) {
  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden
                    bg-card-bg border border-card-border shadow-sm hover:shadow-xl
                    transition-all duration-400 ease-out hover:-translate-y-1.5">

      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-secondary via-secondary to-primary
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-primary">
        <div className="flex items-center gap-2.5 text-primary-foreground">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg
                           bg-primary-foreground/15 group-hover:bg-secondary/80 transition-colors duration-300">
            {ObjCategory.ObjIcon}
          </span>
          <span className="font-semibold text-base tracking-tight">{ObjCategory.StrTitle}</span>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-primary-foreground/70 font-medium leading-none mb-0.5">
            total
          </p>
          <p className="text-sm font-bold text-primary-foreground tabular-nums">
            {ObjCategory.IntTotal.toLocaleString("es-BO")}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 px-4 py-4 space-y-1.5">
        {ObjCategory.ArrItems.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[140px]">
            <p className="text-sm text-foreground/40 font-medium">Aún no existentes</p>
          </div>
        ) : (
          ObjCategory.ArrItems.map((item, index) => (
            <CategoryRow
              key={item.StrName}
              ObjItem={item}
              IntIndex={index}
              StrHref={ObjCategory.FnBuildItemHref(item.StrName)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-card-border/70">
        <Link
          href={ObjCategory.StrLinkHref}
          className="group/link inline-flex items-center gap-1.5 rounded-sm
                     text-sm font-semibold text-secondary hover:text-primary transition-colors duration-200
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                     focus-visible:ring-offset-2 focus-visible:ring-offset-card-bg"
        >
          {ObjCategory.StrLinkLabel}
          <svg className="w-4 h-4 translate-x-0 group-hover/link:translate-x-1 transition-transform duration-200"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function ExploreCardSkeleton() {
  return (
    <div className="relative flex flex-col rounded-2xl overflow-hidden bg-card-bg border border-card-border shadow-sm animate-pulse">
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-card-bg/50 backdrop-blur-[1px]">
        <div className="h-8 w-8 rounded-full border-4 border-card-border border-t-primary animate-spin" />
        <p className="mt-2 text-xs text-primary/50 font-medium">Cargando...</p>
      </div>
      <div className="px-5 py-4 bg-primary flex justify-between items-center">
        <div className="h-4 w-24 bg-primary-foreground/30 rounded" />
        <div className="h-4 w-12 bg-primary-foreground/30 rounded" />
      </div>
      <div className="flex-1 px-4 py-4 space-y-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between px-3 py-2.5 rounded-lg bg-background">
            <div className="h-3 w-28 bg-card-border rounded" />
            <div className="h-3 w-10 bg-card-border rounded" />
          </div>
        ))}
      </div>
      <div className="px-5 py-4 border-t border-card-border/70">
        <div className="h-3 w-36 bg-card-border rounded" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
//  Componente principal
// ---------------------------------------------------------------
export default function ExploreBy() {
  const [ArrRentals,       SetArrRentals]       = useState<CategoryItem[]>([]);
  const [ArrSales,         SetArrSales]         = useState<CategoryItem[]>([]);
  const [ArrPropertyTypes, SetArrPropertyTypes] = useState<CategoryItem[]>([]);
  const [BlnLoading,       SetBlnLoading]       = useState(true);
  const [StrError,         SetStrError]         = useState<string | null>(null);

  useEffect(() => {
    async function LoadData() {
      try {
        const [alquiler, venta, tipos] = await Promise.all([
          FetchTop5CiudadesAlquiler(),
          FetchTop5CiudadesVenta(),
          FetchTiposInmueble(),
        ]);
        SetArrRentals(alquiler);
        SetArrSales(venta);
        SetArrPropertyTypes(tipos);
      } catch (err) {
        console.error("Error cargando datos de exploración:", err);
        SetStrError("No se pudieron cargar los datos.");
      } finally {
        SetBlnLoading(false);
      }
    }
    LoadData();
  }, []);

  const ArrCategories: ExploreCategory[] = [
    {
      StrId:           "rentals",
      StrTitle:        "Alquileres",
      IntTotal:        GetTotalCount(ArrRentals),
      ObjIcon:         <Key className="w-4 h-4" />,
      ArrItems:        ArrRentals,
      StrLinkHref:     "/busqueda?operaciones=Alquiler",
      StrLinkLabel:    "Ver todas las ciudades",
      FnBuildItemHref: (name) => `/busqueda?operaciones=Alquiler&ciudad=${ToQueryParam(name)}`,
    },
    {
      StrId:           "sales",
      StrTitle:        "En venta",
      IntTotal:        GetTotalCount(ArrSales),
      ObjIcon:         <Home className="w-4 h-4" />,
      ArrItems:        ArrSales,
      StrLinkHref:     "/busqueda?operaciones=Venta",
      StrLinkLabel:    "Ver todas las ciudades",
      FnBuildItemHref: (name) => `/busqueda?operaciones=Venta&ciudad=${ToQueryParam(name)}`,
    },
    {
      StrId:           "property-types",
      StrTitle:        "Tipo de inmueble",
      IntTotal:        GetTotalCount(ArrPropertyTypes),
      ObjIcon:         <Tag className="w-4 h-4" />,
      ArrItems:        ArrPropertyTypes,
      StrLinkHref:     "/busqueda",
      StrLinkLabel:    "Ver todos los tipos",
      FnBuildItemHref: (name) => `/busqueda?tipo=${ToQueryParam(name)}`,
    },
  ];

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-foreground mb-6 tracking-tight">
        Explorar por:
      </h2>

      {StrError ? (
        <p className="text-sm text-red-500">{StrError}</p>
      ) : BlnLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => <ExploreCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ArrCategories.map((cat) => (
            <ExploreCard key={cat.StrId} ObjCategory={cat} />
          ))}
        </div>
      )}
    </div>
  );
}