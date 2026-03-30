import Link from "next/link";

/**
 * Author: Maicol Ismael Nina Zarate
 * Date: 26/03/2026
 * Description: Footer component for frontend pages with internal navigation,
 * legal access links, social media links and home redirection through the logo.
 * @return Footer component rendered at the bottom of frontend pages.
 */
const strBaseLinkClasses = "inline-block rounded-sm text-[#2E2E2E] transition-all duration-300 hover:text-[#C26E5A] hover:drop-shadow-[0_0_8px_#c26e5a] hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7]";

const strSocialBtnClasses = "inline-flex h-11 w-11 items-center justify-center rounded-sm transition-all duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7]";

const arrExploreLinks = [
  { strHref: "/frontend/cobros", strLabel: "Compra" },
  { strHref: "/frontend/search", strLabel: "Alquiler" },
  { strHref: "/frontend/mapas", strLabel: "Anticrético" },
  { strHref: "/frontend/publicacion", strLabel: "Publica tu inmueble" },
];

const arrInfoLinks = [
  { strHref: "/frontend/home/sobre-nosotros", strLabel: "Sobre nosotros" },
  { strHref: "/frontend/home/terminos-condiciones", strLabel: "Términos y condiciones" },
  { strHref: "/frontend/home/politicas-privacidad", strLabel: "Políticas de privacidad" },
];

const arrSocialLinks = [
  {
    strHref: "https://www.facebook.com/share/1Fgy1caBsd/",
    strAriaLabel: "Facebook",
    strImgSrc: "https://res.cloudinary.com/dj1mlj3vz/image/upload/v1774561359/facebook-svgrepo-com_hy7ihi.svg",
    strImgAlt: "Facebook icon",
    strImgClasses: "h-12 w-12",
    objStyle: { transform: "scale(1.12)" },
  },
  {
    strHref: "https://www.instagram.com/propbol.inmo/",
    strAriaLabel: "Instagram",
    strImgSrc: "https://res.cloudinary.com/dj1mlj3vz/image/upload/v1774561338/instagram-svgrepo-com_lcvpan.svg",
    strImgAlt: "Instagram icon",
    strImgClasses: "h-10 w-10",
  },
  {
    strHref: "https://www.tiktok.com/@propbolinmo",
    strAriaLabel: "TikTok",
    strImgSrc: "https://res.cloudinary.com/dj1mlj3vz/image/upload/v1774561358/brand-tiktok-svgrepo-com_y0fovq.svg",
    strImgAlt: "TikTok icon",
    strImgClasses: "h-8 w-8",
    objStyle: { transform: "scale(1.12)" },
  },
];

/**
 * Author: Maicol Ismael Nina Zarate
 * Date: 26/03/2026
 * Description: Footer component for frontend pages with internal navigation,
 * legal access links, social media links and home redirection through the logo.
 * @return Footer component rendered at the bottom of frontend pages.
 */
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[#C4BAA8] bg-[#E7E1D7]">
      <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-10 px-6 py-10 md:grid-cols-[1.55fr_0.95fr_0.95fr] md:gap-16 md:px-10 lg:gap-24 xl:max-w-[1650px] xl:grid-cols-[1.8fr_1fr_1fr] xl:px-16 2xl:px-24">
        
        <div className="flex items-start">
          <Link
            href="/"
            aria-label="Go to home page"
            className="inline-flex rounded-sm transition-all duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3A4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E1D7]"
          >
            <img
              src="/logo-principal.svg"
              alt="Portal logo"
              className="h-10 w-auto object-contain lg:h-6 xl:h-8 2xl:h-12"
            />
          </Link>
        </div>

        <div className="md:pl-6 lg:pl-10 xl:pl-16">
          <h3 className="mb-4 text-lg font-semibold text-[#2E2E2E]">
            Explorar
          </h3>
          <ul className="space-y-2 text-[15px] text-[#2E2E2E]">
            {arrExploreLinks.map((objLink) => (
              <li key={objLink.strLabel}>
                <Link href={objLink.strHref} className={strBaseLinkClasses}>
                  {objLink.strLabel}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:pl-4 lg:pl-8 xl:pl-12">
          <h3 className="mb-4 text-lg font-semibold text-[#2E2E2E]">
            Información
          </h3>
          <ul className="space-y-2 text-[15px] text-[#2E2E2E]">
            {arrInfoLinks.map((objLink) => (
              <li key={objLink.strLabel}>
                <Link href={objLink.strHref} className={strBaseLinkClasses}>
                  {objLink.strLabel}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-[#C4BAA8]">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col items-center justify-center gap-5 px-6 py-6 md:flex-row md:px-10 xl:max-w-[1650px] xl:px-16 2xl:px-24">
          <span className="text-base text-[#4E4E4E]">Síguenos:</span>

          <div className="flex items-center gap-6">
            {arrSocialLinks.map((objSocial) => (
              <a
                key={objSocial.strAriaLabel}
                href={objSocial.strHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={objSocial.strAriaLabel}
                className={strSocialBtnClasses}
              >
                <img
                  src={objSocial.strImgSrc}
                  alt={objSocial.strImgAlt}
                  className={objSocial.strImgClasses}
                  style={objSocial.objStyle}
                  loading="lazy"
                />
              </a>
            ))}
          </div>

          <span className="text-base text-[#2E2E2E]">© 2026 PROPBOL</span>
        </div>
      </div>
    </footer>
  );
}