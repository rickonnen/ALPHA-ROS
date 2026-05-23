/**
 * Author: Maicol Ismael Nina Zarate
 * Date: 06/04/2026
 * Description: Full Terms and Conditions for PROPBOL platform.
 * Includes publication system, payments, responsibilities and legal usage.
 * @return Terms and conditions page content.
 */
export default function TermsAndConditionsPage() {
  const plans = [
    {
      name: "Plan Estándar",
      price: "1.99 Bs",
      description: "Límite de 2 publicaciones plus.",
    },
    {
      name: "Plan Avanzado",
      price: "4.99 Bs",
      description: "Límite de 12 publicaciones plus.",
    },
    {
      name: "Plan Profesional",
      price: "19.99 Bs",
      description: "Límite de 50 publicaciones plus.",
    },
  ];

  const sections = [
    {
      title: "1. Aceptación de los términos",
      content: [
        "Al acceder a PropBol, el usuario acepta la vinculación técnica y legal con los presentes términos. Este sistema, desarrollado por el equipo ALPHA-ROS, funciona con datos reales y procesos activos.",
        "El uso indebido de las herramientas de pago, publicación, búsqueda, comentarios o blogs será responsabilidad exclusiva del usuario.",
      ],
    },
    {
      title: "2. Descripción del servicio",
      content: [
        "PropBol es una plataforma digital que facilita la búsqueda, publicación, visualización y promoción de inmuebles en Bolivia.",
        "La plataforma actúa como medio tecnológico de conexión entre usuarios, propietarios, compradores, arrendatarios e interesados, sin garantizar por sí misma la concreción de operaciones inmobiliarias.",
      ],
    },
    {
      title: "3. Uso adecuado de la plataforma",
      content: [
        "El usuario se compromete a utilizar PropBol conforme a la ley, la buena fe y las reglas de convivencia digital.",
      ],
      items: [
        "No publicar información falsa, engañosa o desactualizada.",
        "No suplantar identidad de terceros.",
        "No introducir software malicioso o intentar alterar el sistema.",
        "No realizar spam, fraude, acoso o publicidad ilícita.",
        "No usar la plataforma para fines distintos a los permitidos.",
      ],
    },
    {
      title: "4. Publicaciones e inmuebles",
      content: [
        "El usuario garantiza que los inmuebles publicados son reales, verificables y actualizados. La publicación de datos falsos podrá derivar en la eliminación del contenido y suspensión de la cuenta.",
        "PropBol no certifica la existencia legal de los inmuebles publicados. Es deber del comprador o interesado verificar físicamente los documentos de propiedad antes de realizar cualquier transacción.",
      ],
    },
    {
      title: "5. Planes, precios e IVA",
      content: [
        "PropBol ofrece planes para la promoción de inmuebles. Los precios publicados incluyen el IVA del 13% conforme a la normativa tributaria boliviana.",
        "En contrataciones anuales por 12 meses podrá aplicarse un beneficio de descuento del 10%, cuando la plataforma lo habilite expresamente.",
      ],
    },
    {
      title: "6. Gestión de expiración",
      content: [
        "Al finalizar el periodo contratado, las publicaciones adicionales o plus podrán entrar en estado de suspensión y dejar de ser visibles hasta que el usuario realice la renovación correspondiente.",
      ],
    },
    {
      title: "7. Pasarela de pagos",
      content: [
        "Las transacciones pueden realizarse mediante código QR, generando facturas con los datos proporcionados por la entidad financiera.",
        "También puede utilizarse la red TRON para operaciones con criptoactivos, debido a su accesibilidad en montos mínimos.",
        "PropBol no almacena números de tarjetas, claves bancarias ni credenciales financieras. La plataforma únicamente registra la confirmación del cobro y los datos necesarios de facturación.",
      ],
    },
    {
      title: "8. No reembolsos",
      content: [
        "No se admiten reembolsos una vez ejecutada y confirmada la transacción.",
        "Al completar el proceso de pago, el usuario acepta la ejecución del servicio y renuncia a solicitudes de devolución por servicios ya activados.",
      ],
    },
    {
      title: "9. Propiedad intelectual",
      content: [
        "El usuario mantiene los derechos sobre las fotografías, textos, descripciones y datos de contacto que publique. Al subir contenido, otorga a PropBol una licencia de exhibición no exclusiva dentro de la plataforma.",
        "El diseño, algoritmos de búsqueda, estructura, logos, componentes visuales y código fuente de la plataforma son propiedad intelectual del equipo ALPHA-ROS.",
      ],
    },
    {
      title: "10. Blogs y contenido editorial",
      content: [
        "Todo blog o contenido editorial podrá ser auditado por el Administrador antes de su publicación.",
      ],
      items: [
        "Queda prohibido el plagio.",
        "Queda prohibido el contenido para adultos.",
        "Queda prohibida la propaganda política o religiosa.",
        "Queda prohibido publicar contenido ofensivo, fraudulento o que vulnere derechos de terceros.",
      ],
    },
    {
      title: "11. Limitación de responsabilidad técnica",
      content: [
        "PropBol utiliza una arquitectura orientada a disponibilidad y funcionamiento real. Sin embargo, pueden existir fallos temporales en módulos como mapas, filtros, pagos, carga de imágenes o visualización de publicaciones.",
        "En caso de mantenimiento o error, el sistema podrá notificar mediante texto plano, avisos internos o mensajes de mantenimiento.",
        "La responsabilidad técnica de la plataforma se limita a la restauración del servicio mediante el último respaldo disponible.",
      ],
    },
    {
      title: "12. Suspensión y sanciones",
      content: [
        "PropBol podrá suspender cuentas, ocultar publicaciones, eliminar comentarios o restringir funciones cuando detecte incumplimiento de estos términos, fraude, contenido indebido o comportamiento que afecte a otros usuarios.",
      ],
    },
    {
      title: "13. Ley aplicable",
      content: [
        "Estos Términos y Condiciones se rigen por la legislación del Estado Plurinacional de Bolivia.",
      ],
    },
  ];

  return (
    <section className="w-full bg-background px-4 py-8 text-foreground sm:px-6 md:px-10 md:py-14">
      <div className="mx-auto max-w-7xl">
        {/* HERO */}
        <div className="rounded-[2rem] bg-primary p-6 text-primary-foreground shadow-sm ring-1 ring-card-border md:p-10 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/70 sm:text-sm">
                PROPBOL · ALPHA-ROS
              </p>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Términos y Condiciones de Uso
              </h1>

              <p className="mt-6 max-w-3xl text-base leading-8 text-primary-foreground/80">
                Proyecto Académico ALPHA-ROS. El acceso,
                navegación y uso de PropBol implica la aceptación de las
                condiciones de uso de la plataforma.
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-background p-5 text-primary ring-1 ring-card-border">
              <p className="text-sm font-semibold text-secondary">
                Documento legal
              </p>
              <p className="mt-2 text-2xl font-bold">
                Uso, pagos, publicaciones y responsabilidades
              </p>
              <p className="mt-3 text-sm leading-7 text-primary/75">
                Aplica a usuarios registrados, visitantes, publicadores,
                compradores e interesados en inmuebles.
              </p>
            </div>
          </div>
        </div>

        {/* PLANS */}
        <div className="mt-10">
          <div className="mb-6">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
              Planes de promoción
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Servicios disponibles en la plataforma
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className="rounded-[2rem] bg-card-bg p-6 shadow-sm ring-1 ring-card-border"
              >
                <p className="text-sm font-semibold text-secondary">
                  {plan.name}
                </p>

                <h3 className="mt-3 text-4xl font-bold text-primary">
                  {plan.price}
                </h3>

                <p className="mt-4 text-sm leading-7 text-foreground/75">
                  {plan.description}
                </p>

                <p className="mt-5 rounded-2xl bg-background px-4 py-3 text-sm text-foreground/70 ring-1 ring-card-border">
                  Precio final incluido en plataforma con IVA 13%.
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
          <aside className="rounded-[2rem] bg-card-bg p-5 shadow-sm ring-1 ring-card-border lg:sticky lg:top-24">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-secondary">
              Índice
            </p>

            <nav className="space-y-2">
              {sections.map((section) => (
                <a
                  key={section.title}
                  href={`#${section.title
                    .toLowerCase()
                    .replaceAll(" ", "-")
                    .replaceAll(".", "")
                    .replaceAll(",", "")}`}
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-foreground/70 transition hover:bg-background hover:text-primary"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          <div className="space-y-5">
            {sections.map((section) => (
              <section
                key={section.title}
                id={section.title
                  .toLowerCase()
                  .replaceAll(" ", "-")
                  .replaceAll(".", "")
                  .replaceAll(",", "")}
                className="scroll-mt-28 rounded-[2rem] bg-card-bg p-6 shadow-sm ring-1 ring-card-border md:p-8"
              >
                <h2 className="text-2xl font-bold tracking-tight text-primary md:text-3xl">
                  {section.title}
                </h2>

                <div className="mt-5 space-y-4">
                  {section.content.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-base leading-8 text-foreground/80"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {section.items && (
                  <ul className="mt-5 grid gap-3">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="rounded-2xl bg-background px-4 py-3 text-sm leading-7 text-foreground/75 ring-1 ring-card-border"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}