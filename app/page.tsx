import Banner from "@/components/home-comps/banner";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-[#F4EFE6] w-full overflow-x-hidden">
      {/* SECCIÓN BANNER */}
      <section className="relative w-full flex flex-col items-center">
        <Banner />
      </section>
    </main>
  );
}