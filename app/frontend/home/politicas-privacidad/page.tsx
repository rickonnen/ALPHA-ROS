/**
 * Author: Maicol Ismael Nina Zarate
 * Date: 26/03/2026
 * Description: Privacy policy page for the real estate platform.
 * It explains how user data is collected, used, protected and stored.
 * @return Privacy policy page content.
 */
export default function PrivacyPolicyPage() {
  return (
    <section className="w-full bg-[#F4EFE6] px-6 py-14 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-4xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#C26E5A]">
            PROPBOL
          </p>

          <h1 className="mb-4 text-5xl font-bold tracking-tight text-[#1F3A4D]">
            Políticas de Privacidad
          </h1>

          <p className="max-w-3xl text-base leading-8 text-[#4E4E4E]">
            En PROPBOL respetamos la privacidad de nuestros usuarios y
            procuramos tratar la información personal de forma responsable,
            informada y segura.
          </p>
        </div>

        <div className="rounded-[28px] bg-[#EEE8DE] p-8 shadow-sm ring-1 ring-[#DDD5C9] md:p-12">
          <div className="space-y-8">
            <section className="border-b border-[#D8D3CC] pb-6 last:border-b-0 last:pb-0">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#1F3A4D]">
                1. Información que recopilamos
              </h2>
              <p className="text-base leading-8 text-[#4E4E4E]">
                Podemos recopilar información que el usuario proporciona
                directamente, como nombre, correo electrónico, número de
                teléfono, datos de cuenta, mensajes enviados por formularios y
                datos incluidos en publicaciones de inmuebles.
              </p>
              <p className="mt-4 text-base leading-8 text-[#4E4E4E]">
                También podemos recopilar información técnica de navegación,
                como dirección IP, tipo de navegador, páginas visitadas, fecha y
                hora de acceso, identificadores de dispositivo y otros datos
                necesarios para la seguridad, estabilidad y análisis básico del
                funcionamiento de la plataforma.
              </p>
            </section>

            <section className="border-b border-[#D8D3CC] pb-6 last:border-b-0 last:pb-0">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#1F3A4D]">
                2. Finalidades del tratamiento
              </h2>
              <p className="mb-4 text-base leading-8 text-[#4E4E4E]">
                La información podrá ser utilizada para:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-base leading-8 text-[#4E4E4E]">
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

            <section className="border-b border-[#D8D3CC] pb-6 last:border-b-0 last:pb-0">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#1F3A4D]">
                3. Base de tratamiento
              </h2>
              <p className="text-base leading-8 text-[#4E4E4E]">
                PROPBOL trata los datos en la medida necesaria para prestar sus
                servicios, atender interacciones solicitadas por el usuario,
                gestionar la seguridad de la plataforma y, cuando corresponda,
                sobre la base del consentimiento del titular.
              </p>
            </section>

            <section className="border-b border-[#D8D3CC] pb-6 last:border-b-0 last:pb-0">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#1F3A4D]">
                4. Compartición de información
              </h2>
              <p className="text-base leading-8 text-[#4E4E4E]">
                PROPBOL no vende datos personales. Sin embargo, cierta
                información puede ser compartida con proveedores tecnológicos
                que apoyan la operación de la plataforma, tales como servicios
                de hosting, infraestructura, seguridad, correo o analítica,
                únicamente en la medida necesaria para la prestación del
                servicio.
              </p>
            </section>

            <section className="border-b border-[#D8D3CC] pb-6 last:border-b-0 last:pb-0">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#1F3A4D]">
                5. Hosting e infraestructura
              </h2>
              <p className="text-base leading-8 text-[#4E4E4E]">
                La plataforma puede operar sobre infraestructura tecnológica de
                terceros, incluido Vercel. En consecuencia, determinados datos
                técnicos o personales pueden ser almacenados, procesados o
                transmitidos fuera de Bolivia, de acuerdo con las condiciones
                técnicas del proveedor y las medidas de seguridad aplicables.
              </p>
            </section>

            <section className="border-b border-[#D8D3CC] pb-6 last:border-b-0 last:pb-0">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#1F3A4D]">
                6. Conservación de datos
              </h2>
              <p className="text-base leading-8 text-[#4E4E4E]">
                Conservaremos la información personal durante el tiempo
                necesario para cumplir las finalidades descritas en esta
                política, atender obligaciones legales, resolver controversias y
                mantener la seguridad e integridad de la plataforma.
              </p>
            </section>

            <section className="border-b border-[#D8D3CC] pb-6 last:border-b-0 last:pb-0">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#1F3A4D]">
                7. Derechos del usuario
              </h2>
              <p className="text-base leading-8 text-[#4E4E4E]">
                El titular de los datos podrá solicitar, cuando corresponda,
                acceso, corrección, actualización o eliminación de su
                información personal, así como formular observaciones sobre el
                tratamiento de sus datos mediante los canales de contacto
                habilitados por PROPBOL.
              </p>
            </section>

            <section className="border-b border-[#D8D3CC] pb-6 last:border-b-0 last:pb-0">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#1F3A4D]">
                8. Seguridad
              </h2>
              <p className="text-base leading-8 text-[#4E4E4E]">
                PROPBOL adopta medidas razonables de seguridad administrativas,
                técnicas y organizativas para proteger la información frente a
                accesos no autorizados, pérdida, alteración o divulgación
                indebida. No obstante, ningún sistema es absolutamente
                infalible.
              </p>
            </section>

            <section className="border-b border-[#D8D3CC] pb-6 last:border-b-0 last:pb-0">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#1F3A4D]">
                9. Cookies y tecnologías similares
              </h2>
              <p className="text-base leading-8 text-[#4E4E4E]">
                La plataforma puede utilizar cookies o tecnologías similares
                para recordar preferencias, mantener sesiones activas, mejorar
                la experiencia del usuario y obtener información estadística o
                técnica sobre el uso del sitio.
              </p>
            </section>

            <section className="border-b border-[#D8D3CC] pb-6 last:border-b-0 last:pb-0">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#1F3A4D]">
                10. Cambios a esta política
              </h2>
              <p className="text-base leading-8 text-[#4E4E4E]">
                PROPBOL podrá modificar esta Política de Privacidad en cualquier
                momento. La versión vigente será la publicada en esta sección.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#1F3A4D]">
                11. Contacto
              </h2>
              <p className="text-base leading-8 text-[#4E4E4E]">
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
