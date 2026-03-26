import Banner from "@/components/home-comps/banner";
import FilterPanel from "@/components/home-comps/FilterPanel";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-[#F4EFE6] w-full overflow-x-hidden">
      
      {/* ── SECCIÓN 1: BANNER Y FILTRO FLOTANTE ── */}
      <section className="relative w-full flex flex-col items-center">
        <Banner />
        
        {/* Tu Filtro, posicionado de forma absoluta para flotar sobre el Banner */}
        <div className="absolute -bottom-8 w-full max-w-4xl left-1/2 transform -translate-x-1/2 px-4 z-10">
          <FilterPanel />
        </div>
      </section>

      {/* Espaciador para compensar la altura del filtro flotante */}
      <div className="h-16 w-full" />

      {/* ── SECCIÓN 2: PROPIEDADES DESTACADAS (HU-05) ── */}
      <section className="w-full max-w-6xl mx-auto px-4 py-12">
        <div className="w-full border-2 border-dashed border-[#C4BAA8] bg-[#E7E1D7]/30 rounded-2xl h-80 flex flex-col items-center justify-center text-[#A89F92] transition-colors hover:bg-[#E7E1D7]/50">
          <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <p className="font-medium text-[#1F3A4D]">Espacio para: Propiedades Destacadas (HU-05)</p>
          <p className="text-sm">El equipo integrará su componente aquí.</p>
        </div>
      </section>

      {/* ── SECCIÓN 3: EXPLORAR POR CIUDADES/TIPO ── */}
      <section className="w-full max-w-6xl mx-auto px-4 pb-20">
        <div className="w-full border-2 border-dashed border-[#C4BAA8] bg-[#E7E1D7]/30 rounded-2xl h-64 flex flex-col items-center justify-center text-[#A89F92] transition-colors hover:bg-[#E7E1D7]/50">
          <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium text-[#1F3A4D]">Espacio para: Explorar por Ciudades/Tipos</p>
          <p className="text-sm">El equipo integrará su componente aquí.</p>
        </div>
      </section>

    </main>
  );
}