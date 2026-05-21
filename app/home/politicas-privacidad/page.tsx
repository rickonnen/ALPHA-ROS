/**
 * Author: Maicol Ismael Nina Zarate
 * Date: 26/03/2026
 * Description: Privacy policy page for the real estate platform.
 * It explains how user data is collected, used, protected and stored.
 * @return Privacy policy page content.
 */
export default function PrivacyPolicyPage() {
  const dataSources = [
    {
      title: "Registro directo y OAuth",
      description:
        "Capturamos correo electrónico e identificadores únicos mediante Google, Discord, LinkedIn y Facebook.",
    },
    {
      title: "Datos de perfil",
      description:
        "Se puede almacenar nombre, apellidos, teléfono y, opcionalmente, género y estado civil.",
    },
    {
      title: "Geolocalización",
      description:
        "Utilizamos OpenStreetMap y Leaflet. Si el usuario concede permisos, se puede capturar latitud y longitud para funciones de mapa.",
    },
  ];

  const sections = [
    {
      title: "1. Recolección de información",
      content: [
        "Nuestra arquitectura interactúa con datos reales mediante registro directo, autenticación OAuth, formularios de perfil, publicaciones de inmuebles y servicios de geolocalización.",
        "Cuando el usuario inicia sesión o utiliza funciones de la plataforma, pueden registrarse datos técnicos como dirección IP, fecha, hora, navegador, identificadores de dispositivo y actividad básica de navegación.",
      ],
    },
    {
      title: "2. Uso y finalidad del tratamiento",
      content: [
        "Los datos no se venden a terceros. Se procesan internamente para operar, proteger y mejorar la plataforma.",
      ],
      items: [
        "Algoritmos de recomendación basados en historial de búsqueda y etiquetas de interés.",
        "Sugerencias de inmuebles en el Home Page.",
        "Mensajes de bienvenida, confirmaciones de pago y alertas de seguridad vía Gmail y WhatsApp.",
        "Registro de IP y geolocalización para auditoría en caso de reportes de estafa o contenido indebido.",
      ],
    },
    {
      title: "3. Almacenamiento y retención",
      content: [
        "Para garantizar la integridad referencial de la base de datos, ciertas entidades no se eliminan físicamente de inmediato.",
        "Las publicaciones y comentarios pueden aplicar una política de Soft Delete, es decir, se marcan como inactivos u ocultos sin eliminarse de forma inmediata.",
      ],
    },
    {
      title: "4. Baja o desactivación de cuenta",
      content: [
        "No existe eliminación total instantánea. El usuario puede desactivar su cuenta, lo cual restringe el acceso y oculta su información del dominio público.",
        "Algunos registros históricos pueden conservarse por razones de seguridad técnica, auditoría, prevención de fraude o integridad del sistema.",
      ],
    },
    {
      title: "5. Local Storage y tecnologías similares",
      content: [
        "Utilizamos almacenamiento local del navegador para persistir actividad del usuario, mejorar la velocidad de carga y mantener ciertas preferencias sin depender exclusivamente de cookies.",
      ],
    },
    {
      title: "6. Compartición de información",
      content: [
        "PropBol no vende datos personales. Sin embargo, puede compartir información mínima necesaria con proveedores tecnológicos que apoyan la operación de la plataforma, como hosting, infraestructura, seguridad, correo, analítica o servicios de mapas.",
        "También podrán compartirse datos con autoridades competentes en caso de investigaciones por fraude inmobiliario o requerimientos legales válidos.",
      ],
    },
    {
      title: "7. Moderación y sanciones",
      content: [
        "La plataforma cuenta con sistema de reportes. El Administrador puede tomar medidas cuando existan indicios de fraude, uso indebido, contenido ofensivo o vulneración de derechos.",
      ],
      items: [
        "Suspender cuentas por 7 días, 30 días o de forma permanente.",
        "Eliminar comentarios ofensivos o publicaciones indebidas.",
        "Restringir funciones de usuarios reportados.",
        "Compartir datos de contacto con autoridades competentes cuando corresponda.",
      ],
    },
    {
      title: "8. Derechos del titular",
      content: [
        "El usuario puede actualizar su información desde el apartado Mi Perfil, desactivar notificaciones automáticas y solicitar soporte técnico en caso de vulneración o dudas sobre sus datos.",
      ],
    },
    {
      title: "9. Seguridad",
      content: [
        "PropBol adopta medidas razonables de seguridad administrativas, técnicas y organizativas para proteger la información frente a accesos no autorizados, pérdida, alteración o divulgación indebida.",
        "Ningún sistema digital es absolutamente infalible, por lo que el usuario también debe cuidar sus credenciales y verificar la información antes de realizar operaciones inmobiliarias.",
      ],
    },
    {
      title: "10. Cambios a esta política",
      content: [
        "PropBol podrá modificar esta Política de Privacidad cuando sea necesario. La versión vigente será la publicada en esta sección.",
      ],
    },
    {
      title: "11. Contacto",
      content: [
        "Para consultas relacionadas con privacidad, tratamiento de datos o soporte técnico, el usuario podrá comunicarse mediante los canales habilitados por la plataforma.",
      ],
    },
  ];

  return (
    <section className="w-full bg-background px-4 py-8 text-foreground sm:px-6 md:px-10 md:py-14">
      <div className="mx-auto max-w-7xl">
        {/* HERO */}
        <div className="overflow-hidden rounded-[2rem] bg-card-bg shadow-sm ring-1 ring-card-border">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-6 md:p-10 lg:p-12">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-secondary sm:text-sm">
                PROPBOL · Protección de datos
              </p>

              <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
                Políticas de Privacidad
              </h1>

              <p className="mt-6 max-w-3xl text-base leading-8 text-foreground/80">
                En PropBol respetamos la privacidad de nuestros usuarios y
                tratamos la información personal de forma responsable, informada
                y segura.
              </p>

              <div className="mt-8 rounded-3xl bg-background p-5 ring-1 ring-card-border">
                <p className="text-sm font-semibold text-secondary">
                  Compromiso de protección de datos
                </p>
                <p className="mt-2 text-sm leading-7 text-foreground/75">
                  La plataforma procesa datos reales únicamente para operar,
                  proteger, recomendar, notificar y mejorar la experiencia
                  inmobiliaria del usuario.
                </p>
              </div>
            </div>

            <div className="bg-primary p-6 text-primary-foreground md:p-10 lg:p-12">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-foreground/70">
                Principios
              </p>

              <div className="mt-8 grid gap-4">
                {["No vendemos datos", "Soft Delete", "Seguridad", "Control del usuario"].map(
                  (item, index) => (
                    <div
                      key={item}
                      className="rounded-3xl bg-background p-5 text-primary ring-1 ring-card-border"
                    >
                      <p className="text-sm font-bold text-secondary">
                        0{index + 1}
                      </p>
                      <h2 className="mt-2 text-xl font-bold">{item}</h2>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* DATA SOURCES */}
        <div className="mt-10">
          <div className="mb-6">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
              Fuentes de información
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Qué datos puede recopilar la plataforma
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {dataSources.map((source) => (
              <article
                key={source.title}
                className="rounded-[2rem] bg-card-bg p-6 shadow-sm ring-1 ring-card-border"
              >
                <h3 className="text-xl font-bold text-primary">
                  {source.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-foreground/75">
                  {source.description}
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