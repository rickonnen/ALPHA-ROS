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

interface NavLink {
  strHref: string;
  strLabel: string;
  strValue: string;
}

interface MobileMenuProps {
  // para el control de useclickoutside
  menuRef: React.RefObject<HTMLDivElement | null>;
  // estado de visibilidad del menú
  isOpen: boolean;
  onClose: () => void;
  // datos del usuario autenticado
  objUser: any;
  // nombre de usuario formateado para mostrar en el perfil
  strNombreHeader: string;
  // url de la imagen de perfil del usuario
  strFotoPerfil: string;
  // enlaces dinámicos venta, alquiler, etc
  arrNavLinks: NavLink[];
  // modal de login 
  onLoginClick: () => void;
  onPublicarClick: () => void;
  // navegar a perfil con validación
  onProfileClick: () => void;
  // navegar a planes de cobro
  onPlansClick: () => void;
  onNavigate: (link: NavLink) => void;
  //validación de límites de publicación
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
  strLinkClassesMobile,
}: MobileMenuProps) => {

  // si el menú no está abierto, no se monta para ahorro de recursos
  if (!isOpen) return null;

  return (
    <>
      {/* permite cerrar el menú al tocar cualquier área fuera del panel */}
      <div 
        className="lg:hidden fixed inset-0 z-40 bg-black/20" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      {/* panel de navegación movil */}
      <nav
        ref={menuRef}
        aria-label="menú móvil"
        className="lg:hidden absolute top-18 left-0 w-full bg-primary text-primary-foreground shadow-xl flex flex-col px-8 py-6 z-50 animate-in slide-in-from-top-2"
        onClick={(e) => e.stopPropagation()} // evita que clics internos cierren el menú
      >
        
        {/* muestra perfil o iniciar sesión */}
        {objUser ? (
          <button 
            onClick={onProfileClick} 
            className={`flex items-center gap-4 pb-12 w-full text-left uppercase ${strLinkClassesMobile}`}
          >
            <Image 
              src={strFotoPerfil || "/account_avatar.svg"} 
              alt="perfil" 
              width={28} 
              height={28} 
              className="w-7 h-7 object-cover rounded-full bg-primary-foreground/20" 
              unoptimized={true} 
              onError={(e) => { 
                e.currentTarget.src = "/account_avatar.svg"; 
                e.currentTarget.srcset = "/account_avatar.svg"; 
              }} 
            />
            <span className="font-semibold">{strNombreHeader}</span>
          </button>
        ) : (
          <button 
            onClick={onLoginClick} 
            className={`flex items-center gap-4 pb-12 w-full text-left uppercase ${strLinkClassesMobile}`}
          >
            <div className="relative flex items-center justify-center">
              <Image 
                src="/account_avatar.svg" 
                alt="iniciar sesión" 
                width={28} 
                height={28} 
                className="w-7 h-7 object-contain brightness-0 invert" 
              />
              <div className="absolute w-[120%] h-[2px] bg-background rotate-45 rounded-full" />
            </div>
            <span className="font-semibold">iniciar sesión</span>
          </button>
        )}

        {/* acciones principales */}
        <div className="flex flex-col gap-6">
          
          {/* publicar */}
          <button 
            onClick={onPublicarClick} 
            disabled={bolIsCheckingLimit || bolIsAuthLoading} 
            className={`border-b border-primary-foreground/10 pb-4 w-full text-left uppercase disabled:opacity-60 ${strLinkClassesMobile}`}
          >
            {bolIsCheckingLimit ? "verificando..." : "publicar"}
          </button>

          {/* planes */}
          <button 
            onClick={onPlansClick} 
            className={`text-left border-b border-primary-foreground/10 pb-4 uppercase w-full cursor-pointer ${strLinkClassesMobile}`}
          >
            planes de publicación
          </button>

          {/* venta, alquiler, anticrético */}
          {arrNavLinks.map((objLink) => (
            <button 
              key={objLink.strLabel} 
              onClick={() => onNavigate(objLink)} 
              className={`text-left border-b border-primary-foreground/10 pb-4 uppercase w-full ${strLinkClassesMobile}`}
            >
              {objLink.strLabel}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};