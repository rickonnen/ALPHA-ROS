import Banner from "@/components/home-comps/banner";

/**
 * @Dev: Rodrigo Chalco
 * @Fecha: 25/03/2026
 * Funcionalidad: Renderiza la página principal Home e integra el componente Banner.
 * @return {React.ReactNode} Página Home renderizada
 */
export default function HomePage() {
  return (
    <main className="w-full overflow-x-hidden">
      <Banner />
    </main>
  );
}
