/**
 * Dev: Maicol Ismael Nina Zarate
 * Date: 25/03/2026
 * Feature: About us page for frontend legal-information section.
 * @return About us page component.
 */
export default function AboutUsPage() {
  return (
    <main className="bg-[#F4EFE6] px-6 py-14 md:px-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#4E4E4E]">
            PROPBOL
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-[#2E2E2E] md:text-6xl">
            Sobre Nosotros
          </h1>
          <div className="mt-6 space-y-3">
            <div className="h-2 w-full max-w-96 rounded-full bg-[#D8D3CC]" />
            <div className="h-2 w-full max-w-[28rem] rounded-full bg-[#D8D3CC]" />
          </div>
        </div>

        <div className="rounded-[22px] bg-[#EEE8DE] p-8 shadow-sm ring-1 ring-[#DDD5C9] md:p-10">
          <div className="space-y-10">
            <section>
              <h2 className="mb-4 text-2xl font-semibold text-[#2E2E2E]">
                Quiénes somos
              </h2>
              <p className="leading-8 text-[#4E4E4E]">
                PROPBOL es una plataforma inmobiliaria diseñada para conectar a
                personas interesadas en comprar, alquilar o publicar inmuebles
                de forma simple, moderna y accesible.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-[#2E2E2E]">
                Qué ofrecemos
              </h2>
              <p className="leading-8 text-[#4E4E4E]">
                Ofrecemos una experiencia digital enfocada en la búsqueda de
                propiedades, publicación de inmuebles y navegación clara para
                facilitar la toma de decisiones.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-[#2E2E2E]">
                Nuestra misión
              </h2>
              <p className="leading-8 text-[#4E4E4E]">
                Facilitar la búsqueda y publicación de propiedades con
                transparencia, confianza y una experiencia visual moderna.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-[#2E2E2E]">
                Nuestra visión
              </h2>
              <p className="leading-8 text-[#4E4E4E]">
                Ser una plataforma inmobiliaria confiable, elegante y funcional,
                reconocida por su accesibilidad y facilidad de uso.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
