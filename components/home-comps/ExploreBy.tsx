"use client";
//Made by Fabricio Caceres Rengel and Maria Angela Velasquez Paredes
import Link from "next/link";
import { Home, Key, Tag } from "lucide-react";

// ── 1. TYPES ─────────────────────────────────────────────────────────────────
interface CategoryItem {
  name: string;
  count: number;
}

interface ExploreCategory {
  id: string;
  title: string;
  total: number;
  icon: React.ReactNode;
  items: CategoryItem[];
  linkHref: string;
  linkLabel: string;
}

// ── 2. MOCK DATA ──────────────────────────────────────────────────────────────
// Temporary data — replace with real DB queries via Prisma when ready.
const MOCK_DATA = {
  rentals: [
    { name: "Cochabamba", count: 350 },
    { name: "Santa Cruz",  count: 290 },
    { name: "La Paz",      count: 200 },
    { name: "Sucre",       count: 120 },
    { name: "Tarija",      count: 85  },
  ],
  sales: [
    { name: "Cochabamba", count: 220 },
    { name: "Santa Cruz",  count: 185 },
    { name: "La Paz",      count: 150 },
    { name: "Sucre",       count: 120 },
    { name: "Tarija",      count: 85  },
  ],
  propertyTypes: [
    { name: "Casas",        count: 750 },
    { name: "Departamentos",count: 620 },
    { name: "Cuartos",      count: 310 },
    { name: "Terrenos",     count: 180 },
    { name: "Oficinas",     count: 95  },
  ],
};

// ── 3. DERIVED TOTALS ─────────────────────────────────────────────────────────
const getTotalCount = (items: CategoryItem[]) =>
  items.reduce((sum, item) => sum + item.count, 0);

// ── 4. CATEGORY CONFIG ────────────────────────────────────────────────────────
const categories: ExploreCategory[] = [
  {
    id:         "rentals",
    title:      "Alquileres",
    total:      getTotalCount(MOCK_DATA.rentals),
    icon:       <Key className="w-4 h-4" />,
    items:      MOCK_DATA.rentals,
    linkHref:   "/busqueda?operacion=Alquiler",
    linkLabel:  "Ver todas las ciudades",
  },
  {
    id:         "sales",
    title:      "En venta",
    total:      getTotalCount(MOCK_DATA.sales),
    icon:       <Home className="w-4 h-4" />,
    items:      MOCK_DATA.sales,
    linkHref:   "/busqueda?operacion=Venta",
    linkLabel:  "Ver todas las ciudades",
  },
  {
    id:         "property-types",
    title:      "Tipo de inmueble",
    total:      getTotalCount(MOCK_DATA.propertyTypes),
    icon:       <Tag className="w-4 h-4" />,
    items:      MOCK_DATA.propertyTypes,
    linkHref:   "/busqueda",
    linkLabel:  "Ver todos los tipos",
  },
];

// ── 5. SUB-COMPONENTS ─────────────────────────────────────────────────────────

function CategoryRow({ item, index }: { item: CategoryItem; index: number }) {
  return (
    <div
      className="group/row flex justify-between items-center px-3 py-2.5 rounded-lg
                 bg-white/50 hover:bg-white transition-all duration-200
                 hover:shadow-sm cursor-default"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <span className="text-sm text-[#3D3530] font-medium group-hover/row:text-[#1F3A4D] transition-colors duration-200">
        {item.name}
      </span>
      <span
        className="text-sm font-bold text-[#1F3A4D] tabular-nums
                   bg-[#E7E1D7]/60 group-hover/row:bg-[#1F3A4D] group-hover/row:text-white
                   px-2 py-0.5 rounded-md transition-all duration-200"
      >
        {item.count.toLocaleString("es-BO")}
      </span>
    </div>
  );
}

function ExploreCard({ category }: { category: ExploreCategory }) {
  return (
    <div
      className="group relative flex flex-col rounded-2xl overflow-hidden
                 bg-[#F5F1EA] border border-[#D6CFC3]
                 shadow-sm hover:shadow-xl
                 transition-all duration-400 ease-out
                 hover:-translate-y-1.5"
    >
      {/* Subtle top gradient accent on hover */}
      <div
        className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#C26E5A] via-[#D4956A] to-[#1F3A4D]
                   opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#1F3A4D]">
        <div className="flex items-center gap-2.5 text-white">
          <span
            className="flex items-center justify-center w-7 h-7 rounded-lg
                       bg-white/15 group-hover:bg-[#C26E5A]/80
                       transition-colors duration-300"
          >
            {category.icon}
          </span>
          <span className="font-semibold text-base tracking-tight">
            {category.title}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-white/50 font-medium leading-none mb-0.5">
            total
          </p>
          <p className="text-sm font-bold text-white/90 tabular-nums">
            {category.total.toLocaleString("es-BO")}
          </p>
        </div>
      </div>

      {/* ── List ── */}
      <div className="flex-1 px-4 py-4 space-y-1.5">
        {category.items.map((item, index) => (
          <CategoryRow key={item.name} item={item} index={index} />
        ))}
      </div>

      {/* ── Footer link ── */}
      <div className="px-5 py-4 border-t border-[#D6CFC3]/70">
        <Link
          href={category.linkHref}
          className="group/link inline-flex items-center gap-1.5
                     text-sm font-semibold text-[#C26E5A]
                     hover:text-[#1F3A4D] transition-colors duration-200"
        >
          {category.linkLabel}
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

// ── 6. MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function ExploreBy() {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-[#1F3A4D] mb-6 tracking-tight">
        Explorar por:
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {categories.map((category) => (
          <ExploreCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}