import Banner from "@/components/home-comps/banner";
import FilterPanel from "@/components/home-comps/FilterPanel";
import ExploreBy from "@/components/home-comps/ExploreBy";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-[#F4EFE6] w-full overflow-x-hidden">
      
      {/* ── BANNER Y FILTRO FLOTANTE ── */}
      <section className="relative w-full flex flex-col items-center">
        <Banner />
        
        {/* Contenedor absoluto para superponer el panel de filtros sobre el banner */}
        <div className="absolute bottom-55 w-full max-w-4xl left-1/2 transform -translate-x-1/2 px-4 z-10">
          <FilterPanel />
        </div>
      </section>

      {/* ── EXPLORAR POR CIUDADES/TIPO ── */}
      <section className="w-full max-w-6xl mx-auto px-4 pb-20 mt-16">
        <ExploreBy />
      </section>

    </main>
  );
}