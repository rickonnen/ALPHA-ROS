import Link from "next/link";

/**
 * Author: Maicol Ismael Nina Zarate
 * Date: 26/03/2026
 * Description: Footer component for frontend pages with internal navigation,
 * legal access links, social media links and home redirection through the logo.
 * @return Footer component rendered at the bottom of frontend pages.
 */
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[#d8d1c7] bg-[#E7E1D7]">
      <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-10 px-6 py-10 md:grid-cols-[1.55fr_0.95fr_0.95fr] md:gap-16 md:px-10 lg:gap-24 xl:max-w-[1650px] xl:grid-cols-[1.8fr_1fr_1fr] xl:px-16 2xl:px-24">
        <div className="flex items-start">
          <Link
            href="/"
            aria-label="Go to home page"
            className="inline-flex rounded-sm transition-opacity duration-200 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7]"
          >
            <img
              src="/logo-principal.svg"
              alt="Portal logo"
              className="h-10 w-auto object-contain lg:h-6 xl:h-8 2xl:h-12"
            />
          </Link>
        </div>

        <div className="md:pl-6 lg:pl-10 xl:pl-16">
          <h3 className="mb-4 text-lg font-semibold text-[#1F3A4D]">
            Explorar
          </h3>
          <ul className="space-y-2 text-[15px] text-[#2E2E2E]">
            <li>
              <Link
                href="/frontend/cobros"
                className="rounded-sm transition-colors duration-200 hover:text-[#C26E5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7]"
              >
                Compra
              </Link>
            </li>
            <li>
              <Link
                href="/frontend/search"
                className="rounded-sm transition-colors duration-200 hover:text-[#C26E5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7]"
              >
                Alquiler
              </Link>
            </li>
            <li>
              <Link
                href="/frontend/mapas"
                className="rounded-sm transition-colors duration-200 hover:text-[#C26E5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7]"
              >
                Anticrético
              </Link>
            </li>
            <li>
              <Link
                href="/frontend/publicacion"
                className="rounded-sm transition-colors duration-200 hover:text-[#C26E5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7]"
              >
                Publica tu inmueble
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:pl-4 lg:pl-8 xl:pl-12">
          <h3 className="mb-4 text-lg font-semibold text-[#1F3A4D]">
            Información
          </h3>
          <ul className="space-y-2 text-[15px] text-[#2E2E2E]">
            <li>
              <Link
                href="/frontend/home/sobre-nosotros"
                className="rounded-sm transition-colors duration-200 hover:text-[#C26E5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7]"
              >
                Sobre nosotros
              </Link>
            </li>
            <li>
              <Link
                href="/frontend/home/terminos-condiciones"
                className="rounded-sm transition-colors duration-200 hover:text-[#C26E5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7]"
              >
                Términos y condiciones
              </Link>
            </li>
            <li>
              <Link
                href="/frontend/home/politicas-privacidad"
                className="rounded-sm transition-colors duration-200 hover:text-[#C26E5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7]"
              >
                Políticas de privacidad
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#d8d1c7]">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col items-center justify-center gap-5 px-6 py-6 md:flex-row md:px-10 xl:max-w-[1650px] xl:px-16 2xl:px-24">
          <span className="text-base text-[#4E4E4E]">Síguenos:</span>

          <div className="flex items-center gap-6">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="inline-flex h-11 w-11 items-center justify-center rounded-sm transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7]"
            >
              <img
                src="https://www.svgrepo.com/show/500854/facebook.svg"
                alt="Facebook icon"
                className="h-12 w-12"
                style={{ transform: "scale(1.12)" }}
                loading="lazy"
              />
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex h-11 w-11 items-center justify-center rounded-sm transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7]"
            >
              <img
                src="https://www.svgrepo.com/show/521711/instagram.svg"
                alt="Instagram icon"
                className="h-10 w-10"
                loading="lazy"
              />
            </a>

            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="inline-flex h-11 w-11 items-center justify-center rounded-sm transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7]"
            >
              <img
                src="https://www.svgrepo.com/show/473806/tiktok.svg"
                alt="TikTok icon"
                className="h-8 w-8"
                style={{ transform: "scale(1.12)" }}
                loading="lazy"
              />
            </a>
          </div>

          <span className="text-base text-[#5E5E5E]">© 2026 PROPBOL</span>
        </div>
      </div>
    </footer>
  );
}
