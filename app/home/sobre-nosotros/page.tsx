/**
 * Author: Maicol Ismael Nina Zarate
 * Date: 26/03/2026
 * Description: About us page for the real estate platform.
 * It presents the platform identity, mission, vision, values and ALPHA-ROS team.
 * @return About us page content.
 */
export default function AboutUsPage() {
  const values = [
    {
      title: "Innovación tecnológica",
      description:
        "Aplicamos desarrollo full-stack, APIs integradas y lógica de negocio real para resolver necesidades del mercado inmobiliario.",
    },
    {
      title: "Transparencia",
      description:
        "Promovemos procesos claros en publicaciones, cobros e impuestos, incluyendo el IVA del 13% dentro de la plataforma.",
    },
    {
      title: "Accesibilidad y usabilidad",
      description:
        "Diseñamos una experiencia intuitiva para que cualquier usuario pueda navegar el mercado inmobiliario boliviano sin barreras.",
    },
    {
      title: "Precisión funcional",
      description:
        "Cada botón, consulta e interacción responde a una funcionalidad real, conectada con bases de datos y servicios integrados.",
    },
  ];

  const leadership = [
    {
      role: "Project Supervisor y Agile Coach",
      name: "Torrico Bascope Rosemary",
    },
    {
      role: "Product Owner",
      name: "Giovanny Samuel Uscamaita Jimenez",
    },
    {
      role: "QA Lead",
      name: "Axel Christian Santos Bloomfield",
    },
  ];

  const developmentTeam = [
    "Aguilar Ledezma Alexander Antonio",
    "Almaraz Flores Rodrigo",
    "Alvarado Alisson Dalet",
    "Alvarez Chocamani Jose Carlos",
    "Arias Murillo Nicole Belen",
    "Arispe León Juan David",
    "Arnez Torrico Erick Eduardo",
    "Avalos Soliz Benjamin Ramiro",
    "Cáceres Rengel Fabricio",
    "Calizaya Quispia Lisandra",
    "Chalco Soliz Marcela",
    "Chalco Soliz Rodrigo",
    "Chambi Villarroel David Oliver",
    "Chavarria Fuertes Jaime Sebastian",
    "Chavez Totora David Eduardo",
    "Choque Flores Carlos Andres",
    "Claros Bazoalto Luis Angel",
    "Coa Barrientos Iris Romina",
    "Coca Beltran Dylan",
    "Coca Pereira Andrea",
    "Condarco Flores Jose Daniel",
    "Condori Miguel Angel",
    "Cordova Catunta Marizabel",
    "Cordova Lopez Brayan Elvis",
    "Fernández Orellana Mairon Henry",
    "Flores Gutierrez Alison Danitza",
    "Garcia Guzman Oliver Saul",
    "Gonzales Castro Hector Gabriel",
    "Gutierrez Fuentes Alexander Raul",
    "Herrera Cachi Diego Fernando",
    "Humerez Soliz Joseph Harold",
    "Isnado Apodaca Kevin Jamir",
    "Juchasara Urqueta Christian",
    "Lafuente Zurita Neil Andres",
    "Lizarazu Fernández Josue Joel",
    "Magne Hinojosa Camila",
    "Mariscal Segovia Carlos Diego",
    "Montaño Cabrera Gustavo",
    "Nina Zarate Ismael Maicol",
    "Olivera Salazar Jose Maximiliano",
    "Ordoñez Pinto Candy Camila",
    "Oropeza Alexander Bañado",
    "Paredes Sipe Gabriel",
    "Quena Calizaya Rodrigo Shinechi",
    "Quispe Chavez Iomara Del Milagro",
    "Revollo Bernal Amilcar Diego",
    "Rios Manuel Agustin",
    "Rodriguez Jimenez Anelise Mayte",
    "Saavedra Garcia Stefany",
    "Serrano Romero Alisson Jasmin",
    "Suárez Ala Catherine Ainhoa",
    "Tejerina Molina José Diego",
    "Tinta Mamani Jairo Amado",
    "Vallejos Tinta Marcelo",
    "Vasquez Saucedo Jhosimark Jose",
    "Veisaga Rodríguez Luz Maida",
    "Velasquez Paredes María Angela",
    "Veliz Veliz Boris Fernando",
    "Vera Portanda Rene Gabriel",
    "Villarroel Rocha Jonathan Guilad",
    "Yavi Almendras Jack Kevin",
    "Zarate Villarroel Rodrigo Saul",
  ];

  return (
    <section className="w-full bg-background px-4 py-8 text-foreground sm:px-6 md:px-10 md:py-14">
      <div className="mx-auto max-w-7xl">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-[2rem] bg-primary p-6 text-primary-foreground shadow-sm ring-1 ring-card-border sm:p-8 md:p-12 lg:p-14">
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-secondary/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-secondary-fund/20 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/75 sm:text-sm">
                ALPHA-ROS & PROPBOL
              </p>

              <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Construimos una plataforma inmobiliaria real, funcional y
                confiable.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-primary-foreground/80">
                PropBol es el resultado de la sinergia, el esfuerzo y la
                excelencia técnica del equipo ALPHA-ROS: un colectivo de 62
                estudiantes de Ingeniería de Software bajo la supervisión de un
                cuerpo directivo especializado.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full bg-background px-5 py-2 text-sm font-semibold text-primary">
                  Datos reales
                </span>
                <span className="rounded-full bg-background px-5 py-2 text-sm font-semibold text-primary">
                  APIs integradas
                </span>
                <span className="rounded-full bg-background px-5 py-2 text-sm font-semibold text-primary">
                  Funcionalidad 100%
                </span>
              </div>
            </div>

            <div className="rounded-[2rem] bg-card-bg/95 p-5 text-foreground shadow-sm ring-1 ring-card-border backdrop-blur">
              <div className="rounded-[1.5rem] bg-background p-5 ring-1 ring-card-border">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-secondary">
                      Plataforma inmobiliaria
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-primary">
                      PropBol
                    </h2>
                  </div>

                  <div className="rounded-2xl bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground">
                    Real
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-card-bg p-4 ring-1 ring-card-border">
                    <p className="text-3xl font-bold text-primary">62</p>
                    <p className="mt-1 text-sm text-foreground/70">
                      estudiantes participantes
                    </p>
                  </div>

                  <div className="rounded-2xl bg-card-bg p-4 ring-1 ring-card-border">
                    <p className="text-3xl font-bold text-primary">100%</p>
                    <p className="mt-1 text-sm text-foreground/70">
                      funcionalidad conectada
                    </p>
                  </div>

                  <div className="rounded-2xl bg-card-bg p-4 ring-1 ring-card-border sm:col-span-2">
                    <p className="text-sm font-semibold text-primary">
                      Sin datos simulados o hardcodeados
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground/70">
                      Cada interacción, desde la búsqueda hasta la pasarela de
                      pagos, se comunica con bases de datos reales y APIs
                      integradas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
            {["Búsqueda", "Publicación", "Pagos"].map((item) => (
              <div
                key={item}
                className="rounded-3xl bg-background/95 p-5 text-primary ring-1 ring-card-border"
              >
                <p className="text-sm font-semibold text-secondary">{item}</p>
                <p className="mt-2 text-sm leading-6 text-primary/75">
                  Módulo integrado con lógica real de negocio dentro de la
                  plataforma.
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ABOUT */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] bg-card-bg p-6 shadow-sm ring-1 ring-card-border md:p-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
              ¿Quiénes somos?
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Una solución académica llevada a nivel profesional.
            </h2>

            <p className="mt-5 text-base leading-8 text-foreground/80">
              Nuestra visión fue trascender el ámbito académico para construir
              una plataforma inmobiliaria robusta, auténtica y útil para el
              usuario. PropBol permite buscar, publicar y visualizar propiedades
              mediante una experiencia clara, moderna y funcional.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] bg-card-bg p-6 shadow-sm ring-1 ring-card-border">
              <p className="mb-3 text-sm font-semibold text-secondary">
                Misión
              </p>
              <h3 className="text-2xl font-bold text-primary">
                Facilitar el acceso al mercado inmobiliario
              </h3>
              <p className="mt-4 text-sm leading-7 text-foreground/75">
                Brindar una plataforma digital segura, accesible y orientada a
                la confianza entre usuarios, propietarios e interesados.
              </p>
            </div>

            <div className="rounded-[2rem] bg-card-bg p-6 shadow-sm ring-1 ring-card-border">
              <p className="mb-3 text-sm font-semibold text-secondary">
                Visión
              </p>
              <h3 className="text-2xl font-bold text-primary">
                Ser referencia inmobiliaria digital
              </h3>
              <p className="mt-4 text-sm leading-7 text-foreground/75">
                Consolidarnos como una plataforma reconocida por su claridad,
                experiencia de usuario e información útil y transparente.
              </p>
            </div>
          </div>
        </div>

        {/* VALUES */}
        <div className="mt-10 rounded-[2rem] bg-card-bg p-6 shadow-sm ring-1 ring-card-border md:p-8 lg:p-10">
          <div className="mb-8 max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
              Valores fundamentales
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Principios que sostienen el desarrollo de PropBol
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {values.map((value, index) => (
              <article
                key={value.title}
                className="rounded-3xl bg-background p-6 ring-1 ring-card-border"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-sm font-bold text-secondary-foreground">
                  0{index + 1}
                </div>

                <h3 className="text-xl font-bold text-primary">
                  {value.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-foreground/75">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* LEADERSHIP */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="rounded-[2rem] bg-primary p-6 text-primary-foreground shadow-sm ring-1 ring-card-border md:p-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-primary-foreground/70">
              Liderazgo
            </p>

            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Dirección del proyecto
            </h2>

            <p className="mt-4 text-base leading-8 text-primary-foreground/75">
              El proyecto fue desarrollado bajo una estructura de dirección,
              gestión ágil, control de calidad y trabajo colaborativo.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {leadership.map((person) => (
              <article
                key={person.role}
                className="rounded-[2rem] bg-card-bg p-6 shadow-sm ring-1 ring-card-border"
              >
                <p className="text-sm font-semibold text-secondary">
                  {person.role}
                </p>
                <h3 className="mt-3 text-xl font-bold text-primary">
                  {person.name}
                </h3>
              </article>
            ))}
          </div>
        </div>

        {/* TEAM */}
        <div className="mt-10 rounded-[2rem] bg-card-bg p-6 shadow-sm ring-1 ring-card-border md:p-8 lg:p-10">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
                Development Team
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
                Equipo ALPHA-ROS
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-7 text-foreground/70">
              Integrantes que participaron en la construcción de la plataforma
              inmobiliaria PropBol.
            </p>
          </div>

          <div className="grid max-h-[520px] gap-3 overflow-y-auto pr-2 scrollbar-custom sm:grid-cols-2 lg:grid-cols-3">
            {developmentTeam.map((member) => (
              <div
                key={member}
                className="rounded-2xl bg-background px-4 py-3 text-sm font-medium text-foreground/80 ring-1 ring-card-border"
              >
                {member}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}