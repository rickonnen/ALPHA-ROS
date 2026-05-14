import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { useHoverAnimation } from "@/components/hooks/useHoverAnimation";
/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 09/05/2026
 * funcionalidad: los botones de navegación inferior 
 * para volver a la página de inicio o al listado general de blogs
 */
export default function BlogNavigationLinks() {
  const strBtnHoverClassesBlo = useHoverAnimation(false, false, 'pointer', true, true);
  
  return (
    <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 pt-8 border-t border-border/50">
      <Link 
        href="/"
        className={`flex items-center justify-center gap-2 px-8 py-3 bg-secondary text-secondary-foreground text-text-base rounded-xl font-semibold shadow-sm w-full sm:w-auto ${strBtnHoverClassesBlo}`}
      >
        <Home className="w-5 h-5" />
        Volver al inicio
      </Link>

      <Link 
        href="/home/blogs"
        className={`flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-text-base rounded-xl font-semibold shadow-sm w-full sm:w-auto ${strBtnHoverClassesBlo}`}
      >
        <ArrowLeft className="w-5 h-5" />
        Todos los blogs
      </Link>
    </div>
  );
}