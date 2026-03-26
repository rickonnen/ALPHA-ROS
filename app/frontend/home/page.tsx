import FilterPanel from "@/components/home-comps/FilterPanel";

// ----------------------------------------------------------------------
// IMPORTACIONES FUTURAS (Tus compañeros descomentarán esto cuando acaben)
// import HeroSection from "./components/home-comps/HeroSection";      // HU-02
// import FeaturedProperties from "./components/home-comps/FeaturedProperties"; // HU-05
import ExploreBy from "@/components/home-comps/ExploreBy";
// ----------------------------------------------------------------------

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-[#F4EFE6]">
      
      {/* ── SECCIÓN 1: HERO (HU-02) ── */}
      {/* Mientras tu compañero termina el HeroSection, dejamos este bloque de color 
        con el Azul Petróleo (#1F3A4D) para que tu filtro resalte y tenga contexto.
      */}
      <section className="relative w-full bg-[#1F3A4D] pt-24 pb-32 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-sans tracking-tight">
          Encuentra tu próximo hogar ideal en un solo lugar
        </h1>
        <p className="text-[#E7E1D7] max-w-2xl text-lg mb-8">
          Miles de propiedades verificadas en todo el país. Compra, vende o alquila con confianza.
        </p>

        {/* ── SECCIÓN 2: FILTROS DE BÚSQUEDA (TU HU-04) ── */}
        {/* Posicionamos tu componente de forma absoluta para que quede "flotando" 
          entre el Hero azul y el fondo beige de abajo, como es el estándar 
          en páginas tipo InmoVista / Airbnb.
        */}
        <div className="absolute -bottom-8 w-full max-w-4xl left-1/2 transform -translate-x-1/2 px-4 z-10">
          <FilterPanel />
        </div>
      </section>

      {/* Espaciador para compensar la altura del filtro flotante */}
      <div className="h-16 w-full" />

      {/* ── SECCIÓN 3: PROPIEDADES DESTACADAS (HU-05) ── */}
      <section className="w-full max-w-6xl mx-auto px-4 py-12">
        {/* Tu compañero reemplazará este div con su <FeaturedProperties /> */}
        <div className="w-full border-2 border-dashed border-[#C4BAA8] bg-[#E7E1D7]/30 rounded-2xl h-80 flex flex-col items-center justify-center text-[#A89F92] transition-colors hover:bg-[#E7E1D7]/50">
          <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <p className="font-medium text-[#1F3A4D]">Espacio para: Propiedades Destacadas (HU-05)</p>
          <p className="text-sm">El equipo integrará su componente aquí.</p>
        </div>
      </section>

      {/* ── SECCIÓN 4: EXPLORAR POR CIUDADES/TIPO ── */}
      <section className="w-full max-w-6xl mx-auto px-4 pb-20">
        <ExploreBy />
      </section>
    </main>
  );
}