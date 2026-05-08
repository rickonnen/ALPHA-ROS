/**
 * Author: Maicol Ismael Nina Zarate
 * Date: 26/03/2026
 * Description: About us page for the real estate platform.
 * It presents the platform identity, mission, vision and values.
 * @return About us page content.
 */
export default function AboutUsPage() {
  return (
    <section className="w-full bg-background px-6 py-14 text-foreground md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-4xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-secondary">
            PROPBOL
          </p>

          <h1 className="mb-4 text-5xl font-bold tracking-tight text-primary">
            Sobre Nosotros
          </h1>

          <p className="max-w-3xl text-base leading-8 text-foreground/80">
            En PROPBOL conectamos personas con su próximo hogar mediante una
            experiencia inmobiliaria moderna, clara y confiable.
          </p>
        </div>

        <div className="rounded-[28px] bg-card-bg p-8 shadow-sm ring-1 ring-card-border md:p-12">
          <div className="space-y-8">
            <section className="border-b border-card-border pb-6 last:border-b-0 last:pb-0">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary">
                ¿Quiénes somos?
              </h2>
              <p className="text-base leading-8 text-foreground/80">
                PROPBOL es una plataforma digital enfocada en la búsqueda,
                publicación y visualización de propiedades. Nuestro objetivo es
                facilitar el contacto entre personas interesadas en comprar,
                alquilar o publicar inmuebles, ofreciendo una experiencia
                simple, moderna y funcional.
              </p>
            </section>

            <section className="border-b border-card-border pb-6 last:border-b-0 last:pb-0">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary">
                ¿Qué ofrecemos?
              </h2>
              <p className="text-base leading-8 text-foreground/80">
                A través de nuestra plataforma, los usuarios pueden explorar
                propiedades, revisar información de inmuebles, publicar anuncios
                y acceder a una experiencia inmobiliaria más ordenada y
                accesible.
              </p>
            </section>

            <section className="border-b border-card-border pb-6 last:border-b-0 last:pb-0">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary">
                Nuestra misión
              </h2>
              <p className="text-base leading-8 text-foreground/80">
                Facilitar la búsqueda y publicación de inmuebles en Bolivia
                mediante una plataforma digital segura, accesible y orientada a
                la confianza entre usuarios.
              </p>
            </section>

            <section className="border-b border-card-border pb-6 last:border-b-0 last:pb-0">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary">
                Nuestra visión
              </h2>
              <p className="text-base leading-8 text-foreground/80">
                Consolidarnos como una plataforma inmobiliaria digital de
                referencia en Bolivia, reconocida por su claridad, experiencia
                de usuario y compromiso con la información útil y transparente.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary">
                Nuestros valores
              </h2>
              <ul className="list-disc space-y-2 pl-6 text-base leading-8 text-foreground/80">
                <li>Transparencia en la información publicada.</li>
                <li>Respeto por la privacidad y los datos de los usuarios.</li>
                <li>
                  Compromiso con una experiencia digital clara y accesible.
                </li>
                <li>Mejora continua de la plataforma y sus servicios.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}