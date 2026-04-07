/**
 * Author: Maicol Ismael Nina Zarate
 * Date: 06/04/2026
 * Description: Full Terms and Conditions for PROPBOL platform.
 * Includes publication system, payments, responsibilities and legal usage.
 * @return Terms and conditions page content.
 */
export default function TermsAndConditionsPage() {
  return (
    <section className="w-full bg-background px-6 py-14 md:px-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-10 max-w-4xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-secondary">
            PROPBOL
          </p>

          <h1 className="mb-4 text-5xl font-bold text-primary">
            Términos y Condiciones
          </h1>

          <p className="text-foreground/80 leading-8">
            El acceso, navegación y uso de PROPBOL implica la aceptación expresa
            de los presentes Términos y Condiciones, los cuales son obligatorios
            y vinculantes para todos los usuarios de la plataforma.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-secondary-fund p-8 md:p-12 ring-1 ring-border space-y-10">

          {/* 1 */}
          <section>
            <h2 className="text-3xl font-bold text-primary">1. Aceptación</h2>
            <p className="mt-3 text-foreground/80 leading-8">
              Toda persona que acceda a PROPBOL acepta sin reservas estos términos.
              En caso de desacuerdo, deberá abstenerse de utilizar la plataforma.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-3xl font-bold text-primary">2. Objeto</h2>
            <p className="mt-3 text-foreground/80 leading-8">
              PROPBOL es una plataforma digital que facilita la publicación y
              búsqueda de inmuebles en Bolivia, actuando únicamente como intermediario
              entre usuarios.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-3xl font-bold text-primary">3. Uso adecuado</h2>
            <p className="mt-3 text-foreground/80 leading-8">
              El usuario se compromete a utilizar la plataforma conforme a la ley,
              quedando prohibido:
            </p>
            <ul className="mt-3 space-y-2 text-foreground/80">
              <li>• Publicar información falsa o engañosa.</li>
              <li>• Realizar spam o publicidad ilícita.</li>
              <li>• Suplantar identidad.</li>
              <li>• Introducir software malicioso.</li>
              <li>• Alterar el funcionamiento del sistema.</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-3xl font-bold text-primary">4. Cuentas</h2>
            <p className="mt-3 text-foreground/80 leading-8">
              El usuario es responsable de la veracidad de sus datos. Se prohíben
              cuentas falsas o duplicadas, pudiendo ser suspendidas sin previo aviso.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-3xl font-bold text-primary">5. Veracidad de publicaciones</h2>
            <p className="mt-3 text-foreground/80 leading-8">
              El usuario garantiza que los inmuebles publicados son reales,
              verificables y actualizados. La publicación de datos falsos podrá
              derivar en la eliminación del contenido y suspensión de la cuenta.
            </p>
          </section>

          {/* 6 FRAUDE */}
          <section>
            <h2 className="text-3xl font-bold text-primary">6. Protección contra fraude</h2>
            <p className="mt-3 text-foreground/80 leading-8">
              PROPBOL no valida la titularidad legal de los inmuebles publicados.
              El usuario es responsable de verificar la autenticidad de los anuncios
              antes de realizar cualquier transacción.
            </p>
          </section>

          {/* 7 CUPOS */}
          <section>
            <h2 className="text-3xl font-bold text-primary">7. Sistema de cupos</h2>
            <p className="mt-3 text-foreground/80 leading-8">
              Al registrarse, el usuario recibe 2 cupos gratuitos, únicos e intransferibles.
              Cada publicación consume un cupo.
            </p>
            <p className="mt-2 text-foreground/80 leading-8">
              Los cupos utilizados son irreversibles y no serán devueltos,
              incluso si el anuncio es eliminado o cancelado.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-3xl font-bold text-primary">8. Compra de cupos</h2>
            <p className="mt-3 text-foreground/80 leading-8">
              Una vez agotados los cupos gratuitos, el usuario deberá adquirir
              planes adicionales. Los precios, vigencia y beneficios serán
              mostrados antes del pago.
            </p>
          </section>

          {/* 9 PAGOS */}
          <section>
            <h2 className="text-3xl font-bold text-primary">9. Pagos QR</h2>
            <p className="mt-3 text-foreground/80 leading-8">
              El sistema utiliza pagos mediante código QR. El usuario debe transferir
              el monto exacto indicado.
            </p>
            <p className="mt-2 text-foreground/80 leading-8">
              Para completar el proceso, es obligatorio presionar "Verificar Pago"
              y "Aceptar". De lo contrario, el pago no será registrado.
            </p>
          </section>

          {/* 10 VALIDACION */}
          <section>
            <h2 className="text-3xl font-bold text-primary">10. Validación de pagos</h2>
            <p className="mt-3 text-foreground/80 leading-8">
              La validación es manual y puede demorar varias horas.
            </p>
            <ul className="mt-3 space-y-2 text-foreground/80">
              <li>• Verificando: en revisión</li>
              <li>• Aceptado: cupos acreditados</li>
              <li>• Rechazado: pago inválido</li>
            </ul>
            <p className="mt-2 text-foreground/80 leading-8">
              Un pago puede ser rechazado si el monto es incorrecto, no se verifica
              en la cuenta bancaria o el comprobante es inválido.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-3xl font-bold text-primary">11. Responsabilidad</h2>
            <p className="mt-3 text-foreground/80 leading-8">
              El usuario es responsable de realizar pagos correctos y conservar
              comprobantes como respaldo.
            </p>
          </section>

          {/* 12 NO REEMBOLSO */}
          <section>
            <h2 className="text-3xl font-bold text-primary">12. No reembolso</h2>
            <p className="mt-3 text-foreground/80 leading-8">
              Una vez validado el pago, no se realizarán devoluciones bajo ninguna circunstancia.
            </p>
            <p className="mt-2 text-foreground/80 leading-8">
              Al presionar "Verificar Pago", el usuario acepta la ejecución completa del servicio
              y renuncia a cualquier solicitud de reembolso.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-3xl font-bold text-primary">13. Suspensión</h2>
            <p className="mt-3 text-foreground/80 leading-8">
              PROPBOL podrá suspender cuentas o eliminar contenido que incumpla estas normas.
            </p>
          </section>

          {/* 14 */}
          <section>
            <h2 className="text-3xl font-bold text-primary">14. Propiedad intelectual</h2>
            <p className="mt-3 text-foreground/80 leading-8">
              Todo el contenido de la plataforma está protegido por derechos legales.
            </p>
          </section>

          {/* 15 */}
          <section>
            <h2 className="text-3xl font-bold text-primary">15. Limitación de responsabilidad</h2>
            <p className="mt-3 text-foreground/80 leading-8">
              PROPBOL no garantiza la concreción de transacciones ni se responsabiliza
              por acuerdos entre usuarios.
            </p>
          </section>

          {/* 16 */}
          <section>
            <h2 className="text-3xl font-bold text-primary">16. Ley aplicable</h2>
            <p className="mt-3 text-foreground/80 leading-8">
              Este documento se rige por la legislación del Estado Plurinacional de Bolivia.
            </p>
          </section>

        </div>
      </div>
    </section>
  );
}