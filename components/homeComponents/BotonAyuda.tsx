import Link from 'next/link';

export default function HelpButton() {
  // ¡El return es lo que evita el error "void"!
  return (
    <Link 
      href="/ayuda" 
      title="Ir al Centro de Ayuda"
      className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-primary/90 text-primary-foreground backdrop-blur-md transition-all duration-300 hover:bg-primary hover:brightness-90 hover:scale-105 shadow-lg group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <svg 
        className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-xs transition-all duration-500 overflow-hidden whitespace-nowrap">
        Guía de Ayuda
      </span>
    </Link>
  );
}