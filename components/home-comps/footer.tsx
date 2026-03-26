/**
 * Dev: Maicol Ismael Nina Zarate
 * Date: 25/03/2026
 * Feature: Frontend footer with internal navigation and social links.
 * Return: Footer component rendered across frontend pages.
 */
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[#d8d1c7] bg-[#E7E1D7]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-10 md:grid-cols-3 md:px-10">
        <div className="flex items-start">
          <Link href="/frontend" aria-label="Ir al inicio">
            <img
              src="/logo-trans-exacto.svg"
              alt="Propbol logo"
              className="h-30 w-auto object-contain md:h-34"
            />
          </Link>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold text-[#1F3A4D]">
            Explorar
          </h3>
          <ul className="space-y-2 text-[15px] text-[#2E2E2E]">
            <li>
              <Link
                href="/frontend/cobros"
                className="transition-colors duration-200 hover:text-[#C26E5A] focus:outline-none focus:ring-2 focus:ring-[#1F3A4D] focus:ring-offset-2 focus:ring-offset-[#E7E1D7] rounded-sm"
              >
                Compra
              </Link>
            </li>
            <li>
              <Link
                href="/frontend/search"
                className="transition-colors duration-200 hover:text-[#C26E5A] focus:outline-none focus:ring-2 focus:ring-[#1F3A4D] focus:ring-offset-2 focus:ring-offset-[#E7E1D7] rounded-sm"
              >
                Alquiler
              </Link>
            </li>
            <li>
              <Link
                href="/frontend/mapas"
                className="transition-colors duration-200 hover:text-[#C26E5A] focus:outline-none focus:ring-2 focus:ring-[#1F3A4D] focus:ring-offset-2 focus:ring-offset-[#E7E1D7] rounded-sm"
              >
                Anticrético
              </Link>
            </li>
            <li>
              <Link
                href="/frontend/publicacion"
                className="transition-colors duration-200 hover:text-[#C26E5A] focus:outline-none focus:ring-2 focus:ring-[#1F3A4D] focus:ring-offset-2 focus:ring-offset-[#E7E1D7] rounded-sm"
              >
                Publica tu inmueble
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold text-[#1F3A4D]">
            Conoce más
          </h3>
          <ul className="space-y-2 text-[15px] text-[#2E2E2E]">
            <li>
              <Link
                href="/frontend/home/sobre-nosotros"
                className="transition-colors duration-200 hover:text-[#C26E5A] focus:outline-none focus:ring-2 focus:ring-[#1F3A4D] focus:ring-offset-2 focus:ring-offset-[#E7E1D7] rounded-sm"
              >
                Sobre nosotros
              </Link>
            </li>
            <li>
              <Link
                href="/frontend/home/terminos-condiciones"
                className="transition-colors duration-200 hover:text-[#C26E5A] focus:outline-none focus:ring-2 focus:ring-[#1F3A4D] focus:ring-offset-2 focus:ring-offset-[#E7E1D7] rounded-sm"
              >
                Términos y condiciones
              </Link>
            </li>
            <li>
              <Link
                href="/frontend/home/politicas-privacidad"
                className="transition-colors duration-200 hover:text-[#C26E5A] focus:outline-none focus:ring-2 focus:ring-[#1F3A4D] focus:ring-offset-2 focus:ring-offset-[#E7E1D7] rounded-sm"
              >
                Políticas de privacidad
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#d8d1c7]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-5 px-6 py-6 md:flex-row md:px-10">
          <span className="text-sm text-[#4E4E4E]">Síguenos:</span>

          <div className="flex items-center gap-5">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-[#2E2E2E] transition-all duration-200 hover:text-[#C26E5A] focus:outline-none focus:ring-2 focus:ring-[#1F3A4D] focus:ring-offset-2 focus:ring-offset-[#E7E1D7] rounded-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-8 w-8"
              >
                <path d="M13 22v-8h3l1-4h-4V7.5c0-1.03.34-1.5 1.5-1.5H17V2.14C16.62 2.09 15.68 2 14.58 2 11.85 2 10 3.66 10 6.7V10H7v4h3v8h3Z" />
              </svg>
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-[#2E2E2E] transition-all duration-200 hover:text-[#C26E5A] focus:outline-none focus:ring-2 focus:ring-[#1F3A4D] focus:ring-offset-2 focus:ring-offset-[#E7E1D7] rounded-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-8 w-8"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4.25" />
                <circle
                  cx="17.3"
                  cy="6.7"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </a>

            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="text-[#2E2E2E] transition-all duration-200 hover:text-[#C26E5A] focus:outline-none focus:ring-2 focus:ring-[#1F3A4D] focus:ring-offset-2 focus:ring-offset-[#E7E1D7] rounded-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-8 w-8"
              >
                <path d="M15.5 3c.45 1.78 1.6 3.26 3.5 4.01V10.1c-1.22-.04-2.41-.38-3.5-1v5.73c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6c.3 0 .6.02.89.07v3.1a3 3 0 1 0 1.11 2.33V3h4Z" />
              </svg>
            </a>
          </div>

          <span className="text-sm text-[#5E5E5E]">© 2026 PROPBOL</span>
        </div>
      </div>
    </footer>
  );
}
