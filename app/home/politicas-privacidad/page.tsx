/**
 * Author: Maicol Ismael Nina Zarate
 * Date: 26/03/2026
 * Description: Privacy policy page for the real estate platform.
 * It explains how user data is collected, used, protected and stored.
 * @return Privacy policy page content.
 */
export default function PrivacyPolicyPage() {
  return (
    <section className="w-full bg-background px-6 py-14 text-foreground md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-4xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-secondary">
            PROPBOL
          </p>

          <h1 className="mb-4 text-5xl font-bold tracking-tight text-primary">
            Políticas de Privacidad
          </h1>

          <p className="max-w-3xl text-base leading-8 text-foreground/80">
            En PROPBOL respetamos la privacidad de nuestros usuarios y
            procuramos tratar la información personal de forma responsable,
            informada y segura.
          </p>
        </div>

        <div className="rounded-[28px] bg-card-bg p-8 shadow-sm ring-1 ring-card-border md:p-12">
          <div className="space-y-8">
            <section className="border-b border-card-border pb-6 last:border-b-0 last:pb-0">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary">
                1. Información que recopilamos
              </h2>
              <p className="text-base leading-8 text-foreground/80">
                Podemos recopilar información que el usuario proporciona
                directamente, como nombre, correo electrónico, número de
                teléfono, datos de cuenta, mensajes enviados por formularios y
                datos incluidos en publicaciones de inmuebles.
              </p>
              <p className="mt-4 text-base leading-8 text-foreground/80">
                También podemos recopilar información técnica de navegación,
                como dirección IP, tipo de navegador, páginas visitadas, fecha y
                hora de acceso, identificadores de dispositivo y otros datos
                necesarios para la seguridad, estabilidad y análisis básico del
                funcionamiento de la plataforma.
              </p>
              <p className="mt-4 text-base leading-8 text-foreground/80">
                Cuando el usuario inicia sesión en la plataforma, también puede
                registrarse automáticamente telemetría técnica asociada a ese
                acceso, incluyendo la dirección IP de la solicitud y, cuando el
                navegador o dispositivo lo permita, coordenadas geográficas
                obtenidas en ese momento. Si dichos datos de ubicación no se
                encuentran disponibles o no pueden obtenerse, el inicio de
                sesión podrá completarse igualmente.
              </p>
            </section>

            <section className="border-b border-card-border pb-6 last:border-b-0 last:pb-0">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary">
                2. Finalidades del tratamiento
              </h2>
              <p className="mb-4 text-base leading-8 text-foreground/80">
                La información podrá ser utilizada para:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-base leading-8 text-foreground/80">
                <li>crear y administrar cuentas de usuario;</li>
                <li>permitir la publicación y visualización de inmuebles;</li>
                <li>facilitar el contacto entre usuarios;</li>
                <li>responder consultas, solicitudes o reclamos;</li>
                <li>mejorar la seguridad y funcionamiento de la plataforma;</li>
                <li>
                  cumplir obligaciones legales o requerimientos válidos de
                  autoridad competente.
                </li>
              </ul>
            </section>

            <section className="border-b border-card-border pb-6 last:border-b-0 last:pb-0">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary">
                3. Base de tratamiento
              </h2>
              <p className="text-base leading-8 text-foreground/80">
                PROPBOL trata los datos en la medida necesaria para prestar sus
                servicios, atender interacciones solicitadas por el usuario,
                gestionar la seguridad de la plataforma y, cuando corresponda,
                sobre la base del consentimiento del titular.
              </p>
            </section>

            <section className="border-b border-card-border pb-6 last:border-b-0 last:pb-0">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary">
                4. Compartición de información
              </h2>
              <p className="text-base leading-8 text-foreground/80">
                PROPBOL no vende datos personales. Sin embargo, cierta
                información puede ser compartida con proveedores tecnológicos
                que apoyan la operación de la plataforma, tales como servicios
                de hosting, infraestructura, seguridad, correo o analítica,
                únicamente en la medida necesaria para la prestación del
                servicio.
              </p>
            </section>

            <section className="border-b border-card-border pb-6 last:border-b-0 last:pb-0">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary">
                5. Hosting e infraestructura
              </h2>
              <p className="text-base leading-8 text-foreground/80">
                La plataforma puede operar sobre infraestructura tecnológica de
                terceros, incluido Vercel. En consecuencia, determinados datos
                técnicos o personales pueden ser almacenados, procesados o
                transmitidos fuera de Bolivia, de acuerdo con las condiciones
                técnicas del proveedor y las medidas de seguridad aplicables.
              </p>
            </section>

            <section className="border-b border-card-border pb-6 last:border-b-0 last:pb-0">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary">
                6. Conservación de datos
              </h2>
              <p className="text-base leading-8 text-foreground/80">
                Conservaremos la información personal durante el tiempo
                necesario para cumplir las finalidades descritas en esta
                política, atender obligaciones legales, resolver controversias y
                mantener la seguridad e integridad de la plataforma.
              </p>
            </section>

            <section className="border-b border-card-border pb-6 last:border-b-0 last:pb-0">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary">
                7. Derechos del usuario
              </h2>
              <p className="text-base leading-8 text-foreground/80">
                El titular de los datos podrá solicitar, cuando corresponda,
                acceso, corrección, actualización o eliminación de su
                información personal, así como formular observaciones sobre el
                tratamiento de sus datos mediante los canales de contacto
                habilitados por PROPBOL.
              </p>
            </section>

            <section className="border-b border-card-border pb-6 last:border-b-0 last:pb-0">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary">
                8. Seguridad
              </h2>
              <p className="text-base leading-8 text-foreground/80">
                PROPBOL adopta medidas razonables de seguridad administrativas,
                técnicas y organizativas para proteger la información frente a
                accesos no autorizados, pérdida, alteración o divulgación
                indebida. No obstante, ningún sistema es absolutamente
                infalible.
              </p>
            </section>

            <section className="border-b border-card-border pb-6 last:border-b-0 last:pb-0">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary">
                9. Cookies y tecnologías similares
              </h2>
              <p className="text-base leading-8 text-foreground/80">
                La plataforma puede utilizar cookies o tecnologías similares
                para recordar preferencias, mantener sesiones activas, mejorar
                la experiencia del usuario y obtener información estadística o
                técnica sobre el uso del sitio.
              </p>
            </section>

            <section className="border-b border-card-border pb-6 last:border-b-0 last:pb-0">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary">
                10. Cambios a esta política
              </h2>
              <p className="text-base leading-8 text-foreground/80">
                PROPBOL podrá modificar esta Política de Privacidad en cualquier
                momento. La versión vigente será la publicada en esta sección.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary">
                11. Contacto
              </h2>
              <p className="text-base leading-8 text-foreground/80">
                Para consultas relacionadas con privacidad o tratamiento de
                datos, el usuario podrá contactarse a través de los canales de
                atención habilitados por la plataforma.
              </p>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}