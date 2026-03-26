/**
 * Dev: Maicol Ismael Nina Zarate
 * Date: 25/03/2026
 * Feature: Terms and conditions page for frontend legal-information section.
 * @return Terms and conditions page component.
 */
export default function TermsAndConditionsPage() {
  return (
    <main className="bg-[#F4EFE6] px-6 py-14 md:px-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#4E4E4E]">
            PROPBOL
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-[#2E2E2E] md:text-6xl">
            Términos y Condiciones
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
                Uso de la plataforma
              </h2>
              <p className="leading-8 text-[#4E4E4E]">
                El usuario se compromete a utilizar PROPBOL de manera
                responsable, legal y respetuosa dentro de todas las secciones de
                la plataforma.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-[#2E2E2E]">
                Veracidad de la información
              </h2>
              <p className="leading-8 text-[#4E4E4E]">
                Toda publicación, dato personal o información ingresada por el
                usuario debe ser veraz, actualizada y no inducir a error.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-[#2E2E2E]">
                Publicación de inmuebles
              </h2>
              <p className="leading-8 text-[#4E4E4E]">
                La persona que publique un inmueble asume responsabilidad sobre
                el contenido del anuncio, las imágenes, precios, descripciones y
                demás datos visibles dentro de la plataforma.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-[#2E2E2E]">
                Limitación de responsabilidad
              </h2>
              <p className="leading-8 text-[#4E4E4E]">
                PROPBOL actúa como intermediario digital y no garantiza la
                concreción de acuerdos entre usuarios ni negocia directamente en
                nombre de las partes.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
