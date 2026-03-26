/**
 * Dev: Maicol Ismael Nina Zarate
 * Date: 25/03/2026
 * Feature: Privacy policy page for frontend legal-information section.
 * @return Privacy policy page component.
 */
export default function PrivacyPolicyPage() {
  return (
    <main className="bg-[#F4EFE6] px-6 py-14 md:px-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#4E4E4E]">
            PROPBOL
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-[#2E2E2E] md:text-6xl">
            Políticas de Privacidad
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
                Información que recopilamos
              </h2>
              <p className="leading-8 text-[#4E4E4E]">
                Podemos recopilar datos como nombre, correo electrónico, número
                de teléfono y datos relacionados con la búsqueda o publicación
                de inmuebles.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-[#2E2E2E]">
                Uso de la información
              </h2>
              <p className="leading-8 text-[#4E4E4E]">
                Utilizamos la información para mejorar la experiencia del
                usuario, facilitar el contacto entre personas interesadas y
                optimizar el funcionamiento general de la plataforma.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-[#2E2E2E]">
                Uso de cookies
              </h2>
              <p className="leading-8 text-[#4E4E4E]">
                El sitio puede utilizar cookies para recordar preferencias,
                analizar navegación y ofrecer una experiencia más personalizada.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-[#2E2E2E]">
                Protección y derechos
              </h2>
              <p className="leading-8 text-[#4E4E4E]">
                Aplicamos medidas razonables para proteger los datos personales.
                El usuario podrá solicitar corrección, actualización o
                eliminación de su información cuando corresponda.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
