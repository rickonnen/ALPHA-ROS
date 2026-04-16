import Banner from "@/components/homeComponents/banner";
import FilterPanel from "@/components/homeComponents/filterPanel";
import ExploreBy from "@/components/homeComponents/exploreBy";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-[#F4EFE6] w-full overflow-x-hidden">
      {/* ── Banner ── */}
      <section className="w-full">
        <Banner />
      </section>
      {/* ── Filtros ── */}
      <section className="w-full px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <FilterPanel />
        </div>
      </section>
      {/* ── Explorar por ciudades/tipo ── */}
      <section className="w-full max-w-6xl mx-auto px-4 pb-20 mt-16">
        <ExploreBy />
      </section>
    </main>
  );
}
