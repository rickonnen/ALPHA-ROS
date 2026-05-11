/**
 * Dev: Rodrigo Saul Zarate Villarroel      Fecha: 12/04/2026
 * funcionalidad: Componente de presentación para el menú lateral en dispositivos móviles
 * se encarga exclusivamente de la UI móvil y delega las acciones al componente padre
 * (Se agregó menuRef para evitar que el click fuera del componente cierre el menú antes de navegar)
 * @param menuRef Referencia al elemento nav para el control de clics externos
 * @param isOpen booleano que determina si el menú está visible
 * @param onClose función para cerrar el menú
 * @param objUser datos del usuario autenticado para mostrar su perfil o el login
 * @param strNombreHeader nombre formateado del usuario
 * @param strFotoPerfil URL de la foto de perfil del usuario
 * @param arrNavLinks arreglo con los enlaces de navegación principales
 * @param onLoginClick función para abrir el modal de inicio de sesión
 * @param onPublicarClick función para iniciar el flujo de publicación
 * @param onProfileClick función para navegar al perfil del usuario
 * @param onPlansClick función para navegar a la vista de planes
 * @param onNavigate función para navegar a una ruta específica con filtros
 * @param bolIsCheckingLimit estado de carga al verificar límites de publicación
 * @param bolIsAuthLoading carga de la autenticación
 * @param strLinkClassesMobile clases base de Tailwind para estilizar los botones del menú
 * @return elemento JSX con el panel lateral móvil
 */
"use client";

import Image from "next/image";
import { useHoverAnimation } from "../../hooks/useHoverAnimation";

interface NavLink {
  strHref: string;
  strLabel: string;
  strValue: string;
}

interface MobileMenuProps {
  menuRef: React.RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  onClose: () => void;
  objUser: any;
  strNombreHeader: string;
  strFotoPerfil: string;
  arrNavLinks: NavLink[];
  onLoginClick: () => void;
  onPublicarClick: () => void;
  onProfileClick: () => void;
  onPlansClick: () => void;
  onNavigate: (link: NavLink) => void;
  bolIsCheckingLimit: boolean;
  bolIsAuthLoading: boolean;
  strLinkClassesMobile: string;
}

export const MobileMenu = ({
  menuRef,
  isOpen,
  onClose,
  objUser,
  strNombreHeader,
  strFotoPerfil,
  arrNavLinks,
  onLoginClick,
  onPublicarClick,
  onProfileClick,
  onPlansClick,
  onNavigate,
  bolIsCheckingLimit,
  bolIsAuthLoading,
}: MobileMenuProps) => {

  // hook de animación: solo color de letra, sin aura (glow) y sin crecer (scale)
  const optionHover = useHoverAnimation(true, false, 'pointer', true, false);

  // si el menú no está abierto, no se monta para ahorro de recursos
  if (!isOpen) return null;

  return (
    <>
      {/* SE ELIMINÓ EL DIV INVISIBLE: El hook useClickOutside del Header ahora gestiona esto sin interferencias */}

      {/* panel de navegación movil posición derecha rectangulares */}
      <nav
        ref={menuRef}
        aria-label="menú móvil"
        className="lg:hidden absolute top-[4.5rem] right-0 w-full landscape:w-[35%] h-[calc(100vh-4.5rem)] overflow-y-auto bg-primary text-primary-foreground shadow-2xl flex flex-col px-8 py-8 z-50 animate-in slide-in-from-right-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary-foreground/20 hover:[&::-webkit-scrollbar-thumb]:bg-primary-foreground/40 [&::-webkit-scrollbar-thumb]:rounded-full"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* cabecera centrada: muestra perfil o iniciar sesión */}
        {objUser ? (
          <button 
            onClick={onProfileClick} 
            className={`flex flex-col items-center justify-center gap-2 w-full pb-8 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-primary ${optionHover}`}
          >
            <div className="p-1 bg-primary-foreground/10 rounded-full">
              <Image 
                src={strFotoPerfil || "/account_avatar.svg"} 
                alt="perfil" 
                width={80} 
                height={80} 
                className="w-20 h-20 object-cover rounded-full bg-primary-foreground/20" 
                unoptimized={true} 
                onError={(e) => { 
                  e.currentTarget.src = "/account_avatar.svg"; 
                  e.currentTarget.srcset = "/account_avatar.svg"; 
                }} 
              />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-bold text-xl tracking-wide">{strNombreHeader}</span>
              <span className="text-sm opacity-70 normal-case">ver mi perfil</span>
            </div>
          </button>
        ) : (
          <button 
            onClick={onLoginClick} 
            className={`flex flex-col items-center justify-center gap-2 w-full pb-8 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-primary ${optionHover}`}
          >
            <div className="p-1 bg-primary-foreground/10 rounded-full">
              <div className="relative flex items-center justify-center w-20 h-20 bg-primary-foreground/10 rounded-full">
                <Image 
                  src="/account_avatar.svg" 
                  alt="iniciar sesión" 
                  width={40} 
                  height={40} 
                  className="w-10 h-10 object-contain brightness-0 invert opacity-80" 
                />
                <div className="absolute w-[110%] h-[0.125rem] bg-primary-foreground rotate-45 rounded-full opacity-80" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 mt-2">
              <span className="font-bold text-xl tracking-wide uppercase">iniciar sesión</span>
              <span className="text-sm opacity-70 normal-case">accede a tu cuenta</span>
            </div>
          </button>
        )}

        {/* lista de acciones principales */}
        <div className="flex flex-col gap-3 mt-2">
          
          {/* publicar */}
          <button 
            onClick={onPublicarClick} 
            disabled={bolIsCheckingLimit || bolIsAuthLoading} 
            className={`flex items-center gap-4 py-3 px-2 w-full text-left uppercase font-medium disabled:opacity-60 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-primary ${optionHover}`}
          >
            <Image 
              src="/plus.svg" 
              alt="publicar" 
              width={20} 
              height={20} 
              className="w-5 h-5 object-contain brightness-0 invert opacity-80" 
            />
            {bolIsCheckingLimit ? "verificando..." : "publicar"}
          </button>

          {/* planes */}
          <button 
            onClick={onPlansClick} 
            className={`flex items-center gap-4 py-3 px-2 w-full text-left uppercase font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-primary ${optionHover}`}
          >
            <Image 
              src="/dollar.svg" 
              alt="planes" 
              width={20} 
              height={20} 
              className="w-5 h-5 object-contain brightness-0 invert opacity-80" 
            />
            planes de publicación
          </button>
          <div className="h-4" />

          {/* venta, alquiler, anticrético */}
          {arrNavLinks.map((objLink) => (
            <button 
              key={objLink.strLabel} 
              onClick={() => onNavigate(objLink)} 
              className={`flex items-center gap-4 py-3 px-2 w-full text-left uppercase font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-primary ${optionHover}`}
            >
              <Image 
                src="/house.svg" 
                alt={objLink.strLabel} 
                width={20} 
                height={20} 
                className="w-5 h-5 object-contain brightness-0 invert opacity-80" 
              />
              {objLink.strLabel}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};